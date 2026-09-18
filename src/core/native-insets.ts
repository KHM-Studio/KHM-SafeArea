import type { Insets } from "../types.js";

const ZERO_INSETS: Insets = Object.freeze({ top: 0, right: 0, bottom: 0, left: 0 });

function pixels(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

export function readNativeInsets(): Insets {
  if (typeof document === "undefined" || !document.body) return ZERO_INSETS;

  const probe = document.createElement("div");
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText = [
    "position:fixed",
    "inset:0",
    "visibility:hidden",
    "pointer-events:none",
    "padding-top:env(safe-area-inset-top, 0px)",
    "padding-right:env(safe-area-inset-right, 0px)",
    "padding-bottom:env(safe-area-inset-bottom, 0px)",
    "padding-left:env(safe-area-inset-left, 0px)"
  ].join(";");

  document.body.append(probe);
  const style = getComputedStyle(probe);
  const insets: Insets = {
    top: pixels(style.paddingTop),
    right: pixels(style.paddingRight),
    bottom: pixels(style.paddingBottom),
    left: pixels(style.paddingLeft)
  };
  probe.remove();
  return insets;
}

export { ZERO_INSETS };
