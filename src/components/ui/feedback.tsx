import * as React from "react"
import { CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const feedbackVariants = cva(
  "rounded-2xl p-6 border-2 transition-all duration-300 animate-in slide-in-from-bottom",
  {
    variants: {
      variant: {
        success: "bg-success/10 border-success",
        error: "bg-destructive/10 border-destructive animate-shake-x",
        warning: "bg-warning/10 border-warning",
        info: "bg-info/10 border-info",
      },
    },
    defaultVariants: {
      variant: "success",
    },
  }
)

interface FeedbackProps extends React.ComponentProps<"div">, VariantProps<typeof feedbackVariants> {
  title: string
  description?: string
  icon?: React.ReactNode
}

function Feedback({
  className,
  variant,
  title,
  description,
  icon,
  ...props
}: FeedbackProps) {
  const defaultIcons = {
    success: <CheckCircle2 className="w-8 h-8 text-success shrink-0" />,
    error: <XCircle className="w-8 h-8 text-destructive shrink-0" />,
    warning: <AlertTriangle className="w-8 h-8 text-warning shrink-0" />,
    info: <Info className="w-8 h-8 text-info shrink-0" />,
  }

  const titleColors = {
    success: "text-success",
    error: "text-destructive",
    warning: "text-warning",
    info: "text-info",
  }

  return (
    <div
      className={cn(feedbackVariants({ variant, className }))}
      {...props}
    >
      <div className="flex items-start gap-4">
        {icon || defaultIcons[variant || "success"]}
        <div className="flex-1 min-w-0">
          <h3 className={cn("text-xl font-bold mb-1", titleColors[variant || "success"])}>
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export { Feedback, feedbackVariants }

