'use client'

import { ReactNode } from 'react'
import { ProblemDetail } from '@/lib/types'

interface ProblemDetailLayoutProps {
  problem: ProblemDetail
  problemNumber: number
  children: {
    leftPanel: ReactNode
    rightPanel: ReactNode
  }
}

export function ProblemDetailLayout({ problem, problemNumber, children }: ProblemDetailLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-8">
        {/* PC画面: 左右分割レイアウト */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8 lg:h-[calc(100vh-120px)]">
          {/* 左側パネル */}
          <div className="flex flex-col space-y-6 h-full">
            <section className="flex-1 flex flex-col">
              <h3 className="text-xl font-semibold tracking-tight mb-4">問題{problemNumber}</h3>
              {children.leftPanel}
            </section>
          </div>

          {/* 右側パネル（左側に縦罫線） */}
          <div className="flex-1 flex items-center justify-center border-l pl-8">
            {children.rightPanel}
          </div>
        </div>

        {/* モバイル画面: 上下分割レイアウト */}
        <div className="lg:hidden space-y-4">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold tracking-tight">問題{problemNumber}</h3>
            {children.leftPanel}
            {children.rightPanel}
          </div>
        </div>
      </div>
    </div>
  )
}
