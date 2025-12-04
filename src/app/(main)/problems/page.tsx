'use client'

import { getProblems, getProblemSets } from '@/lib/problems'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useSession'
import { UserRegistrationDialog } from '@/components/features/auth/UserRegistrationDialog'
import { ProblemsPageHeader } from '@/components/layout/ProblemsPageHeader'
import { ProblemsListWithSetSelector } from '@/components/features/problem-list/ProblemsListWithSetSelector'
import { useResetAll } from '@/hooks/useResetAll'

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Awaited<ReturnType<typeof getProblems>>>([])
  const [problemSets, setProblemSets] = useState<Awaited<ReturnType<typeof getProblemSets>>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [completedCount, setCompletedCount] = useState(0)
  const { sessionInfo, isLoading: isSessionLoading, needsRegistration, handleRegistrationSuccess, handleLogout } = useSession()

  const { handleResetAll } = useResetAll({
    sessionInfo,
    onSuccess: () => setCompletedCount(0),
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [problemsData, problemSetsData] = await Promise.all([
          getProblems(),
          getProblemSets()
        ])
        setProblems(problemsData)
        setProblemSets(problemSetsData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  if (isLoading || isSessionLoading) {
    return (
      <>
        <ProblemsPageHeader 
          sessionInfo={sessionInfo}
          onLogout={handleLogout}
          onResetAll={handleResetAll}
          completedCount={completedCount}
        />
        <div className="container mx-auto px-4 py-8">
          {/* 問題セットセレクターのSkeleton */}
          <div className="mb-8">
            <Skeleton className="h-12 w-64 rounded-xl mb-4" />
          </div>

          {/* 問題カードのSkeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-24 rounded-lg" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full rounded-md mb-2" />
                  <Skeleton className="h-4 w-5/6 rounded-md" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <ProblemsPageHeader 
        sessionInfo={sessionInfo}
        onLogout={handleLogout}
        onResetAll={handleResetAll}
        completedCount={completedCount}
      />
      <div className="container mx-auto px-4 py-8">
        <ProblemsListWithSetSelector 
          initialProblems={problems} 
          problemSets={problemSets}
          onCompletedCountChange={setCompletedCount}
        />
      </div>
      <UserRegistrationDialog
        open={needsRegistration}
        onSuccess={handleRegistrationSuccess}
      />
    </>
  )
}
