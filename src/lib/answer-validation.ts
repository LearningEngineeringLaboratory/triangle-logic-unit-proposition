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

