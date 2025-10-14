'use client'

import { ProblemSet } from '@/lib/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>問題セット選択</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}
