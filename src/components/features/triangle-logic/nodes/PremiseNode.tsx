'use client'

import { useNodeId, useReactFlow } from '@xyflow/react'
import { Trash2 } from 'lucide-react'
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
      <div className="m-1.5 flex items-center justify-center relative z-20">
        <div className={`relative bg-background rounded-xl shadow-sm min-w-[160px] min-h-[60px] text-sm text-center flex items-center justify-center transition-colors ${
          isSelected ? 'border-[5px] border-amber-300' : 'border-2 border-border'
        }`}>
          {value || "選択されていません"}
        </div>
      </div>

      {/* 削除ボタン（選択時のみ表示、ノードの外側） */}
      {showDeleteButton && onDelete && isSelected && (
        <div
          role="button"
          aria-label="ノードを削除"
          onClick={onDelete}
          className="absolute top-0 right-0 z-50 flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-destructive text-destructive bg-background cursor-pointer transition-all duration-150 ease-out hover:scale-105 hover:bg-red-50 dark:hover:bg-red-950/30 shadow-sm"
          style={{ transform: 'translate(8px, -8px)' }}
        >
          <Trash2 className="w-3 h-3 text-destructive" />
          <span className="text-[10px] font-medium text-destructive">削除</span>
        </div>
      )}
    </div>
  )
}
