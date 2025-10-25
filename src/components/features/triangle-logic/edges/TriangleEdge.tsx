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
    onDelete?: () => void
  }
}

export function TriangleEdge({ id, source, target, style, data }: TriangleEdgeProps) {
  const sourceNode = useInternalNode(source)
  const targetNode = useInternalNode(target)
  const edges = useEdges()

  if (!sourceNode || !targetNode) return null

  const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode)

  // 双方向エッジをチェック（Step1の前件→後件も含む）
  const hasReverseEdge = edges.some(edge => 
    edge.source === target && edge.target === source && edge.id !== id
  )

  let edgePath: string
  let labelX: number
  let labelY: number

  if (hasReverseEdge) {
    // 双方向エッジの場合はベジェ曲線で弧を描画（重なりを確実に回避）
    const midX = (sx + tx) / 2
    const midY = (sy + ty) / 2
    const controlOffset = 80 // 弧の高さを大きくして重なりを回避
    const nodeOffset = 4 // ノード端からのオフセット
    
    // 現在のエッジが上向きか下向きかを決定（IDで判定）
    const reverseEdge = edges.find(edge => edge.source === target && edge.target === source)
    const isUpward = reverseEdge ? id < reverseEdge.id : false
    
    // 始点と終点のY座標をずらす（縦方向の隙間をあける）
    const adjustedSy = isUpward ? sy - nodeOffset : sy + nodeOffset
    const adjustedTy = isUpward ? ty - nodeOffset : ty + nodeOffset
    
    // 制御点を計算（始点と終点の中央より少し膨らんだ位置）
    const controlY = midY + (isUpward ? -controlOffset : controlOffset)
    
    // 制御点のX座標も調整（より自然な曲線にする）
    const controlX = midX + (isUpward ? -10 : 10) // 左右に少しずらして自然な曲線に
    
    edgePath = `M ${sx} ${adjustedSy} Q ${controlX} ${controlY} ${tx} ${adjustedTy}`
    
    // ベジェ曲線の実際の中央位置を計算（t=0.5の位置）
    const t = 0.5
    labelX = (1-t)*(1-t)*sx + 2*(1-t)*t*controlX + t*t*tx
    labelY = (1-t)*(1-t)*adjustedSy + 2*(1-t)*t*controlY + t*t*adjustedTy
  } else {
    // 通常の直線パス
    const [path, x, y] = getStraightPath({
      sourceX: sx,
      sourceY: sy,
      targetX: tx,
      targetY: ty,
    })
    edgePath = path
    labelX = x
    labelY = y
  }

  const { label, isActive = true, isDeletable = false, onDelete } = data || {}

  const edgeStyle = {
    ...style,
    stroke: isActive ? '#3b82f6' : '#ef4444',
    strokeWidth: isActive ? 3 : 2,
    strokeDasharray: isActive ? 'none' : '5,5',
    opacity: isActive ? 1 : 0.6,
    fill: 'none',
  }

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
          <circle cx="2" cy="2" r="1.5" fill={isActive ? '#3b82f6' : '#ef4444'} />
        </marker>
        <marker
          id={`arrow-${id}`}
          markerWidth="6"
          markerHeight="6"
          refX="4"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0.75 L0,5.25 L5,3 z" fill={isActive ? '#3b82f6' : '#ef4444'} />
        </marker>
      </defs>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerStart={`url(#circle-${id})`}
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
      {isDeletable && onDelete && (
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
              variant="destructive"
              size="sm"
              onClick={onDelete}
              className="h-6 w-6 rounded-full p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
