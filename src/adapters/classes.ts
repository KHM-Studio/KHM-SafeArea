export interface SafeAreaPaddingProps {
  readonly top?: boolean | undefined;
  readonly right?: boolean | undefined;
  readonly bottom?: boolean | undefined;
  readonly left?: boolean | undefined;
  readonly x?: boolean | undefined;
  readonly y?: boolean | undefined;
  readonly all?: boolean | undefined;
}

export function safeAreaClasses(props: SafeAreaPaddingProps, className?: string): string {
  const classes = [className];
  if (props.all) classes.push("khm-safe-all");
  if (props.x) classes.push("khm-safe-x");
  if (props.y) classes.push("khm-safe-y");
  if (props.top) classes.push("khm-safe-top");
  if (props.right) classes.push("khm-safe-right");
  if (props.bottom) classes.push("khm-safe-bottom");
  if (props.left) classes.push("khm-safe-left");
  return classes.filter(Boolean).join(" ");
}
