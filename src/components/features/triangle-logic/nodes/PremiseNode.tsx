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
      {/* ノード全体を入力用ハンドルとして機能させる */}
      <Handle
        type="target"
        position={Position.Top}
        id={`${nodeId}-target`}
        style={{
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          borderRadius: '12px',
          backgroundColor: 'transparent',
          border: 'none',
          transform: 'none',
        }}
      />

      {/* ハンドル表示制御 */}
      {showHandles ? (
        <>
          {/* ノード外側のハンドル（接続ポイント） */}
          <Handle
            type="source"
            position={Position.Right}
            id={`${nodeId}-right`}
            style={{
              top: 64,
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
        </>
      ) : (
        <>
          {/* ハンドルを非表示 */}
          <Handle
            type="source"
            position={Position.Bottom}
            style={{ opacity: 0, cursor: 'default' }}
          />
          <Handle
            type="source"
            position={Position.Right}
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
