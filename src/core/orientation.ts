import type { Orientation } from "../types.js";

export function readOrientation(width: number, height: number): Orientation {
  if (typeof screen !== "undefined" && screen.orientation?.type) {
    return screen.orientation.type.startsWith("landscape") ? "landscape" : "portrait";
  }
  return width > height ? "landscape" : "portrait";
}
