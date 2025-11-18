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
    <div className="flex-1 bg-background overflow-hidden flex flex-col">
      {/* コンテンツ全体を3行グリッド（ヘッダー/中央/フッター）にして中央のみスクロール許容 */}
      <div className="h-full flex flex-col">
        {/* ヘッダー直下 全幅（固定行） */}
        {slots.header && (
          <div className="flex-shrink-0 border-b border-border shadow-[0_2px_8px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
            {slots.header}
          </div>
        )}

        {/* 中央行（flex-1）: 2カラム。左右に空白なし */}
        <div className="flex-1 min-h-0 grid grid-cols-[480px_1fr] overflow-hidden">
          {/* 左: ステップ（スクロールとフェードアウト効果は子コンポーネントで管理） */}
          <div className="h-full overflow-hidden shadow-[2px_0_8px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_8px_rgba(0,0,0,0.2)]">
            {slots.leftPanel}
          </div>
          {/* 右: 三角ロジック（高さは親に合わせる） */}
          <div className="h-full overflow-hidden">
            {slots.rightPanel}
          </div>
        </div>

        {/* 下段 全幅: アクション（固定行） */}
        <div className="flex items-center flex-shrink-0 border-t border-border px-6 py-3 relative z-10 glass-morphism-footer backdrop-blur-[16px] bg-white/80 dark:bg-[rgba(25,25,35,0.8)]">
          {slots.footer}
        </div>
      </div>
    </div>
  )
}
