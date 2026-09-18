import { describe, expect, it } from "vitest";
import { detectKeyboard } from "../src/core/keyboard.js";
import type { ViewportState } from "../src/types.js";

const viewport: ViewportState = {
  width: 390,
  height: 844,
  visibleWidth: 390,
  visibleHeight: 844,
  offsetTop: 0,
  offsetLeft: 0,
  scale: 1
};

describe("detectKeyboard", () => {
  it("requires editable focus", () => {
    expect(
      detectKeyboard({
        viewport: { ...viewport, visibleHeight: 500 },
        baselineHeight: 844,
        threshold: 120,
        editableFocused: false
      })
    ).toEqual({ open: false, height: 0 });
  });

  it("reports a large focused visual viewport reduction", () => {
    expect(
      detectKeyboard({
        viewport: { ...viewport, visibleHeight: 500 },
        baselineHeight: 844,
        threshold: 120,
        editableFocused: true
      })
    ).toEqual({ open: true, height: 344 });
  });

  it("ignores browser chrome-sized changes and pinch zoom", () => {
    expect(
      detectKeyboard({
        viewport: { ...viewport, visibleHeight: 780 },
        baselineHeight: 844,
        threshold: 120,
        editableFocused: true
      }).open
    ).toBe(false);
    expect(
      detectKeyboard({
        viewport: { ...viewport, visibleHeight: 400, scale: 2 },
        baselineHeight: 844,
        threshold: 120,
        editableFocused: true
      }).open
    ).toBe(false);
  });

  it("uses the VirtualKeyboard geometry when available", () => {
    expect(
      detectKeyboard({
        viewport,
        baselineHeight: 844,
        threshold: 120,
        editableFocused: true,
        virtualKeyboardHeight: 310
      })
    ).toEqual({ open: true, height: 310 });
  });
});
