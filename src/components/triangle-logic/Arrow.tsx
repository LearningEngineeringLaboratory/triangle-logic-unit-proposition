'use client'

import React from 'react'

interface ArrowProps {
  centerX: number // 矢印の中央X座標（px）
  centerY: number // 矢印の中央Y座標（px）
  length: number // 矢印の全長（px）
  angleDeg?: number // 回転角度（度）0度は右向き
  colorClassName?: string // Tailwindの色クラス（text-xxx-yyy）
  strokeWidth?: number // 線の太さ
  dashed?: boolean // 点線かどうか
  showStartDot?: boolean // 始点の円を表示するか
  startDotRadius?: number // 始点円の半径
  centerOverlay?: React.ReactNode // 矢印の中央に重ねるオーバーレイ（ボタン等）
}

export const Arrow: React.FC<ArrowProps> = ({
  centerX,
  centerY,
  length,
  angleDeg = 0,
  colorClassName = 'text-muted-foreground',
  strokeWidth = 6,
  dashed = false,
  showStartDot = true,
  startDotRadius = 6,
  centerOverlay,
}) => {
  // ローカルSVG座標（常に右向きベースで描画）
  const svgWidth = Math.max(length + 40, 100)
  const svgHeight = Math.max(strokeWidth * 6 + 40, 60)
  const localCenterY = svgHeight / 2
  const x1 = 20
  const y1 = localCenterY
  const x2 = svgWidth - 20
  const y2 = localCenterY

  // 先端三角形（右向き基準）
  const tipX = x2
  const tipY = localCenterY
  const tipPoints = `${tipX - 20},${tipY - 8} ${tipX + 4},${tipY} ${tipX - 20},${tipY + 8}`

  const dashProps = dashed ? { strokeDasharray: '8 6' } : {}

  return (
    <div
      className="absolute z-20"
      style={{ left: centerX - svgWidth / 2, top: centerY - svgHeight / 2, width: svgWidth, height: svgHeight }}
    >
      <svg
        width={svgWidth}
        height={svgHeight}
        className="pointer-events-none"
        style={{ transform: `rotate(${angleDeg}deg)`, transformOrigin: 'center' }}
      >
        {/* 線 */}
        <line
          x1={x1}
          y1={y1}
          x2={x2 - 20}
          y2={y2}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={colorClassName}
          {...dashProps}
        />
        {/* 始点の円 */}
        {showStartDot && (
          <circle cx={x1 + 5} cy={y1} r={startDotRadius} fill="currentColor" className={colorClassName} />
        )}
        {/* 先端の三角形 */}
        <polygon points={tipPoints} fill="currentColor" className={colorClassName} />
      </svg>
      {centerOverlay ? (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
          {centerOverlay}
        </div>
      ) : null}
    </div>
  )
}


