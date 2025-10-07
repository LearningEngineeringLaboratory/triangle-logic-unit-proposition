'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { Arrow } from './Arrow'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface TriangleLogicDisplayProps {
  options: string[]
  onAntecedentChange: (value: string) => void
  onConsequentChange: (value: string) => void
  onPremiseChange: (value: string) => void
  onLinkDirectionToggle: (linkType: 'antecedent' | 'consequent') => void
  antecedentValue?: string
  consequentValue?: string
  premiseValue?: string
  antecedentLinkDirection?: boolean
  consequentLinkDirection?: boolean
  currentStep: number
}

export function TriangleLogicDisplay({
  options,
  onAntecedentChange,
  onConsequentChange,
  onPremiseChange,
  onLinkDirectionToggle,
  antecedentValue = '',
  consequentValue = '',
  premiseValue = '',
  antecedentLinkDirection = true,
  consequentLinkDirection = true,
  currentStep
}: TriangleLogicDisplayProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        {/* 逆正三角形のコンテナ */}
        <div className="relative w-[520px] h-96 mx-auto">
          {/* Step 1: 2ノード構成（左上・右上頂点） */}
          {currentStep >= 1 && (
            <>
              {/* 左上頂点 - 前件 */}
              <div className="absolute top-8 left-0">
                <Select value={antecedentValue} onValueChange={onAntecedentChange}>
                  <SelectTrigger className="w-48 h-20 text-lg px-4 py-6 min-h-[70px]">
                    <SelectValue placeholder="前件" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option} value={option} className="text-lg py-3">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 右上頂点 - 後件 */}
              <div className="absolute top-8 right-0">
                <Select value={consequentValue} onValueChange={onConsequentChange}>
                  <SelectTrigger className="w-48 h-20 text-lg px-4 py-6 min-h-[70px]">
                    <SelectValue placeholder="後件" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option} value={option} className="text-lg py-3">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 導出命題の矢印（常に表示） */}
              <Arrow
                centerX={260}
                centerY={70}
                length={130}
                angleDeg={0}
                colorClassName="text-muted-foreground"
                strokeWidth={6}
                dashed={false}
                showStartDot
                startDotRadius={6}
              />
            </>
          )}

          {/* Step 2: 3ノード構成（Step1 + 中央下頂点） */}
          {currentStep >= 2 && (
            <>
              {/* 中央下頂点 - 所与命題 */}
              <div className="absolute top-60 left-1/2 transform -translate-x-1/2">
                <Select value={premiseValue} onValueChange={onPremiseChange}>
                  <SelectTrigger className="w-48 h-20 text-lg px-4 py-6 min-h-[70px]">
                    <SelectValue placeholder="所与命題" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option} value={option} className="text-lg py-3">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 所与命題から前件への矢印（常に表示） */}
              <Arrow
                centerX={180}
                centerY={170}
                length={160}
                angleDeg={antecedentLinkDirection ? 45 : 225}
                colorClassName={antecedentLinkDirection ? "text-muted-foreground" : "text-orange-500"}
                strokeWidth={6}
                dashed={true}
                showStartDot
                startDotRadius={6}
                centerOverlay={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onLinkDirectionToggle('antecedent')}
                    className="h-8 w-8 rounded-full p-0 border-2 hover:shadow-sm hover:bg-secondary hover:opacity-100"
                    aria-label="方向切替"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                }
              />

              {/* 所与命題から後件への矢印（常に表示） */}
              <Arrow
                centerX={340}
                centerY={170}
                length={160}
                angleDeg={consequentLinkDirection ? -45 : 135}
                colorClassName={consequentLinkDirection ? "text-muted-foreground" : "text-orange-500"}
                strokeWidth={6}
                dashed={true}
                showStartDot
                startDotRadius={6}
                centerOverlay={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onLinkDirectionToggle('consequent')}
                    className="h-8 w-8 rounded-full p-0 border-2 hover:shadow-sm hover:bg-secondary hover:opacity-100"
                    aria-label="方向切替"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                }
              />
            </>
          )}

          {/* Step 3: 表示のみ（操作不可） */}
          {currentStep >= 3 && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">推論形式と妥当性</div>
                <div className="text-lg font-medium">
                  {antecedentValue} → {consequentValue}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
