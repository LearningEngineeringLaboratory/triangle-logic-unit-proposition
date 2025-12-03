'use client'

import { Handle, Position, useConnection } from '@xyflow/react'

interface NodeHandlesProps {
  nodeId: string
  showHandles?: boolean
}

export function NodeHandles({ nodeId, showHandles = true }: NodeHandlesProps) {
  const { inProgress } = useConnection()
  const hideHandleVisual = inProgress === true

  return (
    <>
      {/* ノード全体を入力用ハンドルとして機能させる */}
      {showHandles && (
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
              zIndex: 10,
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

