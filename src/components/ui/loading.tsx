import { Spinner } from '@/components/ui/spinner'

interface LoadingProps {
  className?: string
}

export function Loading({ className }: LoadingProps) {
  return (
    <div className={`flex flex-col items-center gap-4 ${className || ''}`}>
      <Spinner className="size-8" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  )
}
