import { defineComponent, h, onMounted, onUnmounted, shallowRef, type PropType } from "vue";
import { safeAreaClasses } from "../adapters/classes.js";
import { createSafeArea } from "../core/safe-area.js";
import type { SafeAreaController } from "../types.js";

const booleanProp = { type: Boolean, default: false } as const;

export const SafeArea = defineComponent({
  name: "KhmSafeArea",
  inheritAttrs: false,
  props: {
    as: { type: String, default: "div" },
    top: booleanProp,
    right: booleanProp,
    bottom: booleanProp,
    left: booleanProp,
    x: booleanProp,
    y: booleanProp,
    all: booleanProp,
    class: { type: [String, Array, Object] as PropType<unknown>, default: undefined }
  },
  setup(props, { attrs, slots }) {
    return () => {
      const classes = safeAreaClasses(props);
      return h(
        props.as,
        { ...attrs, class: [props.class, classes || undefined] },
        slots.default?.()
      );
    };
  }
});

export function useSafeArea(controller: SafeAreaController = createSafeArea()) {
  const state = shallowRef(controller.getState());
  let unsubscribe: (() => void) | undefined;
  let shouldStop = false;

  onMounted(() => {
    shouldStop = !controller.started;
    controller.start();
    state.value = controller.getState();
    unsubscribe = controller.subscribe((next) => {
      state.value = next;
    });
  });
  onUnmounted(() => {
    unsubscribe?.();
    if (shouldStop) controller.stop();
  });
  return state;
}

export default SafeArea;
