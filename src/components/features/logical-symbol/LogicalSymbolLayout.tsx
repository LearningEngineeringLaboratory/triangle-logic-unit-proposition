'use client'

import { ReactNode } from 'react'

interface LogicalSymbolLayoutProps {
  slots: {
    header: ReactNode
    content: ReactNode
    hints?: ReactNode
    footer: ReactNode
  }
}

/**
 * 比較実験用のレイアウトコンポーネント
 * 左右分割構成：左側にコンテンツ、右側にヒント
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

        {/* 中央行（flex-1）: モバイルは縦積み、LG以上で2カラム */}
        <div className="flex-1 min-h-0 flex flex-col gap-4 md:gap-0 md:grid md:grid-cols-[1fr_400px] overflow-hidden">
          {/* 左: メインコンテンツ（スクロール可能） */}
          <div className="h-full overflow-y-auto bg-background">
            <div className="container mx-auto px-4 py-6 max-w-4xl">
              {slots.content}
            </div>
          </div>
          
          {/* 右: ヒント（スクロール可能） */}
          {slots.hints && (
            <div className="h-full overflow-y-auto bg-background border-l border-border">
              <div className="px-4 py-6">
                {slots.hints}
              </div>
            </div>
          )}
        </div>

        {/* フッター（答え合わせボタン） */}
        <div className="flex items-center shrink-0 border-t border-border px-6 py-3 relative z-10 glass-morphism-footer backdrop-blur bg-white/80 dark:bg-[rgba(25,25,35,0.8)]">
          {slots.footer}
        </div>
      </div>
    </div>
  )
}

