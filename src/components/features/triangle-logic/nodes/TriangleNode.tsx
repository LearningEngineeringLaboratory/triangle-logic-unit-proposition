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
        position={Position.Right}
        id={`${nodeId}-right`}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
        style={{ right: -6 }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id={`${nodeId}-left`}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
        style={{ left: -6 }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id={`${nodeId}-top`}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
        style={{ top: -6 }}
      />
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
        position={Position.Right}
        id={`${nodeId}-target-right`}
        className="w-3 h-3 bg-green-500 border-2 border-white"
        style={{ right: -6 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id={`${nodeId}-target-left`}
        className="w-3 h-3 bg-green-500 border-2 border-white"
        style={{ left: -6 }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id={`${nodeId}-target-top`}
        className="w-3 h-3 bg-green-500 border-2 border-white"
        style={{ top: -6 }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id={`${nodeId}-target-bottom`}
        className="w-3 h-3 bg-green-500 border-2 border-white"
        style={{ bottom: -6 }}
      />

      {/* ノード本体 */}
      <div className="px-4 py-2 bg-background border-2 border-border rounded-lg shadow-sm min-w-[120px]">
        {isReadOnly ? (
          <div className="text-center">
            <div className="text-lg font-medium">{value || "選択されていません"}</div>
          </div>
        ) : (
          <div className="text-center">
            <Select value={value} onValueChange={onValueChange}>
              <SelectTrigger className={`w-full ${value ? '' : 'animate-glow-pulse'}`}>
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
