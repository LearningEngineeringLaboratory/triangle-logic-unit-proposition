'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'

interface AddPremiseNodeButtonProps {
  options: string[]
  onAddNode: (value: string) => void
}

export function AddPremiseNodeButton({ options, onAddNode }: AddPremiseNodeButtonProps) {
  const [selectedValue, setSelectedValue] = useState('')

  const handleAddNode = () => {
    if (selectedValue) {
      onAddNode(selectedValue)
      setSelectedValue('') // リセット
    }
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl shadow-md">
      <div className="flex-1">
        <Select value={selectedValue} onValueChange={setSelectedValue}>
          <SelectTrigger className="rounded-xl border-2 h-12 text-base hover:border-primary focus:ring-2 focus:ring-primary">
            <SelectValue placeholder="所与命題を選択してください" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={handleAddNode}
        disabled={!selectedValue}
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-lg px-6 py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-5 h-5 mr-2" />
        ノード追加
      </Button>
    </div>
  )
}
