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
    <div className="min-h-screen bg-background">
      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* ヘッダー直下 全幅 */}
        <div>
          {slots.header}
        </div>

        {/* 2カラム領域 */}
        <div className="grid lg:grid-cols-[1fr_minmax(0,_560px)] gap-8">
          {/* 左: ステップ（縦スクロール） */}
          <div className="min-h-[50vh] max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
            {slots.leftPanel}
          </div>
          {/* 右: 三角ロジック（現状維持） */}
          <div className="flex items-center justify-center">
            {slots.rightPanel}
          </div>
        </div>

        {/* 下段 全幅: アクション */}
        <div>
          {slots.footer}
        </div>
      </div>
    </div>
  )
}
