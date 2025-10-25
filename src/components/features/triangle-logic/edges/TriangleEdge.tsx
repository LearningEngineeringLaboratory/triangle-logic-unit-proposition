'use client'

import { useInternalNode, getStraightPath, EdgeProps, EdgeLabelRenderer } from '@xyflow/react'
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

  if (!sourceNode || !targetNode) return null

  const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode)

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX: sx,
    sourceY: sy,
    targetX: tx,
    targetY: ty,
  })

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
          <path d="M0,0.5 L0,5.5 L5,3 z" fill={isActive ? '#3b82f6' : '#ef4444'} />
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
