"use client"

import * as React from "react"

interface HeaderProps {
  problemDisplay?: React.ReactNode
}

export function Header({ problemDisplay }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full">
      {/* 論証ボックス */}
      {problemDisplay && (
        <div className="w-full px-[4px]">
          <div className="glass-morphism-card-header mt-2 mx-2 border-4 border-primary rounded-full py-4 transition-all duration-300 bg-white/80 dark:bg-[rgba(25,25,35,0.8)] backdrop-blur-lg">
            {problemDisplay}
          </div>
        </div>
      )}
    </header>
  )
}

