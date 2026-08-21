import { cn } from "@/lib/utils"

type PropsWithClass = React.HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: PropsWithClass) {
  return (
    <div
      className={cn(
        // bg-card (not bg-background) so the card reads as a raised surface
        // against the page in both themes.
        "rounded-lg border border-border bg-card text-card-foreground shadow-sm",
        "flex flex-col",
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: PropsWithClass) {
  return (
    <div
      className={cn("shrink-0 p-4 border-b border-border", className)}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }: PropsWithClass) {
  return <h3 className={cn("text-sm font-semibold", className)} {...props} />
}

export function CardContent({ className, ...props }: PropsWithClass) {
  // min-h-0 / min-w-0 override the `min-height: auto` that flex items get by
  // default. Without them a `flex-1` child cannot shrink below its content, so
  // any scroll container inside it grows instead of scrolling.
  return <div className={cn("p-4 flex-1 min-h-0 min-w-0", className)} {...props} />
}

export function CardFooter({ className, ...props }: PropsWithClass) {
  return (
    <div
      className={cn("shrink-0 p-3 border-t border-border", className)}
      {...props}
    />
  )
}

export default Card
