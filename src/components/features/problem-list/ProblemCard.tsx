'use client'

import { Problem } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'
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
        <Card className="bg-muted/50 border-muted-foreground/20 opacity-75 hover:shadow-none shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-muted-foreground">問題{problemNumber}</CardTitle>
              <CheckCircle2
                className="w-5 h-5 text-success"
                aria-label="完了した問題"
              />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground line-clamp-2">{problem.argument}</p>
          </CardContent>
        </Card>
      ) : (
        <Link href={`/problems/${problem.problem_id}`} className="block">
          <Card className="transition-shadow hover:ring-1 hover:ring-primary cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">問題{problemNumber}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-2">{problem.argument}</p>
            </CardContent>
          </Card>
        </Link>
      )}
    </div>
  )
}

