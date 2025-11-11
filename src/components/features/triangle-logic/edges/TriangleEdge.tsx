'use client'

import { useInternalNode, getStraightPath, EdgeProps, EdgeLabelRenderer, useEdges } from '@xyflow/react'
import { getEdgeParams } from '../utils/edgeUtils'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface TriangleEdgeProps extends EdgeProps {
  data?: {
    label?: string
    isActive?: boolean
    isDeletable?: boolean
    isToggleable?: boolean
    onDelete?: () => void
    onToggle?: () => void
    arrowType?: 'triangle' | 'arrow' // 矢印の形状: 'triangle' = 三角形, 'arrow' = →形
    strokeWidth?: number // エッジの太さ（デフォルト: isActive ? 3 : 2）
    strokeColor?: string // エッジの色（デフォルト: isActive ? '#3b82f6' : '#94a3b8'）
    showCircleMarker?: boolean // 円マーカー（始点）の表示/非表示（デフォルト: true）
  }
}

export function TriangleEdge({ id, source, target, style, data }: TriangleEdgeProps) {
  const sourceNode = useInternalNode(source)
  const targetNode = useInternalNode(target)
  const edges = useEdges()

  if (!sourceNode || !targetNode) return null

  const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode)
  const { arrowType = 'arrow' } = data || {}

  // 双方向エッジをチェック（Step1の前件→後件も含む）
  const hasReverseEdge = edges.some(edge =>
    edge.source === target && edge.target === source && edge.id !== id
  )

  // 三角形の矢印の場合、エッジの終点を短くする
  const shortenAmount = arrowType === 'triangle' ? 8 : 0
  let adjustedTx = tx
  let adjustedTy = ty
  if (shortenAmount > 0) {
    const dx = tx - sx
    const dy = ty - sy
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance > 0) {
      const ratio = (distance - shortenAmount) / distance
      adjustedTx = sx + dx * ratio
      adjustedTy = sy + dy * ratio
    }
  }

  let edgePath: string
  let labelX: number
  let labelY: number

  if (hasReverseEdge) {
    // 双方向エッジの場合はベジェ曲線で弧を描画（重なりを確実に回避）
    const midX = (sx + adjustedTx) / 2
    const midY = (sy + adjustedTy) / 2
    // const controlOffset = 80 // 弧の高さを大きくして重なりを回避
    const nodeOffset = 2 // ノード端からのオフセット

    // 現在のエッジが上向きか下向きかを決定（IDで判定）
    const reverseEdge = edges.find(edge => edge.source === target && edge.target === source)
    const isUpward = reverseEdge ? id < reverseEdge.id : false

    // 始点と終点のY座標をずらす（縦方向の隙間をあける）
    const adjustedSy = isUpward ? sy - nodeOffset : sy + nodeOffset
    const finalAdjustedTy = isUpward ? adjustedTy - nodeOffset : adjustedTy + nodeOffset

    // 制御点を計算（始点と終点を結ぶ直線の垂直二等分線上）
    const dx = adjustedTx - sx
    const dy = adjustedTy - sy
    const distance = Math.sqrt(dx * dx + dy * dy)

    // 垂直二等分線の方向ベクトル（時計回りに90度回転）
    const perpX = -dy / distance
    const perpY = dx / distance

    // 制御点の位置（垂直二等分線上で、距離に応じて調整）
    const offsetDistance = Math.min(distance * 0.3, 60) // 距離の30%または最大60px
    // 互いに逆向きの弧を描くため、IDの偶奇で方向を決定
    const direction = parseInt(id.split('-')[0]) % 2 === 0 ? 1 : -1
    const controlX = midX + perpX * offsetDistance * direction
    const controlY = midY + perpY * offsetDistance * direction

    edgePath = `M ${sx} ${adjustedSy} Q ${controlX} ${controlY} ${adjustedTx} ${finalAdjustedTy}`

    // ベジェ曲線の実際の中央位置を計算（t=0.5の位置）
    const t = 0.5
    labelX = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * controlX + t * t * adjustedTx
    labelY = (1 - t) * (1 - t) * adjustedSy + 2 * (1 - t) * t * controlY + t * t * finalAdjustedTy
  } else {
    // 通常の直線パス
    const [path, x, y] = getStraightPath({
      sourceX: sx,
      sourceY: sy,
      targetX: adjustedTx,
      targetY: adjustedTy,
    })
    edgePath = path
    labelX = x
    labelY = y
  }

  const { label, isActive = true, isDeletable = false, isToggleable = false, onDelete, onToggle, strokeWidth, strokeColor, showCircleMarker = true } = data || {}

  // デフォルト値の設定
  const defaultStrokeWidth = isActive ? 3 : 2
  const defaultStrokeColor = isActive ? 'oklch(0.36 0.14 279)' : '#94a3b8'
  const defaultMarkerColor = isActive ? 'oklch(0.36 0.14 279)' : '#ef4444'

  const edgeStyle = {
    ...style,
    stroke: strokeColor ?? defaultStrokeColor,
    strokeWidth: strokeWidth ?? defaultStrokeWidth,
    strokeDasharray: isActive ? 'none' : '5,5',
    strokeLinecap: 'round' as const,
    opacity: isActive ? 1 : 0.4,
    fill: 'none',
  }

  const markerColor = strokeColor ?? defaultMarkerColor

  return (
    <>
      <defs>
        <marker
          id={`circle-${id}`}
          markerWidth="4"
          markerHeight="4"
          refX="2"
          refY="2"
          markerUnits="strokeWidth"
        >
          <circle cx="2" cy="2" r="1.5" fill={markerColor} />
        </marker>
        <marker
          id={`arrow-${id}`}
          markerWidth={arrowType === 'arrow' ? '8' : '6'}
          markerHeight={arrowType === 'arrow' ? '8' : '6'}
          refX={arrowType === 'arrow' ? '7' : '4'}
          refY={arrowType === 'arrow' ? '4' : '3'}
          orient="auto"
          markerUnits="strokeWidth"
        >
          {arrowType === 'arrow' ? (
            // →形の矢印（横線 + 矢印の先端）
            <>
              <path d="M7,4 L4.7,2 M7,4 L4.7,6" stroke={markerColor} strokeWidth="1" strokeLinecap="round" fill="none" />
            </>
          ) : (
            // 三角形の矢印（従来の形状）
            <path d="M2.2,1.5 L2.2,4.5 L5.2,3 z" fill={markerColor} />
          )}
        </marker>
      </defs>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerStart={showCircleMarker ? `url(#circle-${id})` : undefined}
        markerEnd={`url(#arrow-${id})`}
        style={edgeStyle}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan p-1 bg-background border border-border rounded-md text-xs"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
      {/* Step2のエッジ：active切り替えボタン */}
      {isToggleable && onToggle && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
          >
            <Button
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={onToggle}
              className="h-6 w-6 rounded-full p-0"
              title={isActive ? '非表示にする' : '表示する'}
            >
              {isActive ? '●' : '○'}
            </Button>
          </div>
        </EdgeLabelRenderer>
      )}
      {/* Step4で新規作成したエッジ：削除ボタン */}
      {isDeletable && onDelete && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan"
            style={{
              position: 'absolute',
              left: labelX,
              top: labelY,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'all',
            }}
          >
            <div
              role="button"
              aria-label="エッジを削除"
              onClick={onDelete}
              className="grid place-items-center rounded-full bg-destructive text-destructive-foreground cursor-pointer transition-transform duration-150 ease-out hover:scale-[1.08]"
              style={{ width: '14px', height: '14px', lineHeight: 0 }}
            >
              <X strokeWidth={4} className="text-white" style={{ width: '10px', height: '10px' }} />
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
