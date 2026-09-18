export type Orientation = "portrait" | "landscape";

export interface Insets {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

export interface ViewportState {
  readonly width: number;
  readonly height: number;
  readonly visibleWidth: number;
  readonly visibleHeight: number;
  readonly offsetTop: number;
  readonly offsetLeft: number;
  readonly scale: number;
}

export interface KeyboardState {
  readonly open: boolean;
  readonly height: number;
}

export interface SafeAreaState {
  readonly safeArea: Insets;
  readonly viewport: ViewportState;
  readonly keyboard: KeyboardState;
  readonly orientation: Orientation;
  readonly standalone: boolean;
  readonly fullscreen: boolean;
}

export interface SafeAreaOptions {
  /** Read native CSS environment insets and publish them as KHM variables. @default true */
  readonly safeArea?: boolean;
  /** Track layout and visual viewport geometry. @default true */
  readonly viewport?: boolean;
  /** Detect the virtual keyboard conservatively. @default true */
  readonly keyboard?: boolean;
  /** Track portrait/landscape changes. @default true */
  readonly orientation?: boolean;
  /** Render a local, non-interactive diagnostics overlay. @default false */
  readonly debug?: boolean;
  /** Minimum viewport reduction in CSS px before a keyboard is reported. @default 120 */
  readonly keyboardThreshold?: number;
  /** Element receiving CSS custom properties. Defaults to document.documentElement. */
  readonly root?: HTMLElement;
  /** Warn on localhost when viewport-fit=cover is missing. @default true */
  readonly warnOnMissingViewportFit?: boolean;
}

export type SafeAreaSubscriber = (state: SafeAreaState, previous: SafeAreaState) => void;

export interface SafeAreaController {
  start(): SafeAreaController;
  stop(): SafeAreaController;
  refresh(): SafeAreaController;
  getState(): SafeAreaState;
  subscribe(subscriber: SafeAreaSubscriber): () => void;
  readonly started: boolean;
}

export interface SafeAreaChangeDetail {
  readonly state: SafeAreaState;
  readonly previous: SafeAreaState;
}
