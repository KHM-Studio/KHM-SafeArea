import { createSafeArea } from "./core/safe-area.js";
import type { SafeAreaController } from "./types.js";

const AUTO_KEY = Symbol.for("@khm-studio/safearea/auto");
type GlobalWithSafeArea = typeof globalThis & { [AUTO_KEY]?: SafeAreaController };
const globalScope = globalThis as GlobalWithSafeArea;

export const autoSafeArea: SafeAreaController | undefined =
  typeof window === "undefined" ? undefined : (globalScope[AUTO_KEY] ??= createSafeArea().start());

export function getAutoSafeArea(): SafeAreaController | undefined {
  return autoSafeArea;
}

export default autoSafeArea;
