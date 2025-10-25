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
    <div className="flex items-center gap-3 p-2 bg-card border border-border rounded-2xl shadow-md w-fit">
      <div className="">
        <Select value={selectedValue} onValueChange={setSelectedValue}>
          <SelectTrigger className="rounded-xl border-2 min-h-[48px] w-48 text-base hover:border-primary focus:ring-2 focus:ring-primary">
            <SelectValue placeholder="選択してください" />
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
        className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl shadow-lg px-4 py-2 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" />
        命題追加
      </Button>
    </div>
  )
}
