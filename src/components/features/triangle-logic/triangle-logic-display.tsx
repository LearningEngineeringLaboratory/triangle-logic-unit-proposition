'use client'
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
  onImpossibleToggle?: (value: boolean) => void
  impossibleValue?: boolean
  // Step5のprops
  premise1Value?: string
  premise2Value?: string
  premise3Value?: string
  premise4Value?: string
  onPremise1Change?: (value: string) => void
  onPremise2Change?: (value: string) => void
  onPremise3Change?: (value: string) => void
  onPremise4Change?: (value: string) => void
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
      <div className="absolute top-40 left-0">
        <Select value={antecedentValue} onValueChange={onAntecedentChange}>
          <SelectTrigger className={`w-48 text-lg px-4 py-6 min-h-[70px] ${antecedentValue ? '' : 'animate-glow-pulse rounded-md'}`}>
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

      {/* 右上頂点 - 後件 */}
      <div className="absolute top-40 right-0">
        <Select value={consequentValue} onValueChange={onConsequentChange}>
          <SelectTrigger className={`w-48 text-lg px-4 py-6 min-h-[70px] ${consequentValue ? '' : 'animate-glow-pulse rounded-md'}`}>
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

      {/* 導出命題の矢印 */}
      <Arrow
        centerX={260}
        centerY={195}
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
  antecedentValue: string
  consequentValue: string
  premiseValue: string
  antecedentLinkDirection: boolean
  consequentLinkDirection: boolean
  impossibleValue: boolean
}

function TriangleStep3({
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
// Step 5: 妥当性のある三項論証を構成
// ========================================
interface TriangleStep5Props {
  options: string[]
  antecedentValue: string
  consequentValue: string
  premiseValue: string
  premise1Value?: string
  premise2Value?: string
  premise3Value?: string
  premise4Value?: string
  onPremise1Change?: (value: string) => void
  onPremise2Change?: (value: string) => void
  onPremise3Change?: (value: string) => void
  onPremise4Change?: (value: string) => void
}

function TriangleStep5({
  options,
  antecedentValue,
  consequentValue,
  premiseValue,
  premise1Value = '',
  premise2Value = '',
  premise3Value = '',
  premise4Value = '',
  onPremise1Change,
  onPremise2Change,
  onPremise3Change,
  onPremise4Change
}: TriangleStep5Props) {
  // すべての選択肢を統合（重複を除去）
  const allOptions = Array.from(new Set([
    ...options,
    antecedentValue,
    consequentValue,
    premiseValue
  ])).filter(Boolean)

  return (
    <div className="relative w-full max-w-2xl mx-auto scale-[0.6] sm:scale-75 md:scale-90 lg:scale-100 origin-top">
      <div className="flex flex-col gap-4 items-center justify-center py-8">
        <div className="text-lg font-medium mb-4">妥当性のある三項論証を構成</div>
        
        {/* 第一条件文 */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="text-lg">【</span>
          <Select value={premise1Value} onValueChange={onPremise1Change}>
            <SelectTrigger className={`w-48 text-lg px-4 py-6 min-h-[70px] ${premise1Value ? '' : 'animate-glow-pulse rounded-md'}`}>
              <SelectValue placeholder="選択" />
            </SelectTrigger>
            <SelectContent>
              {allOptions.map((option) => (
                <SelectItem key={option} value={option} className="text-lg py-3">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-lg font-medium">ならば</span>
          <Select value={premise2Value} onValueChange={onPremise2Change}>
            <SelectTrigger className={`w-48 text-lg px-4 py-6 min-h-[70px] ${premise2Value ? '' : 'animate-glow-pulse rounded-md'}`}>
              <SelectValue placeholder="選択" />
            </SelectTrigger>
            <SelectContent>
              {allOptions.map((option) => (
                <SelectItem key={option} value={option} className="text-lg py-3">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-lg">】</span>
        </div>

        <div className="text-lg">。</div>

        {/* 第二条件文 */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="text-lg">【</span>
          <Select value={premise3Value} onValueChange={onPremise3Change}>
            <SelectTrigger className={`w-48 text-lg px-4 py-6 min-h-[70px] ${premise3Value ? '' : 'animate-glow-pulse rounded-md'}`}>
              <SelectValue placeholder="選択" />
            </SelectTrigger>
            <SelectContent>
              {allOptions.map((option) => (
                <SelectItem key={option} value={option} className="text-lg py-3">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-lg font-medium">ならば</span>
          <Select value={premise4Value} onValueChange={onPremise4Change}>
            <SelectTrigger className={`w-48 text-lg px-4 py-6 min-h-[70px] ${premise4Value ? '' : 'animate-glow-pulse rounded-md'}`}>
              <SelectValue placeholder="選択" />
            </SelectTrigger>
            <SelectContent>
              {allOptions.map((option) => (
                <SelectItem key={option} value={option} className="text-lg py-3">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-lg">】</span>
        </div>

        <div className="text-lg">。</div>
      </div>
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
  onImpossibleToggle,
  impossibleValue = false,
  premise1Value = '',
  premise2Value = '',
  premise3Value = '',
  premise4Value = '',
  onPremise1Change,
  onPremise2Change,
  onPremise3Change,
  onPremise4Change
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
            antecedentValue={antecedentValue}
            consequentValue={consequentValue}
            premiseValue={premiseValue}
            antecedentLinkDirection={antecedentLinkDirection}
            consequentLinkDirection={consequentLinkDirection}
            impossibleValue={impossibleValue}
          />
        )}

        {currentStep === 5 && (
          <TriangleStep5
            options={options}
            antecedentValue={antecedentValue}
            consequentValue={consequentValue}
            premiseValue={premiseValue}
            premise1Value={premise1Value}
            premise2Value={premise2Value}
            premise3Value={premise3Value}
            premise4Value={premise4Value}
            onPremise1Change={onPremise1Change}
            onPremise2Change={onPremise2Change}
            onPremise3Change={onPremise3Change}
            onPremise4Change={onPremise4Change}
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
