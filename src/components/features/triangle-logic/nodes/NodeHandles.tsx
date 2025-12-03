'use client'

import { Handle, Position, useConnection } from '@xyflow/react'

interface NodeHandlesProps {
  nodeId: string
  showHandles?: boolean
}

export function NodeHandles({ nodeId, showHandles = true }: NodeHandlesProps) {
  const { inProgress } = useConnection()
  const isConnecting = inProgress === true
  const hideHandleVisual = isConnecting
  const targetExpansion = 12 // px: ノード外側に広げる判定範囲

  return (
    <>
      {/* 入力ハンドル領域の可視化用オーバーレイ */}
      {showHandles && (
        <div
          className={`absolute rounded-xl pointer-events-none transition-opacity ${
            isConnecting
              ? 'opacity-100 border-2 border-sky-400/80 bg-sky-200/40'
              : 'opacity-60 border border-dashed border-sky-300/70 bg-sky-200/20'
          }`}
          style={{
            top: -targetExpansion,
            left: -targetExpansion,
            right: -targetExpansion,
            bottom: -targetExpansion,
          }}
        />
      )}

      {/* ノード全体を入力用ハンドルとして機能させる */}
      {showHandles && (
        <Handle
          type="target"
          position={Position.Top}
          id={`${nodeId}-target`}
          style={{
            width: `calc(100% + ${targetExpansion * 2}px)`,
            height: `calc(100% + ${targetExpansion * 2}px)`,
            top: -targetExpansion,
            left: -targetExpansion,
            borderRadius: '12px',
            backgroundColor: 'transparent',
            border: 'none',
            transform: 'none',
            // sourceハンドルよりは低くして、ドラッグ開始を邪魔しない
            zIndex: 5,
            pointerEvents: 'auto',
          }}
        />
      )}

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
            // 常に最前面に出して、矢印ドラッグを優先
            zIndex: 50,
              opacity: hideHandleVisual ? 0 : 1,
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
                color: 'oklch(0.36 0.14 279)',
                transform: 'rotate(45deg)',
                fontWeight: 'bold',
                textShadow: '1px 1px 4px rgba(0, 0, 0, 0.3)',
                opacity: hideHandleVisual ? 0 : 1,
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
            type="target"
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
    </>
  )
}

