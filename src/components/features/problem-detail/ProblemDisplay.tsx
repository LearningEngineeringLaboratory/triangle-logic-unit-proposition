'use client'

import { ProblemDetail } from '@/lib/types'
import { BookOpen } from 'lucide-react'

interface ProblemDisplayProps {
  problem: ProblemDetail
}

export function ProblemDisplay({ problem }: ProblemDisplayProps) {
  return (
    <div className="flex items-center gap-4 px-8">
      <div className="flex items-center gap-2 flex-shrink-0">
        <BookOpen className="w-4 h-4 text-primary" />
        <span className="text-base font-semibold text-primary">論証</span>
      </div>
      <p className="text-lg font-bold leading-relaxed text-foreground font-serif tracking-wide">
        {problem.argument}
      </p>
    </div>
  )
}
