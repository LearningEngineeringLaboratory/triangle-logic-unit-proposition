'use client'

import { useCallback, useState, useMemo, useEffect } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  NodeTypes,
  EdgeTypes,
  ConnectionMode,
} from '@xyflow/react'
import { TriangleNode } from './nodes/TriangleNode'
import { TriangleEdge } from './edges/TriangleEdge'

// ========================================
// ノードタイプとエッジタイプの定義
// ========================================
const nodeTypes: NodeTypes = {
  triangleNode: TriangleNode,
}

const edgeTypes: EdgeTypes = {
  triangleEdge: TriangleEdge,
}

// ========================================
// メインコンポーネント
// ========================================
interface TriangleLogicFlowProps {
  options: string[]
  currentStep: number
  // Step1 props
  antecedentValue?: string
  consequentValue?: string
  onAntecedentChange?: (value: string) => void
  onConsequentChange?: (value: string) => void
  // Step2 props
  premiseValue?: string
  onPremiseChange?: (value: string) => void
  links?: Array<{ from: string; to: string }>
  onLinksChange?: (links: Array<{ from: string; to: string }>) => void
  // Step4 props
  activeLinks?: Array<{ from: string; to: string; active: boolean }>
  onActiveLinksChange?: (links: Array<{ from: string; to: string; active: boolean }>) => void
}

export function TriangleLogicFlow({
  options,
  currentStep,
  antecedentValue = '',
  consequentValue = '',
  onAntecedentChange,
  onConsequentChange,
  premiseValue = '',
  onPremiseChange,
  links = [],
  onLinksChange,
  activeLinks = [],
  onActiveLinksChange,
}: TriangleLogicFlowProps) {
  // ノードの初期設定（ステップとオプションのみに依存）
  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = []
    
    if (currentStep >= 1) {
      // Step1: 前件ノード（左上）
      nodes.push({
        id: 'antecedent',
        type: 'triangleNode',
        position: { x: 50, y: 50 },
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
        position: { x: 300, y: 50 },
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
        position: { x: 175, y: 200 },
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

  // エッジの初期設定
  const initialEdges: Edge[] = useMemo(() => {
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

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // ノードの状態を更新
  const updateNodes = useCallback(() => {
    setNodes(prevNodes => {
      const updatedNodes = prevNodes.map(node => {
        if (node.id === 'antecedent') {
          return {
            ...node,
            data: {
              ...node.data,
              value: antecedentValue,
              isReadOnly: currentStep > 1,
              onValueChange: onAntecedentChange || (() => {}),
            }
          }
        }
        if (node.id === 'consequent') {
          return {
            ...node,
            data: {
              ...node.data,
              value: consequentValue,
              isReadOnly: currentStep > 1,
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
  }, [antecedentValue, consequentValue, premiseValue, currentStep, onAntecedentChange, onConsequentChange, onPremiseChange])

  // 値が変更されたときにノードを更新
  useEffect(() => {
    if (nodes.length > 0) {
      updateNodes()
    }
  }, [updateNodes, nodes.length])

  // エッジ接続時の処理
  const onConnect = useCallback(
    (params: Connection) => {
      if (currentStep === 2 && params.source && params.target) {
        const newLink = {
          from: params.source,
          to: params.target,
        }
        const newLinks = [...links, newLink]
        onLinksChange?.(newLinks)
      }
    },
    [currentStep, links, onLinksChange]
  )

  return (
    <div className="w-full h-full min-h-[500px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.1 }}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  )
}
