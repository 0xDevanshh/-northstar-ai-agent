import * as React from "react"
import { cn } from "@/lib/utils"

type AvatarProps = React.HTMLAttributes<HTMLDivElement> & { size?: number }

export function Avatar({ className, size = 36, children, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium",
        className
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      {children}
    </div>
  )
}

export function AvatarFallback({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

export default Avatar
