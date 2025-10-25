'use client'

import { Handle, Position } from '@xyflow/react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

  console.log('TriangleNode render:', { nodeId, showHandles, value, isReadOnly })

  return (
    <div className="relative">
      {/* ハンドル表示制御 */}
      {showHandles ? (
        <>
          {/* ノード全体を接続可能にするためのハンドル */}
          {/* 右側のソースハンドル */}
          <Handle
            type="source"
            position={Position.Right}
            id={`${nodeId}-right`}
            style={{
              right: -8,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 16,
              height: 16,
              backgroundColor: 'var(--primary)',
              border: '2px solid var(--border)',
              borderRadius: '50%',
              zIndex: 10,
            }}
          />
          
          {/* 左側のターゲットハンドル */}
          <Handle
            type="target"
            position={Position.Left}
            id={`${nodeId}-left`}
            style={{
              left: -8,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 16,
              height: 16,
              backgroundColor: 'var(--primary)',
              border: '2px solid var(--border)',
              borderRadius: '50%',
              zIndex: 10,
            }}
          />
          
          {/* 上部のターゲットハンドル */}
          <Handle
            type="target"
            position={Position.Top}
            id={`${nodeId}-top`}
            style={{
              top: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 16,
              height: 16,
              backgroundColor: 'var(--primary)',
              border: '2px solid var(--border)',
              borderRadius: '50%',
              zIndex: 10,
            }}
          />
          
          {/* 下部のソースハンドル */}
          <Handle
            type="source"
            position={Position.Bottom}
            id={`${nodeId}-bottom`}
            style={{
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 16,
              height: 16,
              backgroundColor: 'var(--primary)',
              border: '2px solid var(--border)',
              borderRadius: '50%',
              zIndex: 10,
            }}
          />
        </>
      ) : (
        <>
          {/* ハンドルを非表示 */}
          <Handle
            type="target"
            position={Position.Top}
            style={{ opacity: 0, cursor: 'default' }}
          />
          <Handle
            type="source"
            position={Position.Right}
            style={{ opacity: 0, cursor: 'default' }}
          />
        </>
      )}

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
