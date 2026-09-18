<script lang="ts">
  import { safeAreaClasses } from "../adapters/classes.js";

  export let as = "div";
  export let top = false;
  export let right = false;
  export let bottom = false;
  export let left = false;
  export let x = false;
  export let y = false;
  export let all = false;
  export let className: string | undefined = undefined;

  $: classes = safeAreaClasses({ top, right, bottom, left, x, y, all }, className);
</script>

<svelte:element this={as} class={classes || undefined} {...$$restProps}><slot /></svelte:element>
