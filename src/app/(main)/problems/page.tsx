'use client'

import { getProblems, getProblemSets } from '@/lib/problems'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useSession'
import { UserRegistrationDialog } from '@/components/features/auth/UserRegistrationDialog'
import { ProblemsPageHeader } from '@/components/layout/ProblemsPageHeader'
import { ProblemsListWithSetSelector } from '@/components/features/problem-list/ProblemsListWithSetSelector'
import { Loading } from '@/components/ui/loading'

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Awaited<ReturnType<typeof getProblems>>>([])
  const [problemSets, setProblemSets] = useState<Awaited<ReturnType<typeof getProblemSets>>>([])
  const [isLoading, setIsLoading] = useState(true)
  const { sessionInfo, isLoading: isSessionLoading, needsRegistration, handleRegistrationSuccess, handleLogout } = useSession()

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
        />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Loading />
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ProblemsPageHeader 
        sessionInfo={sessionInfo}
        onLogout={handleLogout}
      />
      <main className="flex-1 container mx-auto px-4 py-8">
        <ProblemsListWithSetSelector 
          initialProblems={problems} 
          problemSets={problemSets}
          sessionInfo={sessionInfo}
        />
      </main>
      <UserRegistrationDialog
        open={needsRegistration}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  )
}
