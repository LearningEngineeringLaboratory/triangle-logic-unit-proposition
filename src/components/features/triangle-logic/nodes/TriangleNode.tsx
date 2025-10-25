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
  console.log('TriangleNode showHandles value:', showHandles, 'type:', typeof showHandles)
  console.log('TriangleNode showHandles condition:', showHandles ? 'SHOWING HANDLES' : 'HIDING HANDLES')

  return (
    <div className="relative">
      {/* ハンドル表示制御 */}
      {showHandles ? (
        <>
          {/* ノード外側のハンドル（接続ポイント） */}
          <Handle
            type="source"
            position={Position.Right}
            id={`${nodeId}-right`}
            style={{
              right: 20,
              top: 44,
              width: 20,
              height: 20,
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: 0,
              zIndex: 10,
            }}
          >
            {/* 右下向き矢印 */}
            <div 
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: 'oklch(0.70 0.19 48)',
                transform: 'rotate(45deg)',
                fontWeight: 'bold',
                textShadow: '1px 1px 4px rgba(0, 0, 0, 0.3)',
              }}
            >
              →
            </div>
          </Handle>

          {/* ターゲットハンドル（左側） */}
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
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '50%',
            }}
          />
          
          {/* ターゲットハンドル（上部） */}
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
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '50%',
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
            type="target"
            position={Position.Left}
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
