'use client'

import { ReactNode } from 'react'
import { ProblemDetail } from '@/lib/types'

interface ProblemDetailLayoutProps {
  problem: ProblemDetail
  problemNumber: number
  slots: {
    header: ReactNode
    leftPanel: ReactNode
    rightPanel: ReactNode
    footer: ReactNode
  }
}

export function ProblemDetailLayout({ problem, problemNumber, slots }: ProblemDetailLayoutProps) {
  return (
    <div className="h-full bg-background overflow-hidden">
      {/* コンテンツ全体を3行グリッド（ヘッダー/中央/フッター）にして中央のみスクロール許容 */}
      <div className="container mx-auto px-4 h-full grid grid-rows-[auto_1fr_auto] gap-6">
        {/* ヘッダー直下 全幅（固定行） */}
        <div className="pt-6">
          {slots.header}
        </div>

        {/* 中央行（1fr）: 2カラム。中央行自体はoverflow-hiddenにして、左だけスクロール */}
        <div className="min-h-0 grid lg:grid-cols-[1fr_minmax(0,_560px)] gap-8 overflow-hidden">
          {/* 左: ステップ（縦スクロール） */}
          <div className="h-full overflow-y-auto pr-2 rounded-md border border-border bg-muted/30">
            {slots.leftPanel}
          </div>
          {/* 右: 三角ロジック（高さは親に合わせる） */}
          <div className="h-full overflow-hidden flex items-center justify-center">
            {slots.rightPanel}
          </div>
        </div>

        {/* 下段 全幅: アクション（固定行） */}
        <div className="border-t-2 border-border flex items-center py-4">
          {slots.footer}
        </div>
      </div>
    </div>
  )
}
