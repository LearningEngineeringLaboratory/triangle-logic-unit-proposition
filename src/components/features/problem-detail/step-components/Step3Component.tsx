'use client'

import Image from 'next/image'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { logSelectDropdown } from '@/lib/logging'
import { mapUiToDbState } from '@/lib/utils'
import { BaseStepComponentProps } from './step-component-props'
import { StepTermDefinition } from './StepTermDefinition'

interface Step3ComponentProps extends BaseStepComponentProps {
  stepNumber: number
  isCurrentStep?: boolean
  isPastStep?: boolean
  isCompleted?: boolean
  inferenceTypeValue: string
  validityValue: string
  verificationValue: string
  onInferenceTypeChange?: (value: string) => void
  onValidityChange?: (value: string) => void
  onVerificationChange?: (value: string) => void
}

/**
 * Step3: 推論形式と妥当性の判別
 * 
 * 完全に独立したステップコンポーネント。
 * タイトル、コンテンツ、UIをすべて含む。
 */
export const Step3Component = ({
  problem,
  stepsState,
  attemptId,
  sessionInfo,
  nodeValues,
  stepNumber,
  isCurrentStep = true,
  isPastStep = false,
  isCompleted = false,
  inferenceTypeValue,
  validityValue,
  verificationValue,
  onInferenceTypeChange,
  onValidityChange,
  onVerificationChange,
}: Step3ComponentProps) => {
  if (isPastStep) {
    // 過去のステップ表示用（簡易版）
    return (
      <>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-muted-foreground/70">
              Step {stepNumber}: 推論形式と妥当性の判別
            </h3>
          </div>
          {isCompleted && (
            <span className="ml-auto text-xs bg-success/10 text-success px-3 py-1.5 rounded-full border border-success/20 font-medium">
              完了
            </span>
          )}
        </div>
        <div className="text-sm leading-relaxed text-muted-foreground/70 whitespace-pre-line">
          構成した論証の構造をもとに、この論証の推論形式と妥当性を答えましょう。
        </div>
      </>
    )
  }

  // ログ送信関数
  const emitLog = (controlId: string, value: string, updatedSteps: typeof stepsState & { step3?: any }) => {
    const dbState = nodeValues ? mapUiToDbState(updatedSteps, nodeValues) : null
    logSelectDropdown({
      controlId,
      value,
      attemptId: attemptId ?? undefined,
      problemId: problem.problem_id,
      sessionId: sessionInfo?.sessionId ?? '',
      userId: sessionInfo?.userId ?? '',
      state: dbState,
    }).catch(console.error)
  }

  const handleVerificationChange = (value: string) => {
    onVerificationChange?.(value)
    if (sessionInfo && problem.problem_id && stepsState) {
      const currentStep3 = stepsState.step3 || { isPassed: false, inferenceType: '', validity: null, verification: null }
      const updatedSteps = {
        ...stepsState,
        step3: {
          ...currentStep3,
          verification: value === '高い',
        },
      }
      emitLog('step3-verification', value, updatedSteps)
    }
  }

  const handleValidityChange = (value: string) => {
    onValidityChange?.(value)
    if (sessionInfo && problem.problem_id && stepsState) {
      const currentStep3 = stepsState.step3 || { isPassed: false, inferenceType: '', validity: null, verification: null }
      const updatedSteps = {
        ...stepsState,
        step3: {
          ...currentStep3,
          validity: value === '妥当',
        },
      }
      emitLog('step3-validity', value, updatedSteps)
    }
  }

  const handleInferenceTypeChange = (value: string) => {
    onInferenceTypeChange?.(value)
    if (sessionInfo && problem.problem_id && stepsState) {
      const currentStep3 = stepsState.step3 || { isPassed: false, inferenceType: '', validity: null, verification: null }
      const updatedSteps = {
        ...stepsState,
        step3: {
          ...currentStep3,
          inferenceType: value,
        },
      }
      emitLog('step3-inference_type', value, updatedSteps)
    }
  }

  // 現在のステップ表示用（完全版）
  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Step {stepNumber}: 推論形式の判別
        </h3>
      </div>
      <div className="text-base leading-relaxed text-foreground whitespace-pre-line">
        構成した論証の構造をもとに、以下の問題に答えましょう。
      </div>
      <div className="mb-6">
        <div className="flex flex-col gap-4 w-full max-w-3xl">
          {/* <div className="flex flex-col gap-2 mt-6">
            <span className="text-sm font-medium text-foreground">
              問題1. この論証は推論として論理的ですか？
            </span>
            <Select value={verificationValue} onValueChange={handleVerificationChange}>
              <SelectTrigger className={`w-full h-14 rounded-xl border-2 text-lg py-3 ${verificationValue ? '' : 'animate-glow-pulse'}`}>
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="高い">推論として論理的である</SelectItem>
                <SelectItem value="低い">推論として論理的でない</SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          <div className="flex flex-col gap-2 mt-4">
            <span className="text-sm font-medium text-foreground">
              問題1. この論証は、前提を正しいと仮定したとき、結論は必ず正しいといえますか？
            </span>
            <Select value={validityValue} onValueChange={handleValidityChange}>
              <SelectTrigger className={`w-full h-14 rounded-xl border-2 text-lg py-3 ${validityValue ? '' : 'animate-glow-pulse'}`}>
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="妥当">◯  常に正しい</SelectItem>
                <SelectItem value="非妥当">×  常に正しいとはいえない</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <span className="text-sm font-medium text-foreground">問題2. この論証の推論形式を答えてください。</span>
            <Select value={inferenceTypeValue} onValueChange={handleInferenceTypeChange}>
              <SelectTrigger className={`w-full h-14 rounded-xl border-2 text-lg py-3 ${inferenceTypeValue ? '' : 'animate-glow-pulse'}`}>
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="演繹推論">演繹推論</SelectItem>
                <SelectItem value="仮説推論">仮説推論</SelectItem>
                <SelectItem value="非形式推論">非形式推論</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <StepTermDefinition>
            <strong>演繹推論</strong>：論理的な推論であり、さらに、前提を正しいと仮定したときに結論が必ず正しいといえる推論のこと。2つの前提の矢印をたどると結論になっていれば演繹推論であるといえます。<br />
            <strong>仮説推論</strong>：論理的な推論であるが、前提を正しいと仮定しても結論が必ず正しいとはいえない推論のこと。構造は演繹推論と同じですが、結論の位置が異なっています。<br />
            <strong>非形式推論</strong>：論理的な推論ではなく、前提を正しいと仮定しても結論が必ず正しいといえない推論。矢印が循環した三角形の構造であったり、そもそも三角形の構造を持っていない場合は非形式推論であるといえます。<br />
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-primary/30">
                    <th className="px-3 py-2 text-left font-semibold text-foreground bg-primary/5">推論形式</th>
                    <th className="px-3 py-2 text-center font-semibold text-foreground bg-primary/5">前提</th>
                    <th className="px-3 py-2 text-center font-semibold text-foreground bg-primary/5">結論</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-primary/20">
                    <td className="px-3 py-2 font-medium text-foreground">演繹推論</td>
                    <td className="px-3 py-2 text-center text-foreground">X→Y, Y→Z</td>
                    <td className="px-3 py-2 text-center text-foreground">X→Z</td>
                  </tr>
                  <tr className="border-b border-primary/20">
                    <td className="px-3 py-2 font-medium text-foreground">仮説推論(1)</td>
                    <td className="px-3 py-2 text-center text-foreground">X→Z, Y→Z</td>
                    <td className="px-3 py-2 text-center text-foreground">X→Y</td>
                  </tr>
                  <tr className="border-b border-primary/20">
                    <td className="px-3 py-2 font-medium text-foreground">仮説推論(2)</td>
                    <td className="px-3 py-2 text-center text-foreground">X→Y, X→Z</td>
                    <td className="px-3 py-2 text-center text-foreground">Y→Z</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-foreground">非形式推論</td>
                    <td className="px-3 py-2 text-center text-foreground">その他</td>
                    <td className="px-3 py-2 text-center text-foreground">その他</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* <p className="text-sm leading-relaxed text-foreground whitespace-pre-line mb-4">
              * 形式論理を満たす論証：推論として論理的な構造を持つ論証のこと。以下のような構造を持つ推論のことを指します。
            </p>
            <div className="mb-4">
              <Image
                src="/images/steps/formal-structure.png"
                alt="演繹構造の図"
                width={600}
                height={400}
                className="rounded-lg w-full h-auto"
              />
            </div> */}
          </StepTermDefinition>
        </div>
      </div>
    </>
  )
}
