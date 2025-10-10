import { getProblems } from '@/lib/problems'
import { Problem } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

export default async function ProblemsPage() {
  const problems = await getProblems()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">問題一覧</h1>
        <p className="text-muted-foreground mt-2">
          単位命題三角ロジック演習システム
        </p>
      </div>

      {problems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-lg">問題が見つかりませんでした</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {problems.map((problem: Problem) => (
            <ProblemCard key={problem.problem_id} problem={problem} />
          ))}
        </div>
      )}
    </div>
  )
}

interface ProblemCardProps {
  problem: Problem
}

function ProblemCard({ problem }: ProblemCardProps) {
  const totalSteps = problem.correct_answers ? Object.keys(problem.correct_answers).length : 0
  const done = problem.completed_steps || 0
  const progress = totalSteps > 0 ? (done / totalSteps) * 100 : 0

  return (
    <Link href={`/problems/${problem.problem_id}`} className="block">
      <Card className="hover:shadow-md transition-shadow hover:ring-1 hover:ring-primary cursor-pointer">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{problem.title}</CardTitle>
            <Badge variant={progress === 100 ? "default" : "secondary"}>
              {done}/{totalSteps}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
        {problem.argument}
        </CardContent>
      </Card>
    </Link>
  )
}
