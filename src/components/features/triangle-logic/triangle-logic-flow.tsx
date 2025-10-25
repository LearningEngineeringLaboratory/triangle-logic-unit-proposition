'use client'

import { useCallback, useEffect } from 'react'
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
