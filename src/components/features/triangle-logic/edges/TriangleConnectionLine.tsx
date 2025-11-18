'use client'

import { ConnectionLineComponentProps, InternalNode } from '@xyflow/react'
import { getEdgeParams } from '../utils/edgeUtils'

interface MarkerColors {
  stroke: string
  markerFill: string
  strokeDasharray: string | undefined
  opacity: number
  strokeWidth: number
}

export const TriangleConnectionLine = ({
  fromX,
  fromY,
  toX,
  toY,
  fromNode,
  toNode,
  connectionStatus,
  connectionLineStyle,
}: ConnectionLineComponentProps) => {
  const isInvalid = connectionStatus === 'invalid'

  const colors: MarkerColors = isInvalid
    ? {
        stroke: '#ef4444',
        markerFill: '#ef4444',
        strokeDasharray: '5,5',
        opacity: 0.7,
        strokeWidth: 2,
      }
    : {
        stroke: 'oklch(0.36 0.14 279)',
        markerFill: 'oklch(0.36 0.14 279)',
        strokeDasharray: undefined,
        opacity: 1,
        strokeWidth: 3,
      }

  function getIntersectionFromNodeToPoint(node: InternalNode, px: number, py: number) {
    const nodeWidth = node.measured?.width || 0
    const nodeHeight = node.measured?.height || 0
    const nx = node.internals.positionAbsolute.x
    const ny = node.internals.positionAbsolute.y
    const cx = nx + nodeWidth / 2
    const cy = ny + nodeHeight / 2

    const dx = px - cx
    const dy = py - cy
    if (dx === 0 && dy === 0) return { x: cx, y: cy }

    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)
    let scale = 1
    if (absDx / (nodeWidth / 2) > absDy / (nodeHeight / 2)) {
      scale = (nodeWidth / 2) / absDx
    } else {
      scale = (nodeHeight / 2) / absDy
    }

    return { x: cx + dx * scale, y: cy + dy * scale }
  }

  let sx = fromX
  let sy = fromY
  let tx = toX
  let ty = toY

  if (fromNode && toNode) {
    const params = getEdgeParams(fromNode, toNode)
    sx = params.sx
    sy = params.sy
    tx = params.tx
    ty = params.ty
  } else if (fromNode && !toNode) {
    const p = getIntersectionFromNodeToPoint(fromNode, toX, toY)
    sx = p.x
    sy = p.y
    tx = toX
    ty = toY
  }

  const pathD = `M ${sx} ${sy} L ${tx} ${ty}`

  return (
    <g>
      <defs>
        <marker
          id={`tlu-conn-circle`}
          markerWidth="4"
          markerHeight="4"
          refX="2"
          refY="2"
          markerUnits="strokeWidth"
        >
          <circle cx="2" cy="2" r="1.5" fill={colors.markerFill} />
        </marker>
        <marker
          id={`tlu-conn-arrow`}
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          {/* →形の矢印（矢印の先端のみ） */}
          <path d="M7,4 L4.7,2 M7,4 L4.7,6" stroke={colors.markerFill} strokeWidth="1" strokeLinecap="round" fill="none" />
        </marker>
      </defs>
      <path
        d={pathD}
        markerStart={`url(#tlu-conn-circle)`}
        markerEnd={`url(#tlu-conn-arrow)`}
        style={{
          ...connectionLineStyle,
          stroke: colors.stroke,
          strokeWidth: colors.strokeWidth,
          strokeDasharray: colors.strokeDasharray,
          opacity: colors.opacity,
          fill: 'none',
        }}
      />
    </g>
  )
}


