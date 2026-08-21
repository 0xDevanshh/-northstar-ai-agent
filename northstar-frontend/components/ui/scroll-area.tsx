import * as React from "react"
import { cn } from "@/lib/utils"

type Props = React.HTMLAttributes<HTMLDivElement> & { className?: string }

export function ScrollArea({ className, children, ...props }: Props) {
  return (
    <div
      className={cn("overflow-auto px-4 py-3 space-y-3", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export default ScrollArea
