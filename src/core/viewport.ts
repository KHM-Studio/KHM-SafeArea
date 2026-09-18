import type { ViewportState } from "../types.js";

export function readViewport(): ViewportState {
  if (typeof window === "undefined") {
    return {
      width: 0,
      height: 0,
      visibleWidth: 0,
      visibleHeight: 0,
      offsetTop: 0,
      offsetLeft: 0,
      scale: 1
    };
  }

  const visual = window.visualViewport;
  return {
    width: Math.max(0, window.innerWidth),
    height: Math.max(0, window.innerHeight),
    visibleWidth: Math.max(0, visual?.width ?? window.innerWidth),
    visibleHeight: Math.max(0, visual?.height ?? window.innerHeight),
    offsetTop: Math.max(0, visual?.offsetTop ?? 0),
    offsetLeft: Math.max(0, visual?.offsetLeft ?? 0),
    scale: visual?.scale ?? 1
  };
}
