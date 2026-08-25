/**
 * Renders a JSON-LD script tag.
 *
 * The `<` escaping matters even though today's payloads are static registry
 * data: `</script>` inside any string value would terminate the tag early,
 * and this component should stay safe for future data-driven payloads without
 * anyone having to remember that.
 */
export default function JsonLd({ data }: { data: Readonly<Record<string, unknown>> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      // Structured data is JSON, not markup — there is nothing to escape
      // beyond the `</script` sequence handled above.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
