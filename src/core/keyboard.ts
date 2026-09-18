import type { KeyboardState, ViewportState } from "../types.js";

interface VirtualKeyboardLike extends EventTarget {
  readonly boundingRect?: DOMRectReadOnly;
}

interface NavigatorWithVirtualKeyboard extends Navigator {
  readonly virtualKeyboard?: VirtualKeyboardLike;
}

export function getVirtualKeyboard(): VirtualKeyboardLike | undefined {
  if (typeof navigator === "undefined") return undefined;
  return (navigator as NavigatorWithVirtualKeyboard).virtualKeyboard;
}

export function hasEditableFocus(): boolean {
  if (typeof document === "undefined") return false;

  let active: Element | null = document.activeElement;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
  if (!(active instanceof HTMLElement)) return false;

  if (active.isContentEditable) return true;
  if (active instanceof HTMLTextAreaElement) return !active.disabled && !active.readOnly;
  if (!(active instanceof HTMLInputElement) || active.disabled || active.readOnly) return false;

  return ![
    "button",
    "checkbox",
    "color",
    "file",
    "hidden",
    "image",
    "radio",
    "range",
    "reset",
    "submit"
  ].includes(active.type);
}

export interface KeyboardMeasurement {
  readonly viewport: ViewportState;
  readonly baselineHeight: number;
  readonly threshold: number;
  readonly editableFocused: boolean;
  readonly virtualKeyboardHeight?: number;
}

export function detectKeyboard(measurement: KeyboardMeasurement): KeyboardState {
  const { viewport, baselineHeight, editableFocused } = measurement;
  if (!editableFocused || Math.abs(viewport.scale - 1) > 0.02) {
    return { open: false, height: 0 };
  }

  const viewportOcclusion = Math.max(
    0,
    viewport.height - viewport.visibleHeight - viewport.offsetTop
  );
  const baselineReduction = Math.max(0, baselineHeight - viewport.visibleHeight);
  const virtualKeyboardHeight = Math.max(0, measurement.virtualKeyboardHeight ?? 0);
  const height = Math.round(Math.max(viewportOcclusion, baselineReduction, virtualKeyboardHeight));
  const adaptiveThreshold = Math.max(measurement.threshold, baselineHeight * 0.15);

  return height >= adaptiveThreshold ? { open: true, height } : { open: false, height: 0 };
}
