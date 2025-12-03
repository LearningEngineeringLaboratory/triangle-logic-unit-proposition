'use client'

import { useNodeId, useReactFlow } from '@xyflow/react'
import { X } from 'lucide-react'
import { NodeHandles } from './NodeHandles'

interface PremiseNodeData {
  value: string
  nodeId: string
  showHandles?: boolean
  showDeleteButton?: boolean
  onDelete?: () => void
}

interface PremiseNodeProps {
  data: PremiseNodeData
}

export function PremiseNode({ data }: PremiseNodeProps) {
  const { value, nodeId, showHandles = true, showDeleteButton = true, onDelete } = data
  const id = useNodeId()
  const { getNode } = useReactFlow()
  const node = id ? getNode(id) : null
  const isSelected = node?.selected ?? false

  return (
    <div className="relative">
      <NodeHandles nodeId={nodeId} showHandles={showHandles} />

      {/* ノード本体（テキスト表示のみ） */}
      <div className="m-1.5 flex items-center justify-center">
        <div className={`relative bg-background border-2 rounded-xl shadow-sm min-w-[160px] min-h-[60px] text-sm text-center flex items-center justify-center transition-colors ${
          isSelected ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-border'
        }`}>
          {value || "選択されていません"}

          {/* 削除ボタン（選択時のみ表示） */}
          {showDeleteButton && onDelete && isSelected && (
            <div
              role="button"
              aria-label="ノードを削除"
              onClick={onDelete}
              className="absolute -top-1.5 -right-1.5 grid place-items-center rounded-full bg-destructive text-destructive-foreground cursor-pointer transition-transform duration-150 ease-out hover:scale-[1.08]"
              style={{ width: '14px', height: '14px', lineHeight: 0 }}
            >
              <X strokeWidth={4} className="text-white" style={{ width: '10px', height: '10px' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
