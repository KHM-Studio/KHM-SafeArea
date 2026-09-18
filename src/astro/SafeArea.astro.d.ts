import type { SafeAreaPaddingProps } from "../adapters/classes.js";

export interface Props extends SafeAreaPaddingProps {
  as?: string;
  class?: string;
  [attribute: string]: unknown;
}

declare const SafeArea: (_props: Props) => unknown;
export default SafeArea;
