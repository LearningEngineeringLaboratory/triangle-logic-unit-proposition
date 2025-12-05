'use client'

import { ReactNode } from 'react'
interface ProblemDetailLayoutProps {
  slots: {
    header: ReactNode
    leftPanel: ReactNode
    rightPanel: ReactNode
    footer: ReactNode
  }
}

export function ProblemDetailLayout({ slots }: ProblemDetailLayoutProps) {
  return (
    <div className="flex-1 bg-background overflow-hidden flex flex-col">
      {/* コンテンツ全体を3行グリッド（ヘッダー/中央/フッター）にして中央のみスクロール許容 */}
      <div className="h-full flex flex-col">
        {/* ヘッダー直下 全幅（固定行） */}
        {slots.header && (
          <div className="shrink-0 border-b border-border shadow-[0_2px_8px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
            {slots.header}
          </div>
        )}

        {/* 中央行（flex-1）: モバイルは縦積み、LG以上で2カラム */}
        <div className="flex-1 min-h-0 flex flex-col gap-4 md:gap-0 md:grid md:grid-cols-[480px_1fr] overflow-hidden">
          {/* 左: ステップ（スクロールとフェードアウト効果は子コンポーネントで管理） */}
          <div className="relative z-10 h-full overflow-hidden bg-background/95 shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] md:shadow-[6px_0_24px_rgba(0,0,0,0.12)] dark:md:shadow-[6px_0_24px_rgba(0,0,0,0.45)]">
            {slots.leftPanel}
          </div>
          {/* 右: 三角ロジック（モバイルでは最低高さを確保） */}
          <div className="min-h-[360px] lg:min-h-0 lg:h-full overflow-hidden rounded-none border-0 bg-background">
            {slots.rightPanel}
          </div>
        </div>

        {/* 下段 全幅: アクション（固定行） */}
        <div className="flex items-center shrink-0 border-t border-border px-6 py-3 relative z-10 glass-morphism-footer backdrop-blur bg-white/80 dark:bg-[rgba(25,25,35,0.8)]">
          {slots.footer}
        </div>
      </div>
    </div>
  )
}
