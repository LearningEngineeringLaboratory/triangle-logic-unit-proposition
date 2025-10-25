import { useCallback, useEffect } from 'react'
import { Node } from '@xyflow/react'

interface UseNodeUpdatesProps {
  nodes: Node[]
  setNodes: (nodes: Node[] | ((prevNodes: Node[]) => Node[])) => void
  currentStep: number
  antecedentValue: string
  consequentValue: string
  premiseValue: string
  onAntecedentChange?: (value: string) => void
  onConsequentChange?: (value: string) => void
  onPremiseChange?: (value: string) => void
}

export function useNodeUpdates({
  nodes,
  setNodes,
  currentStep,
  antecedentValue,
  consequentValue,
  premiseValue,
  onAntecedentChange,
  onConsequentChange,
  onPremiseChange,
}: UseNodeUpdatesProps) {
  // ノードの状態を更新
  const updateNodes = useCallback(() => {
    setNodes(prevNodes => {
      const updatedNodes = prevNodes.map(node => {
        if (node.id === 'antecedent') {
          return {
            ...node,
            // Step1のノードは座標を固定（draggable: false）
            draggable: false,
            data: {
              ...node.data,
              value: antecedentValue,
              isReadOnly: currentStep > 1,
              showHandles: currentStep > 1, // Step1ではハンドル非表示
              onValueChange: onAntecedentChange || (() => {}),
            }
          }
        }
        if (node.id === 'consequent') {
          return {
            ...node,
            // Step1のノードは座標を固定（draggable: false）
            draggable: false,
            data: {
              ...node.data,
              value: consequentValue,
              isReadOnly: currentStep > 1,
              showHandles: currentStep > 1, // Step1ではハンドル非表示
              onValueChange: onConsequentChange || (() => {}),
            }
          }
        }
        if (node.id === 'premise') {
          return {
            ...node,
            data: {
              ...node.data,
              value: premiseValue,
              isReadOnly: currentStep > 2,
              onValueChange: onPremiseChange || (() => {}),
            }
          }
        }
        return node
      })
      
      // デバッグ用ログ
      console.log('Updating nodes:', {
        antecedentValue,
        consequentValue,
        premiseValue,
        currentStep,
        updatedNodes: updatedNodes.map(n => ({ id: n.id, value: n.data.value }))
      })
      
      return updatedNodes
    })
  }, [
    setNodes,
    antecedentValue,
    consequentValue,
    premiseValue,
    currentStep,
    onAntecedentChange,
    onConsequentChange,
    onPremiseChange
  ])

  // 値が変更されたときにノードを更新
  useEffect(() => {
    if (nodes.length > 0) {
      updateNodes()
    }
  }, [updateNodes, nodes.length])

  return { updateNodes }
}
