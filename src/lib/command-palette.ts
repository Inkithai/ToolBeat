/**
 * One search system, several entry points.
 *
 * The hero, the header, the closing CTA and Ctrl/⌘K all dispatch this event.
 * `CommandPalette` is the only UI that actually searches.
 */

export const COMMAND_PALETTE_EVENT = "convertlab:open-command-palette";

export type CommandPaletteDetail = {
  query?: string;
};

export function openCommandPalette(query = ""): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<CommandPaletteDetail>(COMMAND_PALETTE_EVENT, {
      detail: { query },
    }),
  );
}

export function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent) || navigator.platform === "MacIntel";
}
