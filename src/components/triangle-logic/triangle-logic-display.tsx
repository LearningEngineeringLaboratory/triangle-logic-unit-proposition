'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
    <div className="w-full max-w-md mx-auto">
      <div className="relative">
        {/* 逆正三角形のコンテナ */}
        <div className="relative w-80 h-80 mx-auto">
          {/* Step 1: 2ノード構成（左上・右上頂点） */}
          {currentStep >= 1 && (
            <>
              {/* 左上頂点 - 前件 */}
              <div className="absolute top-8 left-8">
                <Select value={antecedentValue} onValueChange={onAntecedentChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="前件" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 右上頂点 - 後件 */}
              <div className="absolute top-8 right-8">
                <Select value={consequentValue} onValueChange={onConsequentChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="後件" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 導出命題の矢印 */}
              {antecedentValue && consequentValue && (
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{antecedentValue}</span>
                    <span className="text-lg">→</span>
                    <span className="text-sm font-medium">{consequentValue}</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Step 2: 3ノード構成（Step1 + 中央下頂点） */}
          {currentStep >= 2 && (
            <>
              {/* 中央下頂点 - 所与命題 */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <Select value={premiseValue} onValueChange={onPremiseChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="所与命題" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 所与命題のリンク */}
              {premiseValue && antecedentValue && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{premiseValue}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onLinkDirectionToggle('antecedent')}
                      className="px-2"
                    >
                      {antecedentLinkDirection ? '→' : '←'}
                    </Button>
                    <span className="text-sm font-medium">{antecedentValue}</span>
                  </div>
                </div>
              )}

              {premiseValue && consequentValue && (
                <div className="absolute top-20 right-1/2 transform translate-x-1/2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{premiseValue}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onLinkDirectionToggle('consequent')}
                      className="px-2"
                    >
                      {consequentLinkDirection ? '→' : '←'}
                    </Button>
                    <span className="text-sm font-medium">{consequentValue}</span>
                  </div>
                </div>
              )}
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
