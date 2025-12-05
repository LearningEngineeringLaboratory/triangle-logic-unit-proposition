'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookOpen } from 'lucide-react'
import { logSelectDropdown } from '@/lib/logging'
import { mapUiToDbState } from '@/lib/utils'
import { PremiseSelection, StepsState } from '@/lib/types'

interface Step5ArgumentInputProps {
  optionList: string[]
  step5Premises: PremiseSelection[]
  onStep5PremiseChange?: (index: number, field: 'antecedent' | 'consequent', value: string) => void
  stepsState: StepsState
  attemptId?: string | null
  problemId?: string
  sessionInfo?: { sessionId: string; userId: string } | null
  nodeValues?: { antecedent: string; consequent: string; premiseNodes: Array<{ id: string; value: string }> } | null
}

export const Step5ArgumentInput = ({
  optionList,
  step5Premises,
  onStep5PremiseChange,
  stepsState,
  attemptId,
  problemId,
  sessionInfo,
  nodeValues,
}: Step5ArgumentInputProps) => {
  const emitLog = (controlId: string, value: string, updatedSteps: StepsState) => {
    const dbState = nodeValues ? mapUiToDbState(updatedSteps, nodeValues) : null
    logSelectDropdown({
      controlId,
      value,
      attemptId: attemptId ?? undefined,
      problemId,
      sessionId: sessionInfo?.sessionId ?? '',
      userId: sessionInfo?.userId ?? '',
      state: dbState,
    }).catch(console.error)
  }

  const handlePremiseChange = (index: number, field: 'antecedent' | 'consequent', value: string) => {
    onStep5PremiseChange?.(index, field, value)
    if (sessionInfo && problemId && stepsState) {
      const currentStep5 = stepsState.step5 || { isPassed: false, premises: [] }
      const currentPremises = currentStep5.premises || []
      const newPremises = [...currentPremises]

      if (!newPremises[index]) newPremises[index] = { antecedent: '', consequent: '' }

      newPremises[index] = { ...newPremises[index], [field]: value }

      const updatedSteps: StepsState = {
        ...stepsState,
        step5: {
          ...currentStep5,
          premises: newPremises,
        },
      }

      emitLog(`step5-premise${index}-${field}`, value, updatedSteps)
    }
  }

  return (
    <div className="mb-6">
      <fieldset className="border-2 border-primary/20 rounded-2xl px-4 pt-2 pb-3 mb-2 bg-primary/5">
        <legend className="px-2 flex items-center gap-2">
          <BookOpen className="w-3 h-3 text-primary" />
          <span className="text-sm font-semibold text-primary">論証</span>
        </legend>

        <div className="space-y-4 w-full max-w-3xl">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-3 text-base leading-relaxed text-foreground font-serif tracking-wide break-keep">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Select value={step5Premises[0]?.antecedent || ''} onValueChange={(value) => handlePremiseChange(0, 'antecedent', value)}>
                <SelectTrigger className={`h-10 rounded-lg border-2 text-base min-w-[120px] font-sans ${step5Premises[0]?.antecedent ? '' : 'animate-glow-pulse'}`}>
                  <SelectValue placeholder="選択" />
                </SelectTrigger>
                <SelectContent>
                  {optionList.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-base font-medium text-foreground font-serif whitespace-normal">ならば</span>

              <Select value={step5Premises[0]?.consequent || ''} onValueChange={(value) => handlePremiseChange(0, 'consequent', value)}>
                <SelectTrigger className={`h-10 rounded-lg border-2 text-base min-w-[120px] font-sans ${step5Premises[0]?.consequent ? '' : 'animate-glow-pulse'}`}>
                  <SelectValue placeholder="選択" />
                </SelectTrigger>
                <SelectContent>
                  {optionList.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-base text-foreground font-serif whitespace-normal">。</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Select value={step5Premises[1]?.antecedent || ''} onValueChange={(value) => handlePremiseChange(1, 'antecedent', value)}>
                <SelectTrigger className={`h-10 rounded-lg border-2 text-base min-w-[120px] font-sans ${step5Premises[1]?.antecedent ? '' : 'animate-glow-pulse'}`}>
                  <SelectValue placeholder="選択" />
                </SelectTrigger>
                <SelectContent>
                  {optionList.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-base font-medium text-foreground font-serif whitespace-normal">ならば</span>

              <Select value={step5Premises[1]?.consequent || ''} onValueChange={(value) => handlePremiseChange(1, 'consequent', value)}>
                <SelectTrigger className={`h-10 rounded-lg border-2 text-base min-w-[120px] font-sans ${step5Premises[1]?.consequent ? '' : 'animate-glow-pulse'}`}>
                  <SelectValue placeholder="選択" />
                </SelectTrigger>
                <SelectContent>
                  {optionList.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-base text-foreground font-serif whitespace-normal">。</span>
            </div>

            <span className="text-base text-foreground font-serif whitespace-normal break-keep">
              <span className="font-medium">したがって、</span>
              {stepsState.step1?.antecedent || '（前件）'}
              <span className="font-medium">ならば</span>
              {stepsState.step1?.consequent || '（後件）'}
              。
            </span>
          </div>
        </div>
      </fieldset>
    </div>
  )
}

export type { Step5ArgumentInputProps }
