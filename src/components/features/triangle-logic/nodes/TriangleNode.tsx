'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { NodeHandles } from './NodeHandles'

interface TriangleNodeData {
  options: string[]
  value: string
  onValueChange: (value: string) => void
  isReadOnly?: boolean
  nodeId: string
  showHandles?: boolean
}

interface TriangleNodeProps {
  data: TriangleNodeData
}

export function TriangleNode({ data }: TriangleNodeProps) {
  const { options, value, onValueChange, isReadOnly = false, nodeId, showHandles = true } = data

  return (
    <div className="relative">
      <NodeHandles nodeId={nodeId} showHandles={showHandles} />

      {/* ノード本体 */}
      <div className="m-1.5 flex items-center justify-center">
        {isReadOnly ? (
          <div className="bg-background border-2 border-border rounded-xl shadow-sm min-w-[160px] min-h-[60px] text-sm text-center flex items-center justify-center">{value || "選択されていません"}</div>
        ) : (
          <div className="bg-background text-center w-full">
            <Select value={value} onValueChange={onValueChange}>
              <SelectTrigger className="min-w-[160px] min-h-[60px] rounded-xl border-2 hover:border-primary focus:ring-2 focus:ring-primary">
                <SelectValue placeholder="選択" />
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
        )}
      </div>
    </div>
  )
}
