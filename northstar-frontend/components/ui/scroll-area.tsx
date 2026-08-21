import * as React from "react"
import { cn } from "@/lib/utils"

type Props = React.HTMLAttributes<HTMLDivElement> & {
  className?: string
  // Declared explicitly so callers can drive scrollTop. React 19 passes `ref`
  // as a normal prop, but spelling it out documents the contract instead of
  // leaving it to land in {...props} by accident.
  ref?: React.Ref<HTMLDivElement>
}

export function ScrollArea({ className, children, ref, ...props }: Props) {
  return (
    <div
      ref={ref}
      className={cn("overflow-auto px-4 py-3 space-y-3", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export default ScrollArea
