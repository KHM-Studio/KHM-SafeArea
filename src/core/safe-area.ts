import { createDebugOverlay, type DebugOverlay } from "./debug.js";
import {
  isBrowser,
  isFullscreen,
  isStandalone,
  shouldWarnInDevelopment,
  warnIfViewportFitIsMissing
} from "./environment.js";
import {
  detectKeyboard,
  getVirtualKeyboard,
  hasEditableFocus,
  type KeyboardMeasurement
} from "./keyboard.js";
import { readNativeInsets, ZERO_INSETS } from "./native-insets.js";
import { readOrientation } from "./orientation.js";
import { readViewport } from "./viewport.js";
import type {
  Insets,
  KeyboardState,
  Orientation,
  SafeAreaChangeDetail,
  SafeAreaController,
  SafeAreaOptions,
  SafeAreaState,
  SafeAreaSubscriber,
  ViewportState
} from "../types.js";

type Cleanup = () => void;

const CSS_VARIABLES = [
  "--khm-safe-top",
  "--khm-safe-right",
  "--khm-safe-bottom",
  "--khm-safe-left",
  "--khm-viewport-width",
  "--khm-viewport-height",
  "--khm-visible-width",
  "--khm-visible-height",
  "--khm-keyboard-height",
  "--khm-keyboard-open",
  "--khm-offset-top",
  "--khm-offset-left",
  "--khm-viewport-scale",
  "--khm-orientation-landscape",
  "--khm-standalone"
] as const;

interface ResolvedOptions {
  safeArea: boolean;
  viewport: boolean;
  keyboard: boolean;
  orientation: boolean;
  debug: boolean;
  keyboardThreshold: number;
  root?: HTMLElement;
  warnOnMissingViewportFit: boolean;
}

interface SavedProperty {
  value: string;
  priority: string;
}

function initialState(): SafeAreaState {
  return freezeState({
    safeArea: ZERO_INSETS,
    viewport: readViewport(),
    keyboard: { open: false, height: 0 },
    orientation: "portrait",
    standalone: false,
    fullscreen: false
  });
}

function freezeState(state: SafeAreaState): SafeAreaState {
  Object.freeze(state.safeArea);
  Object.freeze(state.viewport);
  Object.freeze(state.keyboard);
  return Object.freeze(state);
}

function sameInsets(a: Insets, b: Insets): boolean {
  return a.top === b.top && a.right === b.right && a.bottom === b.bottom && a.left === b.left;
}

function sameViewport(a: ViewportState, b: ViewportState): boolean {
  return (
    a.width === b.width &&
    a.height === b.height &&
    a.visibleWidth === b.visibleWidth &&
    a.visibleHeight === b.visibleHeight &&
    a.offsetTop === b.offsetTop &&
    a.offsetLeft === b.offsetLeft &&
    a.scale === b.scale
  );
}

function sameKeyboard(a: KeyboardState, b: KeyboardState): boolean {
  return a.open === b.open && a.height === b.height;
}

function sameState(a: SafeAreaState, b: SafeAreaState): boolean {
  return (
    sameInsets(a.safeArea, b.safeArea) &&
    sameViewport(a.viewport, b.viewport) &&
    sameKeyboard(a.keyboard, b.keyboard) &&
    a.orientation === b.orientation &&
    a.standalone === b.standalone &&
    a.fullscreen === b.fullscreen
  );
}

function px(value: number): string {
  return `${Math.round(value * 100) / 100}px`;
}

function resolveOptions(options: SafeAreaOptions): ResolvedOptions {
  return {
    safeArea: options.safeArea ?? true,
    viewport: options.viewport ?? true,
    keyboard: options.keyboard ?? true,
    orientation: options.orientation ?? true,
    debug: options.debug ?? false,
    keyboardThreshold: Math.max(0, options.keyboardThreshold ?? 120),
    ...(options.root ? { root: options.root } : {}),
    warnOnMissingViewportFit: options.warnOnMissingViewportFit ?? true
  };
}

function dispatch(root: HTMLElement, name: string, detail: SafeAreaChangeDetail): void {
  root.dispatchEvent(new CustomEvent<SafeAreaChangeDetail>(name, { detail }));
}

export function createSafeArea(options: SafeAreaOptions = {}): SafeAreaController {
  const config = resolveOptions(options);
  const subscribers = new Set<SafeAreaSubscriber>();
  const cleanup: Cleanup[] = [];
  const savedProperties = new Map<string, SavedProperty>();
  const baselineByOrientation = new Map<Orientation, number>();
  let state = initialState();
  let active = false;
  let frame = 0;
  let debugOverlay: DebugOverlay | undefined;
  let root: HTMLElement | undefined;

  function listen(target: EventTarget | undefined, event: string, listener: EventListener): void {
    if (!target) return;
    target.addEventListener(event, listener, { passive: true });
    cleanup.push(() => target.removeEventListener(event, listener));
  }

  function schedule(): void {
    if (!active || frame !== 0) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      measure();
    });
  }

  function virtualKeyboardHeight(): number {
    return getVirtualKeyboard()?.boundingRect?.height ?? 0;
  }

  function nextKeyboard(viewport: ViewportState, orientation: Orientation): KeyboardState {
    if (!config.keyboard) return { open: false, height: 0 };

    const focused = hasEditableFocus();
    const knownBaseline = baselineByOrientation.get(orientation) ?? 0;
    const candidateBaseline = Math.max(knownBaseline, viewport.height, viewport.visibleHeight);
    if (!focused || state.orientation !== orientation) {
      baselineByOrientation.set(orientation, candidateBaseline);
    }

    const measurement: KeyboardMeasurement = {
      viewport,
      baselineHeight: baselineByOrientation.get(orientation) ?? candidateBaseline,
      threshold: config.keyboardThreshold,
      editableFocused: focused,
      virtualKeyboardHeight: virtualKeyboardHeight()
    };
    return detectKeyboard(measurement);
  }

  function writeState(next: SafeAreaState): void {
    if (!root) return;
    const values: Record<(typeof CSS_VARIABLES)[number], string> = {
      "--khm-safe-top": px(next.safeArea.top),
      "--khm-safe-right": px(next.safeArea.right),
      "--khm-safe-bottom": px(next.safeArea.bottom),
      "--khm-safe-left": px(next.safeArea.left),
      "--khm-viewport-width": px(next.viewport.width),
      "--khm-viewport-height": px(next.viewport.height),
      "--khm-visible-width": px(next.viewport.visibleWidth),
      "--khm-visible-height": px(next.viewport.visibleHeight),
      "--khm-keyboard-height": px(next.keyboard.height),
      "--khm-keyboard-open": next.keyboard.open ? "1" : "0",
      "--khm-offset-top": px(next.viewport.offsetTop),
      "--khm-offset-left": px(next.viewport.offsetLeft),
      "--khm-viewport-scale": String(next.viewport.scale),
      "--khm-orientation-landscape": next.orientation === "landscape" ? "1" : "0",
      "--khm-standalone": next.standalone ? "1" : "0"
    };

    for (const variable of CSS_VARIABLES) root.style.setProperty(variable, values[variable]);
  }

  function emitChanges(previous: SafeAreaState, next: SafeAreaState): void {
    if (!root) return;
    const detail: SafeAreaChangeDetail = { state: next, previous };
    if (!sameInsets(previous.safeArea, next.safeArea))
      dispatch(root, "khm:safearea-change", detail);
    if (!sameViewport(previous.viewport, next.viewport))
      dispatch(root, "khm:viewport-change", detail);
    if (previous.keyboard.open !== next.keyboard.open) {
      dispatch(root, next.keyboard.open ? "khm:keyboard-open" : "khm:keyboard-close", detail);
    }
    if (previous.orientation !== next.orientation) dispatch(root, "khm:orientation-change", detail);
  }

  function measure(): void {
    if (!isBrowser()) return;
    const viewport = config.viewport || config.keyboard ? readViewport() : state.viewport;
    const orientation = config.orientation
      ? readOrientation(viewport.width, viewport.height)
      : state.orientation;
    const previous = state;
    const next = freezeState({
      safeArea: config.safeArea ? readNativeInsets() : ZERO_INSETS,
      viewport,
      keyboard: nextKeyboard(viewport, orientation),
      orientation,
      standalone: isStandalone(),
      fullscreen: isFullscreen()
    });

    writeState(next);
    debugOverlay ??= config.debug ? createDebugOverlay() : undefined;
    debugOverlay?.update(next);
    if (sameState(previous, next)) return;

    state = next;
    emitChanges(previous, next);
    for (const subscriber of [...subscribers]) subscriber(next, previous);
  }

  const controller: SafeAreaController = {
    start() {
      if (active || !isBrowser()) return controller;
      active = true;
      root = config.root ?? document.documentElement;
      for (const variable of CSS_VARIABLES) {
        savedProperties.set(variable, {
          value: root.style.getPropertyValue(variable),
          priority: root.style.getPropertyPriority(variable)
        });
      }

      const onChange: EventListener = () => schedule();
      listen(window, "resize", onChange);
      listen(window, "orientationchange", onChange);
      listen(window, "pageshow", onChange);
      listen(window.visualViewport ?? undefined, "resize", onChange);
      listen(window.visualViewport ?? undefined, "scroll", onChange);
      listen(screen.orientation, "change", onChange);
      listen(document, "fullscreenchange", onChange);
      listen(document, "focusin", onChange);
      listen(document, "focusout", onChange);
      listen(getVirtualKeyboard(), "geometrychange", onChange);

      const standaloneQuery = window.matchMedia?.("(display-mode: standalone)");
      listen(standaloneQuery, "change", onChange);
      if (config.warnOnMissingViewportFit && (config.debug || shouldWarnInDevelopment())) {
        warnIfViewportFitIsMissing();
      }
      measure();
      return controller;
    },
    stop() {
      if (!active) return controller;
      active = false;
      if (frame !== 0) window.cancelAnimationFrame(frame);
      frame = 0;
      for (const dispose of cleanup.splice(0)) dispose();
      debugOverlay?.destroy();
      debugOverlay = undefined;
      if (root) {
        for (const [variable, saved] of savedProperties) {
          if (saved.value) root.style.setProperty(variable, saved.value, saved.priority);
          else root.style.removeProperty(variable);
        }
      }
      savedProperties.clear();
      baselineByOrientation.clear();
      return controller;
    },
    refresh() {
      if (active) schedule();
      return controller;
    },
    getState() {
      return state;
    },
    subscribe(subscriber) {
      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    },
    get started() {
      return active;
    }
  };

  return controller;
}
