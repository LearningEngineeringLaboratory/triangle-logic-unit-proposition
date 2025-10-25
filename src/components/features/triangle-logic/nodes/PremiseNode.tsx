'use client'

import { Handle, Position } from '@xyflow/react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface PremiseNodeData {
  value: string
  nodeId: string
  showHandles?: boolean
  onDelete?: () => void
}

interface PremiseNodeProps {
  data: PremiseNodeData
}

export function PremiseNode({ data }: PremiseNodeProps) {
  const { value, nodeId, showHandles = true, onDelete } = data

  return (
    <div className="relative">
      {/* ハンドル表示制御 */}
      {showHandles ? (
        <>
          {/* ノード外側のハンドル（接続ポイント） */}
          <Handle
            type="source"
            position={Position.Bottom}
            id={`${nodeId}-bottom`}
            style={{
              bottom: -12,
              width: 14,
              height: 14,
              backgroundColor: `var(--primary)`,
              border: '2px solid var(--border)',
              borderRadius: 'full',
            }}
          />
          {/* ターゲットハンドル */}
          <Handle
            type="target"
            position={Position.Top}
            style={{ opacity: 0, cursor: 'default' }}
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
            position={Position.Bottom}
            style={{ opacity: 0, cursor: 'default' }}
          />
        </>
      )}

      {/* ノード本体（テキスト表示のみ） */}
      <div className="m-1.5 flex items-center justify-center">
        <div className="relative bg-background border-2 border-border rounded-xl shadow-sm min-w-[160px] min-h-[60px] text-sm text-center flex items-center justify-center">
          {value || "選択されていません"}
          
          {/* 削除ボタン */}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 shadow-lg hover:shadow-xl"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
