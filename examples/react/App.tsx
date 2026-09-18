import { SafeArea, useSafeArea } from "@khm/safearea/react";
import "@khm/safearea/css";

export function App() {
  const state = useSafeArea();
  return (
    <SafeArea as="main" all>
      Visible height: {state.viewport.visibleHeight}px
    </SafeArea>
  );
}
