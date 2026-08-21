import { cn } from "@/lib/utils"

type PropsWithClass = React.HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: PropsWithClass) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-background shadow-sm",
        "flex flex-col",
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: PropsWithClass) {
  return (
    <div className={cn("p-4 border-b border-border", className)} {...props} />
  )
}

export function CardTitle({ className, ...props }: PropsWithClass) {
  return <h3 className={cn("text-sm font-semibold", className)} {...props} />
}

export function CardContent({ className, ...props }: PropsWithClass) {
  return <div className={cn("p-4 flex-1", className)} {...props} />
}

export function CardFooter({ className, ...props }: PropsWithClass) {
  return (
    <div className={cn("p-3 border-t border-border", className)} {...props} />
  )
}

export default Card
