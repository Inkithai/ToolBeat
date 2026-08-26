/**
 * JSON Schema validation with ajv (draft-07 by default), imported dynamically
 * so only the validator page carries the chunk. Common formats (email, uri,
 * date, …) come from ajv-formats.
 */

export type SchemaValidation = {
  valid: boolean;
  /** Set when the JSON document itself fails to parse. */
  documentError?: string;
  /** Set when the schema fails to parse or does not compile. */
  schemaError?: string;
  /** Human-readable validation failures (empty when valid). */
  errors: string[];
};

type AjvError = {
  instancePath?: string;
  message?: string;
  params?: Record<string, unknown>;
};

type AjvLike = {
  compile(schema: unknown): { (data: unknown): boolean; errors: AjvError[] | null | undefined };
};

function describeError(error: {
  instancePath?: string;
  message?: string;
  params?: Record<string, unknown>;
}): string {
  const path = error.instancePath || "(root)";
  let detail = error.message ?? "is invalid";
  const params = error.params ?? {};
  if (params.additionalProperty !== undefined) {
    detail = `${detail} ("${String(params.additionalProperty)}")`;
  } else if (Array.isArray(params.allowedValues) && params.allowedValues.length > 0) {
    const values = params.allowedValues.map((value) => JSON.stringify(value)).join(", ");
    detail = `${detail} (${values})`;
  }
  return `${path}: ${detail}`;
}

export async function validateJsonAgainstSchema(
  document: string,
  schemaText: string,
): Promise<SchemaValidation> {
  let schema: unknown;
  try {
    schema = JSON.parse(schemaText);
  } catch (error) {
    return {
      valid: false,
      schemaError: `Schema is not valid JSON — ${error instanceof Error ? error.message : "parse error"}.`,
      errors: [],
    };
  }

  let data: unknown;
  try {
    data = JSON.parse(document);
  } catch (error) {
    return {
      valid: false,
      documentError: `JSON document is not valid JSON — ${error instanceof Error ? error.message : "parse error"}.`,
      errors: [],
    };
  }

  const [{ default: Ajv }, { default: addFormats }] = await Promise.all([
    import("ajv"),
    import("ajv-formats"),
  ]);
  const ajv = new Ajv({ allErrors: true, strict: false, allowUnionTypes: true }) as AjvLike;
  addFormats(ajv as never);

  let validate: { (data: unknown): boolean; errors?: AjvError[] | null };
  try {
    validate = ajv.compile(schema);
  } catch (error) {
    return {
      valid: false,
      schemaError: `The schema does not compile — ${error instanceof Error ? error.message : "unknown error"}.`,
      errors: [],
    };
  }

  const ok = validate(data);
  if (ok) return { valid: true, errors: [] };
  return {
    valid: false,
    errors: (validate.errors ?? []).map(describeError).slice(0, 20),
  };
}
