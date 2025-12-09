'use client'

import { AlertCircle } from 'lucide-react'
import { ReactNode } from 'react'

interface StepHintProps {
  children: ReactNode
}

/**
 * ステップのヒントを表示する共通コンポーネント
 */
export const StepHint = ({ children }: StepHintProps) => {
  return (
    <div className="mb-6 rounded-xl border-2 border-warning/30 bg-warning/10 p-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="h-5 w-5 text-warning" aria-hidden="true" />
        <span className="text-base font-semibold text-warning">ヒント</span>
      </div>
      <div className="text-sm leading-relaxed text-foreground whitespace-pre-line">
        {children}
      </div>
    </div>
  )
}
