'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { Arrow } from './Arrow'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

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
  onInferenceTypeChange?: (value: string) => void
  onValidityChange?: (value: string) => void
  inferenceTypeValue?: string
  validityValue?: string
  onImpossibleToggle?: (value: boolean) => void
  impossibleValue?: boolean
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
  currentStep,
  onInferenceTypeChange,
  onValidityChange,
  inferenceTypeValue = '',
  validityValue = '',
  onImpossibleToggle,
  impossibleValue = false
}: TriangleLogicDisplayProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="relative">
        {/* 逆正三角形のコンテナ */}
        <div className="relative w-[520px] h-96 mx-auto">
          {/* Step 1: 2ノード構成（左上・右上頂点） */}
          {currentStep >= 1 && (
            <>
              {/* 左上頂点 - 前件 */}
              <div className="absolute top-8 left-0">
                {currentStep === 1 ? (
                  <Select value={antecedentValue} onValueChange={onAntecedentChange}>
                    <SelectTrigger className="w-48 text-lg px-4 py-6 min-h-[70px]">
                      <SelectValue placeholder="選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((option) => (
                        <SelectItem key={option} value={option} className="text-lg py-3">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="w-48 h-16 text-lg px-4 py-6 min-h-[70px] border border-input bg-background rounded-md flex items-center justify-center">
                    <span className="text-lg">{antecedentValue || "選択されていません"}</span>
                  </div>
                )}
              </div>

              {/* 右上頂点 - 後件 */}
              <div className="absolute top-8 right-0">
                {currentStep === 1 ? (
                  <Select value={consequentValue} onValueChange={onConsequentChange}>
                    <SelectTrigger className="w-48 text-lg px-4 py-6 min-h-[70px]">
                      <SelectValue placeholder="選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((option) => (
                        <SelectItem key={option} value={option} className="text-lg py-3">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="w-48 h-16 text-lg px-4 py-6 min-h-[70px] border border-input bg-background rounded-md flex items-center justify-center">
                    <span className="text-lg">{consequentValue || "選択されていません"}</span>
                  </div>
                )}
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
                centerOverlay={
                  <Badge variant="secondary" className="border-2 border-muted-foreground">ならば</Badge>
                }
              />
            </>
          )}

          {/* Step 2: 3ノード構成（Step1 + 中央下頂点） */}
          {currentStep >= 2 && !impossibleValue && (
            <>
              {/* 中央下頂点 - 所与命題 */}
              <div className="absolute top-60 left-1/2 transform -translate-x-1/2">
                {currentStep === 2 ? (
                  <Select value={premiseValue} onValueChange={onPremiseChange}>
                    <SelectTrigger className="w-48 text-lg px-4 py-6 min-h-[70px]">
                      <SelectValue placeholder="選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((option) => (
                        <SelectItem key={option} value={option} className="text-lg py-3">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="w-48 h-16 text-lg px-4 py-6 min-h-[70px] border border-input bg-background rounded-md flex items-center justify-center">
                    <span className="text-lg">{premiseValue || "選択されていません"}</span>
                  </div>
                )}
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
                centerOverlay={
                  currentStep == 2 ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onLinkDirectionToggle('antecedent')}
                      className="h-8 w-8 rounded-full p-0 border-2 hover:shadow-sm hover:bg-secondary hover:opacity-100"
                      aria-label="方向切替"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  ) : <Badge variant="secondary" className={`border-2 ${antecedentLinkDirection ? "border-muted-foreground" : "border-orange-500"} `}>ならば</Badge>
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
                centerOverlay={
                  currentStep == 2 ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onLinkDirectionToggle('consequent')}
                      className="h-8 w-8 rounded-full p-0 border-2 hover:shadow-sm hover:bg-secondary hover:opacity-100"
                      aria-label="方向切替"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  ) : <Badge variant="secondary" className={`border-2 ${consequentLinkDirection ? "border-muted-foreground" : "border-orange-500"} `}>ならば</Badge>
                }
              />
            </>
          )}
        </div>

        {/* Step 2以上: 組み立て不可能トグル（Step3ではONのときのみ表示） */}
        {currentStep >= 2 && (currentStep < 3 || impossibleValue) && (
          <div className="absolute left-10 bottom-6 flex items-center gap-3">
            <span className="text-lg font-medium">前提の組み立て不可能</span>
            <Switch
              checked={impossibleValue}
              onCheckedChange={onImpossibleToggle}
              disabled={currentStep > 2}
              aria-readonly={currentStep > 2}
            />
          </div>
        )}
      </div>
    </div>
  )
}
