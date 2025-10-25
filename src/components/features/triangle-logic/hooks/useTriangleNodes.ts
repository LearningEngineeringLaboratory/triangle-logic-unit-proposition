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
      // Step1: 前件ノード（左上）
      nodes.push({
        id: 'antecedent',
        type: 'triangleNode',
        position: { x: 100, y: 100 },
        draggable: false, // Step1ではドラッグ不可
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
        position: { x: 400, y: 100 },
        draggable: false, // Step1ではドラッグ不可
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
        },
      }))

      setNodes(prevNodes => {
        // 既存のpremiseNodeを削除して新しいものを追加
        const filteredNodes = prevNodes.filter(node => !node.id.startsWith('premise-'))
        return [...filteredNodes, ...premiseNodeElements]
      })
    }
  }, [premiseNodes, currentStep, setNodes])

  // 所与命題ノードを追加する関数
  const addPremiseNode = useCallback((value: string) => {
    const newNodeId = `premise-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newPremiseNode: PremiseNode = {
      id: newNodeId,
      value,
      position: { 
        x: 250 + (premiseNodes.length * 50), // 横にずらして配置
        y: 300 + (premiseNodes.length * 20)  // 縦にも少しずらして配置
      }
    }
    
    setPremiseNodes(prev => [...prev, newPremiseNode])
  }, [premiseNodes.length])

  // 所与命題ノードを削除する関数
  const removePremiseNode = useCallback((nodeId: string) => {
    setPremiseNodes(prev => prev.filter(node => node.id !== nodeId))
  }, [])

  return { 
    initialNodes, 
    addPremiseNode, 
    removePremiseNode,
    premiseNodes 
  }
}
