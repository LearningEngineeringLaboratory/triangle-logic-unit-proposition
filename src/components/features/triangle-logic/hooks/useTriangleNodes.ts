import { useState, useCallback, useEffect } from 'react'
import { Node } from '@xyflow/react'

interface UseTriangleNodesProps {
  currentStep: number
  options: string[]
  setNodes: (nodes: Node[] | ((prevNodes: Node[]) => Node[])) => void
}

interface PremiseNode {
  id: string
  value: string
  position: { x: number; y: number }
}

export function useTriangleNodes({ currentStep, options, setNodes }: UseTriangleNodesProps) {
  // 動的に追加される所与命題ノードの状態
  const [premiseNodes, setPremiseNodes] = useState<PremiseNode[]>([])

  // Step1の基本ノードを初期化
  useEffect(() => {
    if (currentStep >= 1) {
      const step1YPosition = currentStep >= 2 ? 0 : 100
      
      const baseNodes: Node[] = [
        {
          id: 'antecedent',
          type: 'triangleNode',
          position: { x: 100, y: step1YPosition },
          draggable: false,
          data: {
            options,
            value: '',
            onValueChange: () => {},
            isReadOnly: false,
            nodeId: 'antecedent',
            showHandles: false,
          },
        },
        {
          id: 'consequent',
          type: 'triangleNode',
          position: { x: 400, y: step1YPosition },
          draggable: false,
          data: {
            options,
            value: '',
            onValueChange: () => {},
            isReadOnly: false,
            nodeId: 'consequent',
            showHandles: false,
          },
        },
      ]

      setNodes(baseNodes)
    }
  }, [currentStep, options, setNodes])

  // 所与命題ノードを削除する関数
  const removePremiseNode = useCallback((nodeId: string) => {
    setPremiseNodes(prev => prev.filter(node => node.id !== nodeId))
  }, [])

  // premiseNodesが変更されたときにReactFlowのノードを更新
  useEffect(() => {
    if (currentStep >= 2) {
      const premiseNodeElements: Node[] = premiseNodes.map((premiseNode) => ({
        id: premiseNode.id,
        type: 'premiseNode',
        position: premiseNode.position,
        draggable: currentStep !== 3, // Step3では移動不可
        data: {
          value: premiseNode.value,
          nodeId: premiseNode.id,
          showHandles: !(currentStep === 3 || currentStep === 5), // Step3とStep5ではハンドル非表示
          showDeleteButton: !(currentStep === 3 || currentStep === 4 || currentStep === 5), // Step3とStep4では削除ボタン非表示
          onDelete: () => removePremiseNode(premiseNode.id), // 削除機能
        },
      }))

      setNodes(prevNodes => {
        // 既存のpremiseNodeを削除して新しいものを追加
        const filteredNodes = prevNodes.filter(node => !node.id.startsWith('premise-'))
        return [...filteredNodes, ...premiseNodeElements]
      })
    }
  }, [premiseNodes, currentStep, setNodes, removePremiseNode])

  // 所与命題ノードを追加する関数
  const addPremiseNode = useCallback((value: string) => {
    const newNodeId = `premise-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    const newPremiseNode: PremiseNode = {
      id: newNodeId,
      value,
      position: { 
        x: 250 + (premiseNodes.length * 80), // 横にずらして配置
        y: 200 + (premiseNodes.length * 40)  // 縦にも少しずらして配置
      }
    }
    
    setPremiseNodes(prev => [...prev, newPremiseNode])
  }, [premiseNodes.length])

  return { 
    addPremiseNode, 
    removePremiseNode 
  }
}
