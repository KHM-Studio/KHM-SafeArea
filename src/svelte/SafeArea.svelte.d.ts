import type { Component } from "svelte";
import type { SafeAreaPaddingProps } from "../adapters/classes.js";

export interface SafeAreaProps extends SafeAreaPaddingProps {
  as?: string;
  className?: string;
  [attribute: string]: unknown;
}

declare const SafeArea: Component<SafeAreaProps>;
export default SafeArea;
