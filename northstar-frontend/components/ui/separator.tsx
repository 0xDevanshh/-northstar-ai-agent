import * as React from "react"
import { cn } from "@/lib/utils"

export function Separator({ className }: { className?: string }) {
  return <div className={cn("my-4 h-px bg-border", className)} />
}

export default Separator
