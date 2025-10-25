'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import {
  ReactFlow,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  NodeTypes,
  EdgeTypes,
  ConnectionMode,
  MiniMap,
  addEdge,
  Edge,
} from '@xyflow/react'
import { TriangleNode } from './nodes/TriangleNode'
import { PremiseNode } from './nodes/PremiseNode'
import { TriangleEdge } from './edges/TriangleEdge'
import { AddPremiseNodeButton } from './components/AddPremiseNodeButton'
import { useTriangleNodes } from './hooks/useTriangleNodes'
import { useTriangleEdges } from './hooks/useTriangleEdges'
import { useNodeUpdates } from './hooks/useNodeUpdates'

// ========================================
// ノードタイプとエッジタイプの定義
// ========================================
const nodeTypes: NodeTypes = {
  triangleNode: TriangleNode,
  premiseNode: PremiseNode,
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
  // テーマを取得
  const { theme } = useTheme()
  
  // カスタムフックを使用してノードとエッジを管理
  const { initialNodes, addPremiseNode, removePremiseNode } = useTriangleNodes({ currentStep, options, setNodes: () => {} })
  const { initialEdges } = useTriangleEdges({ 
    currentStep, 
    links, 
    activeLinks, 
    onLinksChange 
  })

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // 動的ノード更新のためのsetNodesを渡す
  const { addPremiseNode: addPremiseNodeDynamic, removePremiseNode: removePremiseNodeDynamic } = useTriangleNodes({ 
    currentStep, 
    options, 
    setNodes 
  })

  // エッジの参照を保持
  const edgesRef = useRef<Edge[]>(initialEdges)
  
  // エッジを動的に更新するコールバック
  const updateEdges = useCallback(() => {
    console.log('updateEdges called:', { currentStep, links, activeLinks })
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

    edgesRef.current = edges
    setEdges(edges)
  }, [currentStep, links, activeLinks, onLinksChange])

  // ノードの状態更新
  useNodeUpdates({
    nodes,
    setNodes,
    currentStep,
    antecedentValue,
    consequentValue,
    premiseValue,
    onAntecedentChange,
    onConsequentChange,
    onPremiseChange,
  })

  // エッジ接続時の処理
  const onConnect = useCallback(
    (params: Connection) => {
      console.log('onConnect called:', { params, currentStep, links })
      if (currentStep === 2 && params.source && params.target) {
        // ReactFlowのaddEdgeを使用してエッジを追加
        const newEdge = addEdge(params, edgesRef.current)
        setEdges(newEdge)
        
        // リンク状態も更新
        const newLink = {
          from: params.source,
          to: params.target,
        }
        const newLinks = [...links, newLink]
        console.log('Adding new link:', newLink, 'Total links:', newLinks)
        onLinksChange?.(newLinks)
      }
    },
    [currentStep, links, onLinksChange]
  )

  // linksが変更されたときにエッジを更新
  useEffect(() => {
    updateEdges()
  }, [updateEdges])

  return (
    <div className="w-full h-full rounded-2xl border-2 border-border bg-card overflow-hidden">
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
        fitViewOptions={{ 
          padding: 0.2,
          includeHiddenNodes: false,
          minZoom: 0.5,
          maxZoom: 2
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.3}
        maxZoom={2}
        attributionPosition="top-right"
        colorMode={theme === 'dark' ? 'dark' : 'light'}
      >
        <Controls 
          showZoom={true}
          showFitView={true}
          showInteractive={false}
          position="bottom-right"
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
        />
        
        {/* Step2の時のみノード追加ボタンを表示 */}
        {currentStep === 2 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <AddPremiseNodeButton 
              options={options}
              onAddNode={addPremiseNodeDynamic}
            />
          </div>
        )}
      </ReactFlow>
    </div>
  )
}
