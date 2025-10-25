'use client'

import { ProblemDetail } from '@/lib/types'
import { BookOpen } from 'lucide-react'

interface ProblemDisplayProps {
  problem: ProblemDetail
}

export function ProblemDisplay({ problem }: ProblemDisplayProps) {
  return (
    <fieldset className="border-2 border-primary/20 rounded-2xl px-4 pt-2 pb-3 mb-2 bg-primary/5">
      <legend className="px-2 flex items-center gap-2">
        <BookOpen className="w-3 h-3 text-primary" />
        <span className="text-sm font-semibold text-primary">論証</span>
      </legend>
      <p className="text-base font-bold leading-relaxed text-foreground font-serif tracking-wide">
        {problem.argument}
      </p>
    </fieldset>
  )
}
