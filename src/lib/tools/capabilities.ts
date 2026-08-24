import type { ToolCapabilities, ToolDefinition } from "./types";

/**
 * Turns capability data into the copy shown to users.
 *
 * Previously the app asserted "Everything runs in your browser" and "Nothing
 * uploads to a server" as fixed strings in five files. Those claims happened to
 * be true, but nothing kept them true: adding one server-backed tool would have
 * made the footer lie on every page. Here the claims are computed from what the
 * tools actually declare.
 */

export type CapabilityBadge = {
  id: string;
  label: string;
  /** Longer explanation, surfaced as a tooltip/title attribute. */
  detail: string;
  tone: "positive" | "neutral";
};

export function getCapabilityBadges(capabilities: ToolCapabilities): CapabilityBadge[] {
  const badges: CapabilityBadge[] = [];

  badges.push(
    capabilities.processing === "on-device"
      ? {
          id: "processing",
          label: "Runs in your browser",
          detail: "This tool processes your input on your device. The file is not uploaded.",
          tone: "positive",
        }
      : {
          id: "processing",
          label: "Server-processed",
          detail: "This tool sends your input to a server to complete the conversion.",
          tone: "neutral",
        }
  );

  if (capabilities.requiresNetwork) {
    badges.push({
      id: "network",
      label: "Needs a connection",
      detail: "This tool makes network requests while it runs, so it needs to be online.",
      tone: "neutral",
    });
  }

  if (capabilities.persistence === "preferences") {
    badges.push({
      id: "persistence",
      label: "Remembers settings",
      detail: "Your preferences for this tool are saved in this browser. Your input is not.",
      tone: "neutral",
    });
  }

  if (typeof capabilities.maxFileSizeMb === "number") {
    badges.push({
      id: "limit",
      label: `Up to ${capabilities.maxFileSizeMb} MB`,
      detail: `Files larger than ${capabilities.maxFileSizeMb} MB are rejected before processing starts.`,
      tone: "neutral",
    });
  }

  return badges;
}

/**
 * Aggregate claim for shared surfaces (footer, landing page, directory).
 *
 * Deliberately narrows itself: the strong sentence is only produced when every
 * tool genuinely qualifies. The alternative — a hand-written global promise —
 * is the failure mode this replaces.
 */
export function describePlatformProcessing(tools: readonly ToolDefinition[]): string {
  const total = tools.length;
  const onDevice = tools.filter((tool) => tool.capabilities.processing === "on-device").length;

  if (total === 0) return "No tools are available yet.";
  if (onDevice === total) return "Every tool runs in your browser. Your files are not uploaded to a server.";
  if (onDevice === 0) return "These tools process your input on a server.";
  return `${onDevice} of ${total} tools run entirely in your browser; the rest process your input on a server.`;
}

/** Short variant for badges and metadata descriptions. */
export function describePlatformProcessingShort(tools: readonly ToolDefinition[]): string {
  const allOnDevice = tools.every((tool) => tool.capabilities.processing === "on-device");
  return allOnDevice ? "Private & browser-based" : "Mixed browser and server processing";
}
