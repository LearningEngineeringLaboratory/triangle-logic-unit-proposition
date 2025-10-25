'use client'

import { Handle, Position } from '@xyflow/react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface TriangleNodeData {
  options: string[]
  value: string
  onValueChange: (value: string) => void
  isReadOnly?: boolean
  nodeId: string
}

interface TriangleNodeProps {
  data: TriangleNodeData
}

export function TriangleNode({ data }: TriangleNodeProps) {
  const { options, value, onValueChange, isReadOnly = false, nodeId } = data

  return (
    <div className="relative">
      {/* ノード外側のハンドル（接続ポイント） */}
      <Handle
        type="source"
        position={Position.Bottom}
        id={`${nodeId}-bottom`}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
        style={{ bottom: -6 }}
      />

      {/* ターゲットハンドル */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0, cursor: 'default' }}
      />

      {/* ノード本体 */}
      <div className="m-1.5 bg-background border-2 border-border rounded-xl shadow-sm min-w-[120px] min-h-[60px] flex items-center justify-center">
        {isReadOnly ? (
          <div className="text-sm text-center flex items-center justify-center">{value || "選択されていません"}</div>
        ) : (
          <div className="text-center w-full">
            <Select value={value} onValueChange={onValueChange}>
              <SelectTrigger className="w-full min-h-[60px] rounded-xl border-2 hover:border-primary focus:ring-2 focus:ring-primary">
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
