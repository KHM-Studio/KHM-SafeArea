import { afterEach, describe, expect, it, vi } from "vitest";

const autoKey = Symbol.for("@khm-studio/safearea/auto");

afterEach(() => {
  const scope = globalThis as Record<symbol, unknown>;
  const controller = scope[autoKey] as { stop?: () => void } | undefined;
  controller?.stop?.();
  delete scope[autoKey];
  vi.resetModules();
});

describe("auto entry", () => {
  it("reuses one global controller across repeated module evaluation", async () => {
    document.head.innerHTML =
      '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">';
    const first = await import("../src/auto.js");
    vi.resetModules();
    const second = await import("../src/auto.js");

    expect(first.autoSafeArea).toBeDefined();
    expect(second.autoSafeArea).toBe(first.autoSafeArea);
    expect(first.autoSafeArea?.started).toBe(true);
  });
});
