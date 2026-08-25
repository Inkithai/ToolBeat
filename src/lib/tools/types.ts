import type { CategoryKey, ConversionType } from "@/constants/app";

/**
 * The platform type layer.
 *
 * ToolBeat's original `ConversionDefinition` requires `from`, `to`,
 * `fromFormat`, `toFormat`, `acceptedExtensions` and `outputExtension`. Those
 * fields are correct for a converter and meaningless for a stopwatch, so they
 * cannot be the shape that discovery, routing and metadata code depends on.
 *
 * `ToolDefinition` is the supertype those surfaces use. Converters keep every
 * field they already had — `ConversionTool` carries them in a `conversion`
 * payload rather than losing them.
 */

/**
 * How a tool is operated. This drives which UI shell a tool renders, and it is
 * the reason a single universal tool component would be wrong: these four
 * kinds have genuinely different interaction models.
 */
export type ToolKind =
  /** Accepts an uploaded file, produces a downloadable file. */
  | "file-conversion"
  /** Text in, text out; no file required. */
  | "text"
  /** Structured inputs producing a computed value. */
  | "calculator"
  /** Runs over time and owns a ticking clock. */
  | "timer";

/**
 * Where a tool's work happens.
 *
 * Recorded per tool rather than asserted globally. Today every tool is
 * `on-device`, but that is a property of each implementation, not a guarantee
 * of the platform — the moment one tool calls an API, the shared copy that
 * claims otherwise must stop claiming it. Aggregate claims are derived from
 * these values (see `describePlatformProcessing`) so they cannot go stale.
 */
export type ProcessingLocation = "on-device" | "server";

/**
 * What a tool keeps between visits. Anything other than `none` is user-visible
 * and must be stated, because "nothing is stored" is otherwise implied.
 */
export type PersistenceLevel =
  /** Nothing survives a reload. */
  | "none"
  /** Non-sensitive preferences only, in localStorage. Never tool input. */
  | "preferences";

export type ToolCapabilities = {
  processing: ProcessingLocation;
  /**
   * True when the tool performs network requests while running. Distinct from
   * `processing`: a tool could compute locally and still call out for fonts or
   * data. Verified by inspection, not assumed.
   */
  requiresNetwork: boolean;
  persistence: PersistenceLevel;
  /**
   * Largest accepted input in megabytes, for tools that take a file. Undefined
   * for tools that take no file.
   */
  maxFileSizeMb?: number;
};

export type ToolDefinitionBase = {
  /** URL-safe identifier, unique across the platform. */
  slug: string;
  /** Short human name used in cards, headings and search. */
  name: string;
  /** One sentence describing what the tool does. Used in UI and metadata. */
  summary: string;
  /** Exactly one platform category, for primary navigation. */
  category: CategoryKey;
  /**
   * Free-form cross-cutting labels (`pdf`, `markdown`, `time`). A tool belongs
   * to one category but can carry many tags, which is what makes "show me
   * everything PDF-related" possible without inventing a category per format.
   */
  tags: readonly string[];
  /** Path this tool is reachable at. */
  href: string;
  capabilities: ToolCapabilities;
};

/**
 * A converter. The `conversion` payload is the untouched original definition,
 * so nothing that already reads those fields loses information.
 */
export type ConversionTool = ToolDefinitionBase & {
  kind: "file-conversion";
  conversionType: ConversionType;
  conversion: {
    from: string;
    to: string;
    fromFormat: string;
    toFormat: string;
    acceptedExtensions: readonly string[];
    outputExtension: string;
  };
};

/** Any tool that is not a file converter. */
export type UtilityTool = ToolDefinitionBase & {
  kind: Exclude<ToolKind, "file-conversion">;
};

export type ToolDefinition = ConversionTool | UtilityTool;

export function isConversionTool(tool: ToolDefinition): tool is ConversionTool {
  return tool.kind === "file-conversion";
}
