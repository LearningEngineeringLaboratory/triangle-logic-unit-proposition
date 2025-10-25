'use client'

import { Position } from '@xyflow/react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useMemo } from 'react'

interface TriangleEdgeProps {
  id: string
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourcePosition: Position
  targetPosition: Position
  style?: React.CSSProperties
  data?: {
    label?: string
    isActive?: boolean
    isDeletable?: boolean
    onDelete?: () => void
  }
}

export function TriangleEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data
}: TriangleEdgeProps) {
  const { label, isActive = true, isDeletable = false, onDelete } = data || {}

  // エッジのパスを計算
  const edgePath = useMemo(() => {
    const offsetX = targetX - sourceX
    const offsetY = targetY - sourceY
    const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY)
    
    // 双方向リンクの場合は弧を描く
    const isBidirectional = Math.abs(offsetX) < 50 && Math.abs(offsetY) < 50
    
    if (isBidirectional) {
      const radius = 30
      const controlX = sourceX + offsetX / 2
      const controlY = sourceY - radius
      return `M ${sourceX} ${sourceY} Q ${controlX} ${controlY} ${targetX} ${targetY}`
    }
    
    return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`
  }, [sourceX, sourceY, targetX, targetY])

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
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={edgeStyle}
      />
      {label && (
        <text>
          <textPath href={`#${id}`} style={{ fontSize: 12, fill: '#64748b' }}>
            {label}
          </textPath>
        </text>
      )}
      {isDeletable && onDelete && (
        <foreignObject
          x={(sourceX + targetX) / 2 - 10}
          y={(sourceY + targetY) / 2 - 10}
          width={20}
          height={20}
        >
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="h-6 w-6 rounded-full p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </foreignObject>
      )}
    </>
  )
}
