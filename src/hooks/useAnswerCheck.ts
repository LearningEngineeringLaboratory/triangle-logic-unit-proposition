import { useCallback } from 'react'
import { ProblemDetail, NodeValues, Step2State, Step4State, Step5State } from '@/lib/types'
import { 
  normalizeStep4Variants, 
  normalizeStep5Variants, 
  extractActiveLinks, 
  findMatchingStep4VariantIndex,
  premisesSetsMatch,
  createNodeValueResolver
} from '@/lib/answer-validation'
import { TriangleLink, StepsState } from '@/lib/types'
import { logClientCheck, mapUiToDbState } from '@/lib/utils'
import { getUserIdClient } from '@/lib/session-client'

interface UseAnswerCheckOptions {
  problem: ProblemDetail
  nodeValues: NodeValues
  steps: {
    step1?: { antecedent: string; consequent: string; isPassed?: boolean }
    step2?: Step2State
    step3?: { inferenceType: string; validity: boolean | null; verification?: boolean | null; isPassed?: boolean }
    step4?: Step4State
    step5?: Step5State
  }
  currentStep: number
  sessionInfo: { sessionId: string; userId: string } | null
}

export function useAnswerCheck({ problem, nodeValues, steps, currentStep, sessionInfo }: UseAnswerCheckOptions) {
  const checkAnswer = useCallback((stepNumber: 1 | 2 | 3 | 4 | 5): boolean => {
    const stepKey = `step${stepNumber}` as keyof typeof steps
    const currentStateFragment = steps[stepKey]
    
    if (!currentStateFragment) return false

    let isCorrect = false
    const resolveNodeValue = createNodeValueResolver(nodeValues)

    const correctStep4Variants = normalizeStep4Variants(problem.correct_answers.step4)
    const correctStep5Variants = normalizeStep5Variants(problem.correct_answers.step5)
    const getActiveStep4LinksWithValues = () =>
      extractActiveLinks(steps.step4?.links, resolveNodeValue)

    switch (stepNumber) {
      case 1: {
        const step1State = steps.step1
        if (!step1State) break
        isCorrect = step1State.antecedent === problem.correct_answers.step1?.antecedent &&
                   step1State.consequent === problem.correct_answers.step1?.consequent
        break
      }
      case 2: {
        const rawStep2 = problem.correct_answers.step2
        const correctLinks: TriangleLink[] = Array.isArray(rawStep2)
          ? rawStep2
          : rawStep2?.links ?? []

        const step2State = steps.step2 as Step2State | undefined
        const uiLinks = step2State?.links ?? []

        const uiLinksWithValues = uiLinks.map(link => ({
          from: resolveNodeValue(link.from),
          to: resolveNodeValue(link.to)
        }))

        const linksMatch = correctLinks.every(correctLink =>
          uiLinksWithValues.some(uiLink =>
            uiLink.from === correctLink.from && uiLink.to === correctLink.to
          )
        ) && correctLinks.length === uiLinksWithValues.length

        // すべてのノードがリンクに接続されているかを確認
        const allPremiseNodeIds = nodeValues.premiseNodes.map(node => node.id)
        const connectedNodeIds = new Set<string>()
        uiLinks.forEach(link => {
          connectedNodeIds.add(link.from)
          connectedNodeIds.add(link.to)
        })
        
        const allPremiseNodesConnected = allPremiseNodeIds.every(nodeId =>
          connectedNodeIds.has(nodeId)
        )

        isCorrect = linksMatch && allPremiseNodesConnected
        break
      }
      case 3: {
        const step3State = steps.step3
        if (!step3State) break
        const expectedStep3 = problem.correct_answers.step3
        if (!expectedStep3) break
        const verificationMatches =
          expectedStep3.verification === undefined ||
          step3State.verification === expectedStep3.verification
        isCorrect =
          step3State.inferenceType === expectedStep3.inference_type &&
          step3State.validity === expectedStep3.validity &&
          verificationMatches
        break
      }
      case 4: {
        const activeUiLinks4 = getActiveStep4LinksWithValues()
        const matchedVariantIndex = findMatchingStep4VariantIndex(correctStep4Variants, activeUiLinks4)
        isCorrect = matchedVariantIndex !== -1
        break
      }
      case 5: {
        const step5State = steps.step5 as Step5State | undefined
        const userPremises = step5State?.premises ?? []
        const step4ActiveLinks = getActiveStep4LinksWithValues()
        const matchedStep4Variant = findMatchingStep4VariantIndex(correctStep4Variants, step4ActiveLinks)

        const candidatePremiseVariants =
          matchedStep4Variant !== -1 && matchedStep4Variant < correctStep5Variants.length
            ? [correctStep5Variants[matchedStep4Variant]]
            : correctStep5Variants

        const premisesMatch = candidatePremiseVariants.some(variant => premisesSetsMatch(variant, userPremises))
        isCorrect = premisesMatch
        break
      }
    }

    // ログ送信（研究用）- ノード文字列ラベルを含む
    // sessionInfoが存在する場合のみログを送信（sessionIdとuserIdが必須のため）
    if (sessionInfo?.sessionId && sessionInfo?.userId) {
      // payloadにノード文字列ラベルと正誤判定結果を追加
      const payloadWithLabels = {
        ...currentStateFragment,
        isPassed: isCorrect, // 正誤判定結果を明示的に設定
        node_labels: {
          antecedent: nodeValues.antecedent,
          consequent: nodeValues.consequent,
          premiseNodes: nodeValues.premiseNodes.map(node => ({
            id: node.id,
            label: node.value,
          })),
        },
      }
      
      // stateをDB形式に変換（現在のステップのisPassedをisCorrectの結果で上書き）
      const dbState = mapUiToDbState(
        steps as StepsState,
        nodeValues,
        { stepNumber, isPassed: isCorrect }
      )
      
      logClientCheck({
        sessionId: sessionInfo.sessionId,
        userId: sessionInfo.userId,
        problemId: problem.problem_id,
        step: stepNumber,
        isCorrect,
        payload: payloadWithLabels,
        state: dbState,
      })
    }

    return isCorrect
  }, [problem, nodeValues, steps, sessionInfo])

  return { checkAnswer }
}

