import { useMemo } from 'react'
import { Node } from '@xyflow/react'

interface UseTriangleNodesProps {
  currentStep: number
  options: string[]
}

export function useTriangleNodes({ currentStep, options }: UseTriangleNodesProps) {
  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = []
    
    if (currentStep >= 1) {
      // Step1: 前件ノード（左上）
      nodes.push({
        id: 'antecedent',
        type: 'triangleNode',
        position: { x: 100, y: 100 },
        data: {
          options,
          value: '',
          onValueChange: () => {},
          isReadOnly: false,
          nodeId: 'antecedent',
        },
      })

      // Step1: 後件ノード（右上）
      nodes.push({
        id: 'consequent',
        type: 'triangleNode',
        position: { x: 400, y: 100 },
        data: {
          options,
          value: '',
          onValueChange: () => {},
          isReadOnly: false,
          nodeId: 'consequent',
        },
      })
    }

    if (currentStep >= 2) {
      // Step2: 所与命題ノード（中央下）
      nodes.push({
        id: 'premise',
        type: 'triangleNode',
        position: { x: 250, y: 300 },
        data: {
          options,
          value: '',
          onValueChange: () => {},
          isReadOnly: false,
          nodeId: 'premise',
        },
      })
    }

    return nodes
  }, [currentStep, options])

  return { initialNodes }
}
