import * as React from "react"
import { CheckCircle2, XCircle } from "lucide-react"
import { 
  Drawer, 
  DrawerContent, 
  DrawerTitle, 
  DrawerDescription 
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

interface FeedbackDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant: 'success' | 'error'
  title: string
}

export function FeedbackDrawer({
  open,
  onOpenChange,
  variant,
  title,
}: FeedbackDrawerProps) {
  const isSuccess = variant === 'success'

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={cn(
        "border-t-4 bg-white/70 dark:bg-background/70 backdrop-blur-xl backdrop-saturate-150 shadow-2xl",
        isSuccess ? "border-t-success" : "border-t-destructive"
      )}>
        <div className="mx-auto w-full max-w-md py-8">
          <div className="flex flex-col items-center gap-4 text-center">
            {/* アイコン */}
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-500",
              isSuccess 
                ? "bg-gradient-to-br from-success to-success/70" 
                : "bg-gradient-to-br from-destructive to-destructive/70 animate-shake-x"
            )}>
              {isSuccess ? (
                <CheckCircle2 className="w-10 h-10 text-white" />
              ) : (
                <XCircle className="w-10 h-10 text-white" />
              )}
            </div>

            {/* タイトル（アクセシビリティ対応） */}
            <DrawerTitle className={cn(
              "text-3xl font-bold",
              isSuccess ? "text-success" : "text-destructive"
            )}>
              {title}
            </DrawerTitle>

            {/* 非表示の説明（アクセシビリティ対応） */}
            <DrawerDescription className="sr-only">
              {isSuccess ? '正解のフィードバック' : '不正解のフィードバック'}
            </DrawerDescription>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

