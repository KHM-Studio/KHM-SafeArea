import { SafeArea, useSafeArea } from "@khm-studio/safearea/react";
import "@khm-studio/safearea/css";

export function App() {
  const state = useSafeArea();
  return (
    <SafeArea as="main" all>
      Visible height: {state.viewport.visibleHeight}px
    </SafeArea>
  );
}
