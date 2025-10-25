'use client'

import { ProblemDetail } from '@/lib/types'
import { BookOpen } from 'lucide-react'

interface ProblemDisplayProps {
  problem: ProblemDetail
}

export function ProblemDisplay({ problem }: ProblemDisplayProps) {
  return (
    <fieldset className="border-2 border-primary/20 rounded-2xl px-6 pt-2 pb-4 mb-2 bg-primary/5">
      <legend className="px-3 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-primary" />
        <span className="text-base font-semibold text-primary">論証</span>
      </legend>
      <p className="text-xl leading-relaxed text-foreground">
        {problem.argument}
      </p>
    </fieldset>
  )
}
