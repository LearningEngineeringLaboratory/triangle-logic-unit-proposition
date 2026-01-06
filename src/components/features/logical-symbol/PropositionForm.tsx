'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LogicalSymbolStep1State, ProblemDetail } from '@/lib/types'

interface PropositionFormProps {
  problem: ProblemDetail
  step1State: LogicalSymbolStep1State
  onStep1Change?: (updates: Partial<LogicalSymbolStep1State>) => void
  onFieldChange?: (field: string, value: string, updates: Partial<LogicalSymbolStep1State>) => void
  readOnly?: boolean // trueの場合は読み取り専用（テキスト表示）
}

export function PropositionForm({
  problem,
  step1State,
  onStep1Change,
  onFieldChange,
  readOnly = false,
}: PropositionFormProps) {
  const options = problem.options || []

  // 読み取り専用の場合のテキスト表示
  if (readOnly) {
    return (
      <div className="space-y-4">
        {/* 所与命題1 */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-foreground w-24 shrink-0">所与命題1</label>
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 h-12 px-3 py-2 rounded-md border bg-background flex items-center">
              <span className="text-base">{step1State.premise1.antecedent || '（未選択）'}</span>
            </div>
            <span className="text-base font-medium">ならば</span>
            <div className="flex-1 h-12 px-3 py-2 rounded-md border bg-background flex items-center">
              <span className="text-base">{step1State.premise1.consequent || '（未選択）'}</span>
            </div>
          </div>
        </div>

        {/* 所与命題2 */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-foreground w-24 shrink-0">所与命題2</label>
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 h-12 px-3 py-2 rounded-md border bg-background flex items-center">
              <span className="text-base">{step1State.premise2.antecedent || '（未選択）'}</span>
            </div>
            <span className="text-base font-medium">ならば</span>
            <div className="flex-1 h-12 px-3 py-2 rounded-md border bg-background flex items-center">
              <span className="text-base">{step1State.premise2.consequent || '（未選択）'}</span>
            </div>
          </div>
        </div>

        {/* 区切り線 */}
        <div className="border-t border-border my-4" />

        {/* 導出命題 */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-foreground w-24 shrink-0">導出命題</label>
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 h-12 px-3 py-2 rounded-md border bg-background flex items-center">
              <span className="text-base">{step1State.conclusion.antecedent || '（未選択）'}</span>
            </div>
            <span className="text-base font-medium">ならば</span>
            <div className="flex-1 h-12 px-3 py-2 rounded-md border bg-background flex items-center">
              <span className="text-base">{step1State.conclusion.consequent || '（未選択）'}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 編集可能な場合（ドロップダウン）
  return (
    <div className="space-y-4">
      {/* 所与命題1 */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-foreground w-24 shrink-0">所与命題1</label>
        <div className="flex items-center gap-2 flex-1">
          <Select
            value={step1State.premise1.antecedent}
            onValueChange={(value) => {
              const updates = {
                ...step1State,
                premise1: { ...step1State.premise1, antecedent: value },
              }
              if (onFieldChange) {
                onFieldChange('step1-premise1-antecedent', value, updates)
              }
              if (onStep1Change) {
                onStep1Change(updates)
              }
            }}
          >
            <SelectTrigger className="flex-1 h-12">
              <SelectValue placeholder="前件を選択" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-base font-medium">ならば</span>
          <Select
            value={step1State.premise1.consequent}
            onValueChange={(value) => {
              const updates = {
                ...step1State,
                premise1: { ...step1State.premise1, consequent: value },
              }
              if (onFieldChange) {
                onFieldChange('step1-premise1-consequent', value, updates)
              }
              if (onStep1Change) {
                onStep1Change(updates)
              }
            }}
          >
            <SelectTrigger className="flex-1 h-12">
              <SelectValue placeholder="後件を選択" />
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
      </div>

      {/* 所与命題2 */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-foreground w-24 shrink-0">所与命題2</label>
        <div className="flex items-center gap-2 flex-1">
          <Select
            value={step1State.premise2.antecedent}
            onValueChange={(value) => {
              const updates = {
                ...step1State,
                premise2: { ...step1State.premise2, antecedent: value },
              }
              if (onFieldChange) {
                onFieldChange('step1-premise2-antecedent', value, updates)
              }
              if (onStep1Change) {
                onStep1Change(updates)
              }
            }}
          >
            <SelectTrigger className="flex-1 h-12">
              <SelectValue placeholder="前件を選択" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-base font-medium">ならば</span>
          <Select
            value={step1State.premise2.consequent}
            onValueChange={(value) => {
              const updates = {
                ...step1State,
                premise2: { ...step1State.premise2, consequent: value },
              }
              if (onFieldChange) {
                onFieldChange('step1-premise2-consequent', value, updates)
              }
              if (onStep1Change) {
                onStep1Change(updates)
              }
            }}
          >
            <SelectTrigger className="flex-1 h-12">
              <SelectValue placeholder="後件を選択" />
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
      </div>

      {/* 区切り線 */}
      <div className="border-t border-border my-4" />

      {/* 導出命題 */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-foreground w-24 shrink-0">導出命題</label>
        <div className="flex items-center gap-2 flex-1">
          <Select
            value={step1State.conclusion.antecedent}
            onValueChange={(value) => {
              const updates = {
                ...step1State,
                conclusion: { ...step1State.conclusion, antecedent: value },
              }
              if (onFieldChange) {
                onFieldChange('step1-conclusion-antecedent', value, updates)
              }
              if (onStep1Change) {
                onStep1Change(updates)
              }
            }}
          >
            <SelectTrigger className="flex-1 h-12">
              <SelectValue placeholder="前件を選択" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-base font-medium">ならば</span>
          <Select
            value={step1State.conclusion.consequent}
            onValueChange={(value) => {
              const updates = {
                ...step1State,
                conclusion: { ...step1State.conclusion, consequent: value },
              }
              if (onFieldChange) {
                onFieldChange('step1-conclusion-consequent', value, updates)
              }
              if (onStep1Change) {
                onStep1Change(updates)
              }
            }}
          >
            <SelectTrigger className="flex-1 h-12">
              <SelectValue placeholder="後件を選択" />
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
      </div>
    </div>
  )
}

