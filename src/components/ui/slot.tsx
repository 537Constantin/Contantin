import * as React from "react";

/**
 * Minimal `asChild` slot: merges the component's props onto its single
 * child element. Avoids pulling in an extra dependency for one use case.
 */
export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, ...props }, ref) => {
    if (!React.isValidElement(children)) return null;

    const child = children as React.ReactElement<Record<string, unknown>>;
    const childProps = child.props;

    return React.cloneElement(child, {
      ...props,
      ...childProps,
      className: [
        (props as { className?: string }).className,
        childProps.className as string | undefined,
      ]
        .filter(Boolean)
        .join(" "),
      ref,
    } as Record<string, unknown>);
  },
);
Slot.displayName = "Slot";
