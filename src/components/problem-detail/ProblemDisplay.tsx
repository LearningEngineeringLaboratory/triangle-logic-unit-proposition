'use client'

import { ProblemDetail } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ProblemDisplayProps {
  problem: ProblemDetail
  isMobile?: boolean
}

export function ProblemDisplay({ problem, isMobile = false }: ProblemDisplayProps) {
  const argumentCard = (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{isMobile ? '論証文' : '論証'}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg leading-relaxed">{problem.argument}</p>
      </CardContent>
    </Card>
  )

  if (isMobile) {
    return (
      <Card>
        <CardContent className="pt-6">
          {argumentCard}
        </CardContent>
      </Card>
    )
  }

  return argumentCard
}
