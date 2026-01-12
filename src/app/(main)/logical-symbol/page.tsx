'use client'

import { getProblems, getProblemSets } from '@/lib/problems'
import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useSession'
import { UserRegistrationDialog } from '@/components/features/auth/UserRegistrationDialog'
import { LogicalSymbolPageHeader } from '@/components/layout/LogicalSymbolPageHeader'
import { LogicalSymbolProblemsList } from '@/components/features/logical-symbol/LogicalSymbolProblemsList'
import { Loading } from '@/components/ui/loading'

export default function LogicalSymbolPage() {
  const [problems, setProblems] = useState<Awaited<ReturnType<typeof getProblems>>>([])
  const [problemSets, setProblemSets] = useState<Awaited<ReturnType<typeof getProblemSets>>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [completedCount, setCompletedCount] = useState(0)
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
        <LogicalSymbolPageHeader 
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
      <LogicalSymbolPageHeader 
        sessionInfo={sessionInfo}
        onLogout={handleLogout}
      />
      <main className="flex-1 container mx-auto px-4 py-8">
        <LogicalSymbolProblemsList 
          initialProblems={problems} 
          problemSets={problemSets}
          onCompletedCountChange={setCompletedCount}
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

