'use client'

import { Header } from '@/components/layout/Header'
import { Skeleton } from '@/components/ui/skeleton'

export function ProblemDetailLoading() {
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <Header />
      
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="container mx-auto px-4 h-full flex flex-col gap-6">
          {/* ヘッダー部分のスケルトン */}
          <div className="pt-6 flex-shrink-0">
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>

          {/* 中央部分のスケルトン */}
          <div className="flex-1 min-h-0 grid lg:grid-cols-[1fr_minmax(0,_560px)] gap-8 overflow-hidden">
            {/* 左パネルのスケルトン */}
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          </div>

          {/* フッターのスケルトン */}
          <div className="border-t-2 border-border flex items-center justify-between py-4 flex-shrink-0">
            <Skeleton className="h-10 w-40 rounded-xl" />
            <Skeleton className="h-14 w-[200px] rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

