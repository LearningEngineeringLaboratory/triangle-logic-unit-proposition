import { useMemo } from 'react'
import { Edge } from '@xyflow/react'

interface UseTriangleEdgesProps {
  currentStep: number
  links: Array<{ from: string; to: string }>
  activeLinks: Array<{ from: string; to: string; active: boolean }>
  onLinksChange?: (links: Array<{ from: string; to: string }>) => void
}

export function useTriangleEdges({ 
  currentStep, 
  links, 
  activeLinks, 
  onLinksChange 
}: UseTriangleEdgesProps) {
  const initialEdges: Edge[] = useMemo(() => {
    console.log('useTriangleEdges called:', { currentStep, links, activeLinks })
    const edges: Edge[] = []
    
    if (currentStep >= 1) {
      // Step1: 導出命題のリンク（固定、削除不可）
      edges.push({
        id: 'derived-link',
        source: 'antecedent',
        target: 'consequent',
        type: 'triangleEdge',
        data: {
          label: 'ならば',
          isActive: true,
          isDeletable: false,
        },
      })
    }

    if (currentStep >= 2) {
      // Step2: ユーザー作成リンク
      console.log('Creating user links for Step2:', links)
      links.forEach((link, index) => {
        edges.push({
          id: `user-link-${index}`,
          source: link.from,
          target: link.to,
          type: 'triangleEdge',
          data: {
            isActive: true,
            isDeletable: true,
            onDelete: () => {
              const newLinks = links.filter((_, i) => i !== index)
              onLinksChange?.(newLinks)
            },
          },
        })
      })
    }

    if (currentStep >= 4) {
      // Step4: 活性/非活性リンク
      activeLinks.forEach((link, index) => {
        edges.push({
          id: `active-link-${index}`,
          source: link.from,
          target: link.to,
          type: 'triangleEdge',
          data: {
            isActive: link.active,
            isDeletable: false,
          },
        })
      })
    }

    return edges
  }, [currentStep, links, activeLinks, onLinksChange])

  return { initialEdges }
}
