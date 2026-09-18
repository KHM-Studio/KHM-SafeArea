import type { SafeAreaState } from "../types.js";

export interface DebugOverlay {
  update(state: SafeAreaState): void;
  destroy(): void;
}

export function createDebugOverlay(): DebugOverlay | undefined {
  if (typeof document === "undefined" || !document.body) return undefined;

  const host = document.createElement("div");
  host.dataset.khmSafeareaDebug = "";
  host.setAttribute("aria-hidden", "true");
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>
      :host { all: initial; pointer-events: none; position: fixed; inset: 0; z-index: 2147483647; }
      .edge { position: fixed; background: rgb(255 45 85 / 18%); }
      .top { inset: 0 0 auto; height: var(--khm-safe-top, 0px); }
      .right { inset: 0 0 0 auto; width: var(--khm-safe-right, 0px); }
      .bottom { inset: auto 0 0; height: var(--khm-safe-bottom, 0px); }
      .left { inset: 0 auto 0 0; width: var(--khm-safe-left, 0px); }
      pre { position: fixed; inset: auto auto max(8px, var(--khm-safe-bottom, 0px)) max(8px, var(--khm-safe-left, 0px)); margin: 0; padding: 10px 12px; border: 1px solid rgb(255 255 255 / 30%); border-radius: 8px; background: rgb(10 12 18 / 88%); color: #fff; font: 11px/1.45 ui-monospace, monospace; white-space: pre; box-shadow: 0 4px 20px rgb(0 0 0 / 30%); }
    </style>
    <div class="edge top"></div><div class="edge right"></div>
    <div class="edge bottom"></div><div class="edge left"></div><pre></pre>
  `;
  const output = shadow.querySelector("pre");
  document.body.append(host);

  return {
    update(state) {
      if (!output) return;
      const mode = state.standalone ? "PWA" : state.fullscreen ? "FULLSCREEN" : "BROWSER";
      output.textContent = [
        `SAFE: ${state.safeArea.top} ${state.safeArea.right} ${state.safeArea.bottom} ${state.safeArea.left}px`,
        `VIEWPORT: ${state.viewport.width}x${state.viewport.height}`,
        `VISIBLE: ${Math.round(state.viewport.visibleWidth)}x${Math.round(state.viewport.visibleHeight)}`,
        `KEYBOARD: ${state.keyboard.open ? `OPEN ${state.keyboard.height}px` : "CLOSED"}`,
        `MODE: ${mode}`,
        `ORIENTATION: ${state.orientation}`
      ].join("\n");
    },
    destroy() {
      host.remove();
    }
  };
}
