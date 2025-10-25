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

  // 双方向エッジをチェック
  const hasReverseEdge = edges.some(edge => 
    edge.source === target && edge.target === source && edge.id !== id
  )

  let edgePath: string
  let labelX: number
  let labelY: number

  if (hasReverseEdge) {
    // 双方向エッジの場合は弧状のパスを描画
    const midX = (sx + tx) / 2
    const midY = (sy + ty) / 2
    const controlOffset = 50 // 弧の高さ
    
    // 現在のエッジが上向きか下向きかを決定（IDで判定）
    const reverseEdge = edges.find(edge => edge.source === target && edge.target === source)
    const isUpward = reverseEdge ? id < reverseEdge.id : false
    
    const controlY = isUpward ? midY - controlOffset : midY + controlOffset
    
    edgePath = `M ${sx} ${sy} Q ${midX} ${controlY} ${tx} ${ty}`
    labelX = midX
    labelY = controlY
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
