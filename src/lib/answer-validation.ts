import { ProblemDetail, NodeValues, Step2State, Step4State, Step5State, TriangleLink, ActiveTriangleLink, PremiseSelection } from '@/lib/types'

const isObjectLike = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export function normalizeStep4Variants(raw: ProblemDetail['correct_answers']['step4']): ActiveTriangleLink[][] {
  if (!raw) return []

  if (Array.isArray(raw)) {
    if (raw.length > 0 && Array.isArray(raw[0])) {
      return raw as ActiveTriangleLink[][]
    }
    return [raw as ActiveTriangleLink[]]
  }

  if (isObjectLike(raw) && Array.isArray(raw.links)) {
    const links = raw.links as ActiveTriangleLink[] | ActiveTriangleLink[][]
    if (links.length > 0 && Array.isArray(links[0])) {
      return links as ActiveTriangleLink[][]
    }
    return [links as ActiveTriangleLink[]]
  }

  return []
}

export function normalizeStep5Variants(raw: ProblemDetail['correct_answers']['step5']): PremiseSelection[][] {
  if (!raw) return []

  if (Array.isArray(raw)) {
    if (raw.length > 0 && Array.isArray(raw[0])) {
      return raw as PremiseSelection[][]
    }
    return [raw as PremiseSelection[]]
  }

  if (isObjectLike(raw) && Array.isArray(raw.premises)) {
    const premises = raw.premises as PremiseSelection[] | PremiseSelection[][]
    if (premises.length > 0 && Array.isArray(premises[0])) {
      return premises as PremiseSelection[][]
    }
    return [premises as PremiseSelection[]]
  }

  return []
}

export function extractActiveLinks(
  links: ActiveTriangleLink[] | undefined,
  resolveNodeValue: (nodeId: string) => string
): TriangleLink[] {
  if (!links?.length) return []
  return links
    .filter(link => link.active !== false)
    .map(link => ({
      from: resolveNodeValue(link.from),
      to: resolveNodeValue(link.to),
    }))
}

export function matchesActiveLinks(expected: ActiveTriangleLink[], actual: TriangleLink[]): boolean {
  const requiredLinks = expected.filter(link => link.active !== false)
  if (requiredLinks.length !== actual.length) {
    return false
  }

  return requiredLinks.every(correctLink =>
    actual.some(uiLink => uiLink.from === correctLink.from && uiLink.to === correctLink.to)
  )
}

export function findMatchingStep4VariantIndex(
  variants: ActiveTriangleLink[][],
  actualLinks: TriangleLink[]
): number {
  for (let index = 0; index < variants.length; index += 1) {
    if (matchesActiveLinks(variants[index], actualLinks)) {
      return index
    }
  }
  return -1
}

export function premisesSetsMatch(expected: PremiseSelection[], actual: PremiseSelection[]): boolean {
  if (expected.length !== actual.length) {
    return false
  }

  const normalize = (premise: PremiseSelection) => JSON.stringify(premise)
  const normalizedExpected = expected.map(normalize).sort()
  const normalizedActual = actual.map(normalize).sort()

  return normalizedExpected.every((value, idx) => value === normalizedActual[idx])
}

export function createNodeValueResolver(nodeValues: NodeValues) {
  return (nodeId: string): string => {
    if (nodeId === 'antecedent') return nodeValues.antecedent
    if (nodeId === 'consequent') return nodeValues.consequent
    if (nodeId.startsWith('premise-')) {
      const premiseNode = nodeValues.premiseNodes.find(node => node.id === nodeId)
      return premiseNode?.value ?? ''
    }
    return nodeId
  }
}

/**
 * Step2のリンクからPremiseNodeの値を抽出する
 * @param step2Links Step2のリンク配列
 * @param resolveNodeValue ノードIDから値を解決する関数
 * @param antecedentValue Step1のantecedentの値
 * @param consequentValue Step1のconsequentの値
 * @returns PremiseNodeの値の配列（重複なし）
 */
export function extractPremiseNodesFromStep2(
  step2Links: TriangleLink[],
  resolveNodeValue: (nodeId: string) => string,
  antecedentValue: string,
  consequentValue: string
): string[] {
  const premiseValues = new Set<string>()
  
  step2Links.forEach(link => {
    const fromValue = resolveNodeValue(link.from)
    const toValue = resolveNodeValue(link.to)
    
    // antecedentとconsequent以外の値がPremiseNode
    if (fromValue !== antecedentValue && 
        fromValue !== consequentValue &&
        fromValue) {
      premiseValues.add(fromValue)
    }
    if (toValue !== antecedentValue && 
        toValue !== consequentValue &&
        toValue) {
      premiseValues.add(toValue)
    }
  })
  
  return Array.from(premiseValues)
}

/**
 * Step4の答え合わせ: antecedent→XXX→consequentの必須リンクをチェック
 * @param step4Links Step4のリンク配列
 * @param step2Links Step2のリンク配列（PremiseNodeを抽出するため）
 * @param resolveNodeValue ノードIDから値を解決する関数
 * @param antecedentValue Step1のantecedentの値
 * @param consequentValue Step1のconsequentの値
 * @returns 正解の場合、使用されたPremiseNodeの値（XXX）。不正解の場合はnull
 */
export function validateStep4Links(
  step4Links: ActiveTriangleLink[],
  step2Links: TriangleLink[],
  resolveNodeValue: (nodeId: string) => string,
  antecedentValue: string,
  consequentValue: string
): string | null {
  // Step2からPremiseNodeを抽出
  const premiseNodes = extractPremiseNodesFromStep2(step2Links, resolveNodeValue, antecedentValue, consequentValue)
  
  if (premiseNodes.length === 0) {
    return null
  }
  
  // 各PremiseNodeをXXXとして試行
  for (const xxx of premiseNodes) {
    // 必須リンクをチェック
    const hasAntecedentToXxx = step4Links.some(link => {
      const fromValue = resolveNodeValue(link.from)
      const toValue = resolveNodeValue(link.to)
      return fromValue === antecedentValue && 
             toValue === xxx && 
             link.active === true
    })
    
    const hasXxxToConsequent = step4Links.some(link => {
      const fromValue = resolveNodeValue(link.from)
      const toValue = resolveNodeValue(link.to)
      return fromValue === xxx && 
             toValue === consequentValue && 
             link.active === true
    })
    
    if (!hasAntecedentToXxx || !hasXxxToConsequent) {
      continue
    }
    
    // それ以外のリンクがすべてactive:falseになっているか確認
    // 必須リンク以外のリンクで、activeがtrueまたはundefinedのものがあるかチェック
    const hasOtherActiveLinks = step4Links.some(link => {
      const fromValue = resolveNodeValue(link.from)
      const toValue = resolveNodeValue(link.to)
      const isRequiredLink = 
        (fromValue === antecedentValue && toValue === xxx && link.active === true) ||
        (fromValue === xxx && toValue === consequentValue && link.active === true)
      
      // 必須リンク以外で、activeがfalseでない（trueまたはundefined）リンクがあるか
      if (!isRequiredLink) {
        return link.active !== false // activeがfalseでない = trueまたはundefined
      }
      return false
    })
    
    // 必須リンク以外にactiveなリンクがない場合、正解
    if (!hasOtherActiveLinks) {
      return xxx // 正解: このXXXが使用されている
    }
  }
  
  return null // どのXXXでも正解にならない
}

/**
 * Step5の答え合わせ: Step4のXXXを使用してpremisesを検証
 * @param step5Premises Step5のpremises配列
 * @param step4Xxx Step4で使用されたPremiseNodeの値（XXX）
 * @param antecedentValue Step1のantecedentの値
 * @param consequentValue Step1のconsequentの値
 * @returns 正解かどうか
 */
export function validateStep5Premises(
  step5Premises: PremiseSelection[],
  step4Xxx: string | null,
  antecedentValue: string,
  consequentValue: string
): boolean {
  if (!step4Xxx) {
    return false
  }
  
  // 正解のpremisesを生成
  const expectedPremises: PremiseSelection[] = [
    { antecedent: antecedentValue, consequent: step4Xxx },
    { antecedent: step4Xxx, consequent: consequentValue }
  ]
  
  // 順序を考慮せずに比較
  if (step5Premises.length !== expectedPremises.length) {
    return false
  }
  
  const normalize = (premise: PremiseSelection) => 
    `${premise.antecedent}|${premise.consequent}`
  
  const normalizedExpected = expectedPremises.map(normalize).sort()
  const normalizedActual = step5Premises.map(normalize).sort()
  
  return normalizedExpected.every((value, idx) => value === normalizedActual[idx])
}

