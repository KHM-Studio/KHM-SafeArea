import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSafeArea } from "../src/index.js";

class FakeVisualViewport extends EventTarget {
  width = 390;
  height = 800;
  offsetTop = 0;
  offsetLeft = 0;
  scale = 1;
  listeners = 0;

  override addEventListener(...args: Parameters<EventTarget["addEventListener"]>): void {
    this.listeners += 1;
    super.addEventListener(...args);
  }

  override removeEventListener(...args: Parameters<EventTarget["removeEventListener"]>): void {
    this.listeners -= 1;
    super.removeEventListener(...args);
  }
}

let visual: FakeVisualViewport;

function setViewport(width: number, height: number): void {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: height });
  visual.width = width;
  visual.height = height;
}

beforeEach(() => {
  document.head.innerHTML =
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">';
  document.body.innerHTML = "";
  document.documentElement.removeAttribute("style");
  visual = new FakeVisualViewport();
  Object.defineProperty(window, "visualViewport", { configurable: true, value: visual });
  setViewport(390, 800);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createSafeArea", () => {
  it("starts idempotently and publishes CSS variables", () => {
    const safeArea = createSafeArea({ warnOnMissingViewportFit: false });
    expect(safeArea.started).toBe(false);
    expect(safeArea.start()).toBe(safeArea);
    safeArea.start();

    expect(safeArea.started).toBe(true);
    expect(document.documentElement.style.getPropertyValue("--khm-viewport-height")).toBe("800px");
    expect(visual.listeners).toBe(2);
    safeArea.stop();
    expect(visual.listeners).toBe(0);
  });

  it("restores pre-existing inline variables on stop", () => {
    document.documentElement.style.setProperty("--khm-visible-height", "77px", "important");
    const safeArea = createSafeArea({ warnOnMissingViewportFit: false }).start();
    expect(document.documentElement.style.getPropertyValue("--khm-visible-height")).toBe("800px");
    safeArea.stop();
    expect(document.documentElement.style.getPropertyValue("--khm-visible-height")).toBe("77px");
    expect(document.documentElement.style.getPropertyPriority("--khm-visible-height")).toBe(
      "important"
    );
  });

  it("subscribes, unsubscribes and emits viewport events", async () => {
    const root = document.documentElement;
    const subscriber = vi.fn();
    const eventListener = vi.fn();
    root.addEventListener("khm:viewport-change", eventListener);
    const safeArea = createSafeArea({ root, warnOnMissingViewportFit: false }).start();
    const unsubscribe = safeArea.subscribe(subscriber);

    setViewport(844, 390);
    window.dispatchEvent(new Event("resize"));
    await vi.waitFor(() => expect(subscriber).toHaveBeenCalledTimes(1));
    expect(eventListener).toHaveBeenCalledTimes(1);
    expect(safeArea.getState().orientation).toBe("landscape");

    unsubscribe();
    setViewport(800, 400);
    window.dispatchEvent(new Event("resize"));
    await new Promise((resolve) => setTimeout(resolve, 25));
    expect(subscriber).toHaveBeenCalledTimes(1);
    safeArea.stop();
    root.removeEventListener("khm:viewport-change", eventListener);
  });

  it("detects keyboard opening and closing without duplicate listeners", async () => {
    const input = document.createElement("input");
    document.body.append(input);
    const open = vi.fn();
    const close = vi.fn();
    document.documentElement.addEventListener("khm:keyboard-open", open);
    document.documentElement.addEventListener("khm:keyboard-close", close);
    const safeArea = createSafeArea({ warnOnMissingViewportFit: false }).start();

    input.focus();
    visual.height = 480;
    visual.dispatchEvent(new Event("resize"));
    await vi.waitFor(() => expect(safeArea.getState().keyboard.open).toBe(true));
    expect(safeArea.getState().keyboard.height).toBe(320);
    expect(open).toHaveBeenCalledOnce();

    input.blur();
    visual.height = 800;
    visual.dispatchEvent(new Event("resize"));
    await vi.waitFor(() => expect(safeArea.getState().keyboard.open).toBe(false));
    expect(close).toHaveBeenCalledOnce();
    safeArea.stop();
  });

  it("is safe to construct and call when window is unavailable", () => {
    const currentWindow = globalThis.window;
    vi.stubGlobal("window", undefined);
    const safeArea = createSafeArea();
    expect(() => safeArea.start().refresh().stop()).not.toThrow();
    expect(safeArea.getState().viewport.height).toBe(0);
    vi.stubGlobal("window", currentWindow);
  });
});
