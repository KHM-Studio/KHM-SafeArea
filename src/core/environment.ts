export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function isStandalone(): boolean {
  if (!isBrowser()) return false;

  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return (
    navigatorWithStandalone.standalone === true ||
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    window.matchMedia?.("(display-mode: fullscreen)").matches === true
  );
}

export function isFullscreen(): boolean {
  return isBrowser() && document.fullscreenElement !== null;
}

export function shouldWarnInDevelopment(): boolean {
  if (!isBrowser()) return false;
  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

export function warnIfViewportFitIsMissing(): void {
  if (!isBrowser()) return;
  const viewport = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
  const content = viewport?.content.toLowerCase() ?? "";

  if (!content.includes("viewport-fit=cover")) {
    console.warn(
      "[KHM SafeArea] Add viewport-fit=cover to the existing viewport meta tag to expose native safe-area insets. The tag was not modified."
    );
  }
}
