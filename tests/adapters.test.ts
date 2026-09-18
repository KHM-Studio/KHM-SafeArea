import { describe, expect, it } from "vitest";
import { safeAreaClasses } from "../src/adapters/classes.js";

describe("adapter classes", () => {
  it("maps directional props without framework state", () => {
    expect(safeAreaClasses({ top: true, bottom: true }, "shell")).toBe(
      "shell khm-safe-top khm-safe-bottom"
    );
    expect(safeAreaClasses({ all: true })).toBe("khm-safe-all");
  });
});
