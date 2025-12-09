'use client'

import { BookOpen } from 'lucide-react'
import { ReactNode } from 'react'

interface StepTermDefinitionProps {
  children: ReactNode
}

/**
 * ステップの用語説明を表示する共通コンポーネント
 * StepHintの色違いバージョン（情報色を使用）
 */
export const StepTermDefinition = ({ children }: StepTermDefinitionProps) => {
  return (
    <div className="mb-6 rounded-xl border-2 border-primary/30 bg-primary/10 p-4">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
        <span className="text-base font-semibold text-primary">用語説明</span>
      </div>
      <div className="text-sm leading-relaxed text-foreground whitespace-pre-line">
        {children}
      </div>
    </div>
  )
}
