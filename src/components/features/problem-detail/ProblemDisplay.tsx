'use client'

import { ProblemDetail } from '@/lib/types'

interface ProblemDisplayProps {
  problem: ProblemDetail
}

export function ProblemDisplay({ problem }: ProblemDisplayProps) {
  return (
    <fieldset className="border-2 border-border rounded-lg px-4 py-3">
      <legend className="px-2 text-sm font-semibold text-foreground">
        論証
      </legend>
      <p className="text-lg leading-relaxed text-foreground">
        {problem.argument}
      </p>
    </fieldset>
  )
}
