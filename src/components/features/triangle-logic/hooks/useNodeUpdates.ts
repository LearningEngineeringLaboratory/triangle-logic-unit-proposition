import { useEffect } from 'react'
import { Node } from '@xyflow/react'

interface UseNodeUpdatesProps {
  nodes: Node[]
  setNodes: (nodes: Node[] | ((prevNodes: Node[]) => Node[])) => void
  currentStep: number
  antecedentValue: string
  consequentValue: string
  onAntecedentChange?: (value: string) => void
  onConsequentChange?: (value: string) => void
}

export function useNodeUpdates({
  nodes,
  setNodes,
  currentStep,
  antecedentValue,
  consequentValue,
  onAntecedentChange,
  onConsequentChange,
}: UseNodeUpdatesProps) {
  // ノードの状態を更新
  useEffect(() => {
    if (nodes.length === 0) return

    setNodes(prevNodes => 
      prevNodes.map(node => {
        // Step1ノード（前件）の更新
        if (node.id === 'antecedent') {
          const step1YPosition = currentStep >= 2 ? 0 : 100
          return {
            ...node,
            position: { x: 100, y: step1YPosition },
            draggable: false,
            data: {
              ...node.data,
              value: antecedentValue,
              isReadOnly: currentStep > 1,
              showHandles: currentStep >= 2 && currentStep !== 3 && currentStep !== 5,
              onValueChange: onAntecedentChange || (() => {}),
            }
          }
        }
        
        // Step1ノード（後件）の更新
        if (node.id === 'consequent') {
          const step1YPosition = currentStep >= 2 ? 0 : 100
          return {
            ...node,
            position: { x: 400, y: step1YPosition },
            draggable: false,
            data: {
              ...node.data,
              value: consequentValue,
              isReadOnly: currentStep > 1,
              showHandles: currentStep >= 2 && currentStep !== 3 && currentStep !== 5,
              onValueChange: onConsequentChange || (() => {}),
            }
          }
        }
        
        return node
      })
    )
  }, [
    nodes.length,
    setNodes,
    currentStep,
    antecedentValue,
    consequentValue,
    onAntecedentChange,
    onConsequentChange,
  ])
}
