'use client'

import { useEffect, useRef, useState } from 'react'

interface UseStepScrollResult {
  scrollContainerRef: React.MutableRefObject<HTMLDivElement | null>
  showScrollTop: boolean
  scrollToTop: () => void
}

export function useStepScroll(currentStep: number): UseStepScrollResult {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      setShowScrollTop(container.scrollTop > 200)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const el = document.getElementById(`current-step-${currentStep}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [currentStep])

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return { scrollContainerRef, showScrollTop, scrollToTop }
}
