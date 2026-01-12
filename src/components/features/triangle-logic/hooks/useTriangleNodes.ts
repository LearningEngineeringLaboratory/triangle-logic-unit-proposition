import { useState, useCallback, useEffect } from 'react'
import { Node } from '@xyflow/react'

interface UseTriangleNodesProps {
  currentStep: number
  options: string[]
  setNodes: (nodes: Node[] | ((prevNodes: Node[]) => Node[])) => void
  onNodeDelete?: (nodeId: string) => void
  onNodePositionChange?: (nodeId: string, position: { x: number; y: number }) => void
}

interface PremiseNode {
  id: string
  value: string
  position: { x: number; y: number }
}

export function useTriangleNodes({ currentStep, options, setNodes, onNodeDelete, onNodePositionChange }: UseTriangleNodesProps) {
  // 動的に追加される所与命題ノードの状態
  const [premiseNodes, setPremiseNodes] = useState<PremiseNode[]>([])

  // Step1の基本ノードを初期化
  useEffect(() => {
    if (currentStep >= 1) {
      const step1YPosition = currentStep >= 2 ? 200 : 100
      
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
    // 外部の削除コールバックを呼び出す（リンクのクリーンアップなど）
    onNodeDelete?.(nodeId)
  }, [onNodeDelete])

  // ノードの位置を更新する関数
  const updateNodePosition = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setPremiseNodes(prev => 
      prev.map(node => 
        node.id === nodeId ? { ...node, position } : node
      )
    )
    onNodePositionChange?.(nodeId, position)
  }, [onNodePositionChange])

  // premiseNodesが変更されたときにReactFlowのノードを更新
  useEffect(() => {
    if (currentStep >= 2) {
      setNodes(prevNodes => {
        // 既存のpremiseNodeを取得
        const existingPremiseNodes = prevNodes.filter(node => node.id.startsWith('premise-'))

        // premiseNodesから新しいノード要素を作成
        const premiseNodeElements: Node[] = premiseNodes.map((premiseNode) => {
          // 既存のノードを検索
          const existingNode = existingPremiseNodes.find(n => n.id === premiseNode.id)

          // 既存のノードがあり、位置が異なる場合は既存の位置を優先（ドラッグで移動した位置を保持）
          const position = existingNode && existingNode.position
            ? existingNode.position
            : premiseNode.position

          return {
            id: premiseNode.id,
            type: 'premiseNode',
            position,
            // Step3とStep5では移動不可（表示専用）
            draggable: currentStep !== 3 && currentStep !== 5,
            selectable: currentStep === 2, // Step2でのみ選択可能
            data: {
              value: premiseNode.value,
              nodeId: premiseNode.id,
              showHandles: !(currentStep === 3 || currentStep === 5), // Step3とStep5ではハンドル非表示
              showDeleteButton: !(currentStep === 3 || currentStep === 4 || currentStep === 5), // Step3とStep4では削除ボタン非表示
              onDelete: () => removePremiseNode(premiseNode.id), // 削除機能
            },
          }
        })

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
        y: -200 + (premiseNodes.length * 40)  // 縦にも少しずらして配置（上方向に移動）
      }
    }
    
    setPremiseNodes(prev => [...prev, newPremiseNode])
  }, [premiseNodes.length])

  return { 
    addPremiseNode, 
    removePremiseNode,
    updateNodePosition
  }
}
