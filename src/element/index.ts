import { safeAreaClasses, type SafeAreaPaddingProps } from "../adapters/classes.js";

export const SAFE_AREA_ELEMENT_NAME = "khm-safe-area";

const SAFE_AREA_ATTRIBUTES = ["top", "right", "bottom", "left", "x", "y", "all"] as const;
const HTMLElementBase =
  typeof HTMLElement === "undefined" ? (class {} as typeof HTMLElement) : HTMLElement;

function paddingProps(element: Element): SafeAreaPaddingProps {
  return {
    top: element.hasAttribute("top"),
    right: element.hasAttribute("right"),
    bottom: element.hasAttribute("bottom"),
    left: element.hasAttribute("left"),
    x: element.hasAttribute("x"),
    y: element.hasAttribute("y"),
    all: element.hasAttribute("all")
  };
}

/**
 * Light-DOM wrapper that maps boolean directional attributes to KHM utility classes.
 * Import `@khm/safearea/css` separately so the application controls stylesheet order.
 */
export class KhmSafeAreaElement extends HTMLElementBase {
  static get observedAttributes(): readonly string[] {
    return SAFE_AREA_ATTRIBUTES;
  }

  connectedCallback(): void {
    this.updateSafeAreaClasses();
  }

  attributeChangedCallback(): void {
    this.updateSafeAreaClasses();
  }

  private updateSafeAreaClasses(): void {
    if (typeof this.classList === "undefined") return;
    const active = new Set(safeAreaClasses(paddingProps(this)).split(" ").filter(Boolean));
    for (const attribute of SAFE_AREA_ATTRIBUTES) {
      const className = `khm-safe-${attribute}`;
      this.classList.toggle(className, active.has(className));
    }
  }
}

/**
 * Defines the element once. Returns false during SSR or when the requested name is already defined.
 */
export function defineSafeAreaElement(name = SAFE_AREA_ELEMENT_NAME): boolean {
  if (typeof customElements === "undefined" || customElements.get(name)) return false;
  customElements.define(name, KhmSafeAreaElement);
  return true;
}

declare global {
  interface HTMLElementTagNameMap {
    "khm-safe-area": KhmSafeAreaElement;
  }
}
