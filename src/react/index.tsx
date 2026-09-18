import {
  createElement,
  useEffect,
  useRef,
  useSyncExternalStore,
  type ElementType,
  type HTMLAttributes,
  type ReactNode
} from "react";
import { createSafeArea } from "../core/safe-area.js";
import { safeAreaClasses, type SafeAreaPaddingProps } from "../adapters/classes.js";
import type { SafeAreaController, SafeAreaState } from "../types.js";

export interface SafeAreaProps extends SafeAreaPaddingProps, HTMLAttributes<HTMLElement> {
  readonly as?: ElementType;
  readonly children?: ReactNode;
}

export function SafeArea({
  as = "div",
  className,
  top,
  right,
  bottom,
  left,
  x,
  y,
  all,
  children,
  ...attributes
}: SafeAreaProps) {
  const classes = safeAreaClasses({ top, right, bottom, left, x, y, all }, className);
  return createElement(as, { ...attributes, className: classes || undefined }, children);
}

export function useSafeArea(controller?: SafeAreaController): SafeAreaState {
  const owned = useRef<SafeAreaController | null>(null);
  owned.current ??= controller ?? createSafeArea();
  const instance = owned.current;

  useEffect(() => {
    const alreadyStarted = instance.started;
    instance.start();
    return () => {
      if (!alreadyStarted) instance.stop();
    };
  }, [instance]);

  return useSyncExternalStore(
    (notify) => instance.subscribe(() => notify()),
    () => instance.getState(),
    () => instance.getState()
  );
}

export default SafeArea;
