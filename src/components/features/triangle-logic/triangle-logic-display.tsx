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

// ========================================
// Step 1: 導出命題を構成（2ノード構成）
// ========================================
interface TriangleStep1Props {
  options: string[]
  antecedentValue: string
  consequentValue: string
  onAntecedentChange: (value: string) => void
  onConsequentChange: (value: string) => void
}

function TriangleStep1({
  options,
  antecedentValue,
  consequentValue,
  onAntecedentChange,
  onConsequentChange
}: TriangleStep1Props) {
  return (
    <div className="relative w-[520px] h-96 mx-auto scale-[0.6] sm:scale-75 md:scale-90 lg:scale-100 origin-top">
      {/* 左上頂点 - 前件 */}
      <div className="absolute top-12 left-0">
        <Select value={antecedentValue} onValueChange={onAntecedentChange}>
          <SelectTrigger className={`w-52 h-14 rounded-xl border-2 text-base px-4 transition-all ${
            antecedentValue 
              ? 'bg-primary/5 border-primary shadow-sm' 
              : 'bg-muted/30 border-muted-foreground/30 animate-glow-pulse'
          }`}>
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option} className="text-base py-2">
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 右上頂点 - 後件 */}
      <div className="absolute top-12 right-0">
        <Select value={consequentValue} onValueChange={onConsequentChange}>
          <SelectTrigger className={`w-52 h-14 rounded-xl border-2 text-base px-4 transition-all ${
            consequentValue 
              ? 'bg-primary/5 border-primary shadow-sm' 
              : 'bg-muted/30 border-muted-foreground/30 animate-glow-pulse'
          }`}>
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option} className="text-base py-2">
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 導出命題の矢印 */}
      <Arrow
        centerX={260}
        centerY={75}
        length={150}
        angleDeg={0}
        colorClassName="text-primary"
        strokeWidth={4}
        dashed={false}
        showStartDot
        centerOverlay={
          <Badge variant="secondary" className="border-2 border-primary bg-primary/10 text-primary font-semibold px-3 py-1">
            ならば
          </Badge>
        }
      />
    </div>
  )
}

// ========================================
// Step 2: 三角ロジックの構成（3ノード構成）
// ========================================
interface TriangleStep2Props {
  options: string[]
  antecedentValue: string
  consequentValue: string
  premiseValue: string
  antecedentLinkDirection: boolean
  consequentLinkDirection: boolean
  onPremiseChange: (value: string) => void
  onLinkDirectionToggle: (linkType: 'antecedent' | 'consequent') => void
  impossibleValue: boolean
}

function TriangleStep2({
  options,
  antecedentValue,
  consequentValue,
  premiseValue,
  antecedentLinkDirection,
  consequentLinkDirection,
  onPremiseChange,
  onLinkDirectionToggle,
  impossibleValue
}: TriangleStep2Props) {
  return (
    <div className="relative w-[520px] h-96 mx-auto scale-[0.6] sm:scale-75 md:scale-90 lg:scale-100 origin-top">
      {/* 左上頂点 - 前件（読み取り専用） */}
      <div className="absolute top-8 left-0">
        <div className="w-48 h-16 text-lg px-4 py-6 min-h-[70px] border border-input bg-background rounded-md flex items-center justify-center">
          <span className="text-lg">{antecedentValue || "選択されていません"}</span>
        </div>
      </div>

      {/* 右上頂点 - 後件（読み取り専用） */}
      <div className="absolute top-8 right-0">
        <div className="w-48 h-16 text-lg px-4 py-6 min-h-[70px] border border-input bg-background rounded-md flex items-center justify-center">
          <span className="text-lg">{consequentValue || "選択されていません"}</span>
        </div>
      </div>

      {/* 導出命題の矢印 */}
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

      {/* 組み立て不可能でない場合のみ3ノード構成を表示 */}
      {!impossibleValue && (
        <>
          {/* 中央下頂点 - 所与命題 */}
          <div className="absolute top-60 left-1/2 transform -translate-x-1/2">
            <Select value={premiseValue} onValueChange={onPremiseChange}>
              <SelectTrigger className={`w-48 text-lg px-4 py-6 min-h-[70px] ${premiseValue ? '' : 'animate-glow-pulse rounded-md'}`}>
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
          </div>

          {/* 所与命題から前件への矢印 */}
          <Arrow
            centerX={180}
            centerY={170}
            length={160}
            angleDeg={antecedentLinkDirection ? 45 : 225}
            colorClassName={antecedentLinkDirection ? "text-muted-foreground" : "text-orange-500"}
            strokeWidth={4}
            dashed={true}
            showStartDot
            centerOverlay={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onLinkDirectionToggle('antecedent')}
                className="h-8 w-8 rounded-full p-0 border-2 hover:shadow-sm hover:bg-secondary hover:opacity-100 animate-glow-pulse"
                aria-label="方向切替"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            }
          />

          {/* 所与命題から後件への矢印 */}
          <Arrow
            centerX={340}
            centerY={170}
            length={160}
            angleDeg={consequentLinkDirection ? -45 : 135}
            colorClassName={consequentLinkDirection ? "text-muted-foreground" : "text-orange-500"}
            strokeWidth={4}
            dashed={true}
            showStartDot
            centerOverlay={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onLinkDirectionToggle('consequent')}
                className="h-8 w-8 rounded-full p-0 border-2 hover:shadow-sm hover:bg-secondary hover:opacity-100 animate-glow-pulse"
                aria-label="方向切替"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            }
          />
        </>
      )}
    </div>
  )
}

// ========================================
// Step 3: 推論形式と妥当性の判別（読み取り専用）
// ========================================
interface TriangleStep3Props {
  options: string[]
  antecedentValue: string
  consequentValue: string
  premiseValue: string
  antecedentLinkDirection: boolean
  consequentLinkDirection: boolean
  impossibleValue: boolean
}

function TriangleStep3({
  options,
  antecedentValue,
  consequentValue,
  premiseValue,
  antecedentLinkDirection,
  consequentLinkDirection,
  impossibleValue
}: TriangleStep3Props) {
  return (
    <div className="relative w-[520px] h-96 mx-auto scale-[0.6] sm:scale-75 md:scale-90 lg:scale-100 origin-top">
      {/* 左上頂点 - 前件（読み取り専用） */}
      <div className="absolute top-8 left-0">
        <div className="w-48 h-16 text-lg px-4 py-6 min-h-[70px] border border-input bg-background rounded-md flex items-center justify-center">
          <span className="text-lg">{antecedentValue || "選択されていません"}</span>
        </div>
      </div>

      {/* 右上頂点 - 後件（読み取り専用） */}
      <div className="absolute top-8 right-0">
        <div className="w-48 h-16 text-lg px-4 py-6 min-h-[70px] border border-input bg-background rounded-md flex items-center justify-center">
          <span className="text-lg">{consequentValue || "選択されていません"}</span>
        </div>
      </div>

      {/* 導出命題の矢印 */}
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

      {/* 組み立て不可能でない場合のみ3ノード構成を表示 */}
      {!impossibleValue && (
        <>
          {/* 中央下頂点 - 所与命題（読み取り専用） */}
          <div className="absolute top-60 left-1/2 transform -translate-x-1/2">
            <div className="w-48 h-16 text-lg px-4 py-6 min-h-[70px] border border-input bg-background rounded-md flex items-center justify-center">
              <span className="text-lg">{premiseValue || "選択されていません"}</span>
            </div>
          </div>

          {/* 所与命題から前件への矢印（読み取り専用） */}
          <Arrow
            centerX={180}
            centerY={170}
            length={160}
            angleDeg={antecedentLinkDirection ? 45 : 225}
            colorClassName={antecedentLinkDirection ? "text-muted-foreground" : "text-orange-500"}
            strokeWidth={4}
            dashed={true}
            showStartDot
            centerOverlay={
              <Badge variant="secondary" className={`border-2 ${antecedentLinkDirection ? "border-muted-foreground" : "border-orange-500"}`}>
                ならば
              </Badge>
            }
          />

          {/* 所与命題から後件への矢印（読み取り専用） */}
          <Arrow
            centerX={340}
            centerY={170}
            length={160}
            angleDeg={consequentLinkDirection ? -45 : 135}
            colorClassName={consequentLinkDirection ? "text-muted-foreground" : "text-orange-500"}
            strokeWidth={4}
            dashed={true}
            showStartDot
            centerOverlay={
              <Badge variant="secondary" className={`border-2 ${consequentLinkDirection ? "border-muted-foreground" : "border-orange-500"}`}>
                ならば
              </Badge>
            }
          />
        </>
      )}
    </div>
  )
}

// ========================================
// メインコンポーネント
// ========================================
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
        {/* ステップごとに三角ロジック全体を切り替え */}
        {currentStep === 1 && (
          <TriangleStep1
            options={options}
            antecedentValue={antecedentValue}
            consequentValue={consequentValue}
            onAntecedentChange={onAntecedentChange}
            onConsequentChange={onConsequentChange}
          />
        )}

        {currentStep === 2 && (
          <TriangleStep2
            options={options}
            antecedentValue={antecedentValue}
            consequentValue={consequentValue}
            premiseValue={premiseValue}
            antecedentLinkDirection={antecedentLinkDirection}
            consequentLinkDirection={consequentLinkDirection}
            onPremiseChange={onPremiseChange}
            onLinkDirectionToggle={onLinkDirectionToggle}
            impossibleValue={impossibleValue}
          />
        )}

        {currentStep === 3 && (
          <TriangleStep3
            options={options}
            antecedentValue={antecedentValue}
            consequentValue={consequentValue}
            premiseValue={premiseValue}
            antecedentLinkDirection={antecedentLinkDirection}
            consequentLinkDirection={consequentLinkDirection}
            impossibleValue={impossibleValue}
          />
        )}

        {/* 共通UI: 組み立て不可能トグル（Step2以上で表示） */}
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
