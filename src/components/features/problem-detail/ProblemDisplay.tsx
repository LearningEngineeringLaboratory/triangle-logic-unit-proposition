'use client'

import { ProblemDetail } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ProblemDisplayProps {
  problem: ProblemDetail
}

export function ProblemDisplay({ problem }: ProblemDisplayProps) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>論証</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg leading-relaxed">{problem.argument}</p>
      </CardContent>
    </Card>
  )
}
