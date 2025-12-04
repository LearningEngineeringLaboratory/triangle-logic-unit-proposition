'use client'

import { Handle, Position, useConnection } from '@xyflow/react'

interface NodeHandlesProps {
  nodeId: string
  showHandles?: boolean
}

export function NodeHandles({ nodeId, showHandles = true }: NodeHandlesProps) {
  const connection = useConnection()
  // ConnectionState が null でなければ「どこかのハンドルを掴んで接続操作中」
  const isConnecting = !!(connection && (connection as any).fromNode)
  const targetExpansion = 12 // px: ノード外側に広げるターゲット範囲

  return (
    <>
      {/* ノード全体を入力用ハンドルとして機能させる */}
      {showHandles && (
        <Handle
          type="target"
          position={Position.Top}
          id={`${nodeId}-target`}
          isConnectableStart={false}
          style={
            isConnecting
              ? {
                  // 接続操作中のみ、ノード外側まで広げてターゲット判定を優先
                  width: `calc(100% + ${targetExpansion * 2}px)`,
                  height: `calc(100% + ${targetExpansion * 2}px)`,
                  top: -targetExpansion,
                  left: -targetExpansion,
                  borderRadius: '12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  transform: 'none',
                  // ノード本体より前面に出して、接続中はターゲット判定を優先
                  zIndex: 40,
                  // 接続中はターゲットとしてマウスイベントを受ける
                  pointerEvents: 'auto',
                }
              : {
                  // 通常時はノード本体の範囲に限定し、ドラッグを優先
                  width: '100%',
                  height: '100%',
                  top: 0,
                  left: 0,
                  borderRadius: '12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  transform: 'none',
                  // 通常時はノード本体と同レイヤー以下にしつつ、イベントは透過
                  zIndex: 0,
                  // ノードドラッグを妨げないようにマウスイベントは透過する
                  pointerEvents: 'none',
                }
          }
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
              top: 48,
              left: 134,
              width: 20,
              height: 20,
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '50%',
              // ニューモーフィズムの凹んだ効果（内側の影）
              boxShadow: `
                inset 2px 2px 4px rgba(0, 0, 0, 0.15),
                inset -2px -2px 4px rgba(255, 255, 255, 0.8)
              `,
              // 常に最前面に出して、矢印ドラッグを優先
              zIndex: 50,
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
            isConnectableStart={false}
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

