'use client'

import { Problem } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface ProblemCardProps {
  problem: Problem
  isCompleted: boolean
}

export function ProblemCard({ problem, isCompleted }: ProblemCardProps) {
  const problemNumber = problem.order_index || 1

  return (
    <div className="relative">
      {isCompleted ? (
        <Card className="bg-muted/50 border-muted-foreground/20 opacity-75">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">問題{problemNumber}</CardTitle>
              <Badge variant="default" className="bg-green-600">
                クリア済み
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{problem.argument}</p>
          </CardContent>
        </Card>
      ) : (
        <Link href={`/problems/${problem.problem_id}`} className="block">
          <Card className="hover:shadow-md transition-shadow hover:ring-1 hover:ring-primary cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">問題{problemNumber}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {problem.argument}
            </CardContent>
          </Card>
        </Link>
      )}
    </div>
  )
}

