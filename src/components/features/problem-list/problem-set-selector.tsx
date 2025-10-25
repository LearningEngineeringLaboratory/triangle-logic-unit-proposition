'use client'

import { ProblemSet } from '@/lib/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ProblemSetSelectorProps {
  problemSets: ProblemSet[]
  selectedSetId: string | null
  onSetChange: (setId: string | null) => void
  isLoading?: boolean
}

export function ProblemSetSelector({ 
  problemSets, 
  selectedSetId, 
  onSetChange, 
  isLoading = false 
}: ProblemSetSelectorProps) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-3">問題セット選択</h2>
      <Select 
        value={selectedSetId || undefined} 
        onValueChange={(value) => onSetChange(value)}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="問題セットを選択してください" />
        </SelectTrigger>
        <SelectContent>
          {problemSets.map((set) => (
            <SelectItem key={set.set_id} value={set.set_id}>
              {set.name}
              {set.description && (
                <span className="text-muted-foreground ml-2">
                  - {set.description}
                </span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
