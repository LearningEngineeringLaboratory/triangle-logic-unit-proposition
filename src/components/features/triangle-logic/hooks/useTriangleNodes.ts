import { useMemo, useState, useCallback, useEffect } from 'react'
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

  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = []
    
    if (currentStep >= 1) {
      // Step1のノード位置をStep2以降では上に移動
      const step1YPosition = currentStep >= 2 ? 0 : 100 // Step2以降は上に100px移動
      
      // Step1: 前件ノード（左上）
      nodes.push({
        id: 'antecedent',
        type: 'triangleNode',
        position: { x: 100, y: step1YPosition },
        draggable: true, // Step1でもドラッグ可能
        data: {
          options,
          value: '',
          onValueChange: () => {},
          isReadOnly: false,
          nodeId: 'antecedent',
          showHandles: false, // Step1ではハンドル非表示
        },
      })

      // Step1: 後件ノード（右上）
      nodes.push({
        id: 'consequent',
        type: 'triangleNode',
        position: { x: 400, y: step1YPosition },
        draggable: true, // Step1でもドラッグ可能
        data: {
          options,
          value: '',
          onValueChange: () => {},
          isReadOnly: false,
          nodeId: 'consequent',
          showHandles: false, // Step1ではハンドル非表示
        },
      })
    }

    return nodes
  }, [currentStep, options])

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
        draggable: true, // 自由に動かせる
        data: {
          value: premiseNode.value,
          nodeId: premiseNode.id,
          showHandles: true, // ハンドル表示
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
    initialNodes, 
    addPremiseNode, 
    removePremiseNode,
    premiseNodes 
  }
}
