import { useMemo } from 'react'
import { Edge } from '@xyflow/react'
import { ActiveTriangleLink, TriangleLink } from '@/lib/types'

interface UseTriangleEdgesOptions {
  currentStep: number
  links: TriangleLink[]
  activeLinks: ActiveTriangleLink[]
  onLinksChange?: (links: TriangleLink[]) => void
  onActiveLinksChange?: (links: ActiveTriangleLink[]) => void
}

export function useTriangleEdges({ 
  currentStep, 
  links, 
  activeLinks, 
  onLinksChange,
  onActiveLinksChange,
}: UseTriangleEdgesOptions) {
  const edges = useMemo(() => {
    const newEdges: Edge[] = []
    
    if (currentStep >= 1) {
      // Step1: 導出命題のリンク（固定、削除不可）
      newEdges.push({
        id: 'derived-link',
        source: 'antecedent',
        target: 'consequent',
        type: 'triangleEdge',
        data: {
          label: 'ならば',
          isActive: true,
          isDeletable: false,
          arrowType: 'triangle',
          strokeWidth: 8,
          strokeColor: '#a5b4fc',
          showCircleMarker: false,
        },
      })
    }

    if (currentStep >= 2 && currentStep < 3) {
      // Step2: ユーザー作成リンク（削除可能、「ならば」ラベル表示）
      links.forEach((link, index) => {
        newEdges.push({
          id: `user-link-${index}`,
          source: link.from,
          target: link.to,
          type: 'triangleEdge',
          selectable: true,
          data: {
            label: 'ならば',
            isActive: true,
            isDeletable: true,
            onDelete: () => {
              const filteredLinks = links.filter((_, i) => i !== index)
              onLinksChange?.(filteredLinks)
            },
          },
        })
      })
    }

    if (currentStep === 3) {
      // Step3: 表示のみ（削除不可、「ならば」ラベル表示）
      links.forEach((link, index) => {
        newEdges.push({
          id: `user-link-${index}`,
          source: link.from,
          target: link.to,
          type: 'triangleEdge',
          data: {
            label: 'ならば',
            isActive: true,
            isDeletable: false,
          },
        })
      })
    }

    if (currentStep === 4) {
      // Step4: エッジの追加/削除のみ可能（ノード操作は不可）
      const allLinks = [...links]
      activeLinks.forEach(activeLink => {
        const exists = allLinks.some(link =>
          link.from === activeLink.from && link.to === activeLink.to
        )
        if (!exists) {
          allLinks.push({ from: activeLink.from, to: activeLink.to })
        }
      })

      allLinks.forEach((link, index) => {
        const isDerivedLink = link.from === 'antecedent' && link.to === 'consequent'
        const isStep2Link = links.some(l => l.from === link.from && l.to === link.to)
        const isStep4NewLink = !isStep2Link && !isDerivedLink

        const activeLink = activeLinks.find(al =>
          al.from === link.from && al.to === link.to
        )
        const isActive = activeLink ? activeLink.active : true

        newEdges.push({
          id: `user-link-${index}`,
          source: link.from,
          target: link.to,
          type: 'triangleEdge',
          selectable: isStep4NewLink,
          data: {
            label: 'ならば',
            isActive,
            isToggleable: !isDerivedLink && isStep2Link,
            isDeletable: isStep4NewLink,
            onToggle: !isDerivedLink && isStep2Link ? () => {
              const existingLink = activeLinks.find(al =>
                al.from === link.from && al.to === link.to
              )
              if (existingLink) {
                const newActiveLinks = activeLinks.map(al =>
                  al.from === link.from && al.to === link.to
                    ? { ...al, active: !al.active }
                    : al
                )
                onActiveLinksChange?.(newActiveLinks)
              } else {
                const newActiveLinks = [...activeLinks, {
                  from: link.from,
                  to: link.to,
                  active: false,
                }]
                onActiveLinksChange?.(newActiveLinks)
              }
            } : undefined,
            onDelete: isStep4NewLink ? () => {
              const newActiveLinks = activeLinks.filter(al =>
                !(al.from === link.from && al.to === link.to)
              )
              onActiveLinksChange?.(newActiveLinks)
            } : undefined,
          },
        })
      })
    }

    if (currentStep >= 5) {
      // Step5: 表示のみ（すべての操作を無効化）
      const allLinks = [...links]
      activeLinks.forEach(activeLink => {
        const exists = allLinks.some(link =>
          link.from === activeLink.from && link.to === activeLink.to
        )
        if (!exists) {
          allLinks.push({ from: activeLink.from, to: activeLink.to })
        }
      })

      allLinks.forEach((link, index) => {
        const activeLink = activeLinks.find(al =>
          al.from === link.from && al.to === link.to
        )
        const isActive = activeLink ? activeLink.active : true

        newEdges.push({
          id: `user-link-${index}`,
          source: link.from,
          target: link.to,
          type: 'triangleEdge',
          data: {
            isActive,
            label: isActive ? 'ならば' : undefined,
            isToggleable: false,
            isDeletable: false,
            onToggle: undefined,
            onDelete: undefined,
          },
        })
      })
    }

    return newEdges
  }, [currentStep, links, activeLinks, onLinksChange, onActiveLinksChange])

    return edges
}
