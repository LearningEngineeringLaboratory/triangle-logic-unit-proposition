'use client'

import { ReactNode } from 'react'

interface LogicalSymbolLayoutProps {
  slots: {
    header: ReactNode
    content: ReactNode
    footer: ReactNode
  }
}

/**
 * 比較実験用のレイアウトコンポーネント
 * 左右分割なしの単一カラム構成
 */
export function LogicalSymbolLayout({ slots }: LogicalSymbolLayoutProps) {
  return (
    <div className="flex-1 bg-background overflow-hidden flex flex-col">
      <div className="h-full flex flex-col">
        {/* ヘッダー（論証文の表示） */}
        {slots.header && (
          <div className="shrink-0 border-b border-border shadow-[0_2px_8px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
            {slots.header}
          </div>
        )}

        {/* 中央コンテンツ（単一カラム、スクロール可能） */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-background">
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            {slots.content}
          </div>
        </div>

        {/* フッター（答え合わせボタン） */}
        <div className="flex items-center shrink-0 border-t border-border px-6 py-3 relative z-10 glass-morphism-footer backdrop-blur bg-white/80 dark:bg-[rgba(25,25,35,0.8)]">
          {slots.footer}
        </div>
      </div>
    </div>
  )
}

