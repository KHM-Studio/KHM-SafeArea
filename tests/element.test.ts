import { describe, expect, it } from "vitest";

describe("custom element", () => {
  it("registers once, preserves consumer classes, and reflects boolean attributes", async () => {
    const auto = await import("../src/element/auto.js");
    const { defineSafeAreaElement, KhmSafeAreaElement } = await import("../src/element/index.js");

    expect(auto.safeAreaElementDefined).toBe(true);
    expect(customElements.get("khm-safe-area")).toBe(KhmSafeAreaElement);
    expect(defineSafeAreaElement()).toBe(false);

    const element = document.createElement("khm-safe-area");
    element.classList.add("consumer-shell");
    element.setAttribute("top", "");
    element.setAttribute("x", "anything");
    document.body.append(element);

    expect(element.classList.contains("consumer-shell")).toBe(true);
    expect(element.classList.contains("khm-safe-top")).toBe(true);
    expect(element.classList.contains("khm-safe-x")).toBe(true);
    expect(element.shadowRoot).toBeNull();

    element.removeAttribute("top");
    expect(element.classList.contains("khm-safe-top")).toBe(false);
    expect(element.classList.contains("consumer-shell")).toBe(true);
  });
});
