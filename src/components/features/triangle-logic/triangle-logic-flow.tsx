'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
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
  Node,
  Edge,
} from '@xyflow/react'
import { TriangleNode } from './nodes/TriangleNode'
import { PremiseNode } from './nodes/PremiseNode'
import { TriangleEdge } from './edges/TriangleEdge'
import { AddPremiseNodeButton } from './components/AddPremiseNodeButton'
import { useTriangleNodes } from './hooks/useTriangleNodes'
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
  // 答え合わせ用
  onGetNodeValues?: (values: { antecedent: string; consequent: string; premiseNodes: Array<{ id: string; value: string }> }) => void
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
  onGetNodeValues,
}: TriangleLogicFlowProps) {
  // テーマを取得
  const { theme } = useTheme()
  
  // ReactFlowの状態管理
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[])
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[])

  // カスタムフックを使用してノード管理
  const { addPremiseNode, removePremiseNode } = useTriangleNodes({ 
    currentStep, 
    options, 
    setNodes: setNodes as (nodes: Node[] | ((prevNodes: Node[]) => Node[])) => void
  })

  // ノードの状態更新
  useNodeUpdates({
    nodes,
    setNodes: setNodes as (nodes: Node[] | ((prevNodes: Node[]) => Node[])) => void,
    currentStep,
    antecedentValue,
    consequentValue,
    premiseValue,
    onAntecedentChange,
    onConsequentChange,
    onPremiseChange,
  })

  // 接続の妥当性を検証
  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      // 1. sourceHandleが存在し、かつ'-right'で終わる（sourceハンドル）場合のみ許可
      if (!connection.sourceHandle) return false
      if (!connection.sourceHandle.endsWith('-right')) return false
      
      // 2. 自己ループ（同じノードへの接続）を禁止
      if (connection.source === connection.target) return false
      
      // 3. targetHandleが'-target'で終わる（入力ハンドル）場合のみ許可
      if (!connection.targetHandle) return false
      if (!connection.targetHandle.endsWith('-target')) return false
      
      // 4. Step1の前件→後件リンクの作成を禁止
      if (connection.source === 'antecedent' && connection.target === 'consequent') {
        return false
      }
      
      // 5. 既存のエッジとの重複をチェック
      const isDuplicate = links.some(link => 
        link.from === connection.source && link.to === connection.target
      )
      if (isDuplicate) return false
      
      return true
    },
    [links]
  )

  // エッジ接続時の処理
  const onConnect = useCallback(
    (params: Connection) => {
      if (currentStep === 2 && params.source && params.target) {
        // リンク状態を更新
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

  // ノードの値をメモ化
  const nodeValues = useMemo(() => {
    if (nodes.length === 0) return null
    
    const antecedentNode = nodes.find(node => node.id === 'antecedent')
    const consequentNode = nodes.find(node => node.id === 'consequent')
    const premiseNodes = nodes.filter(node => node.id.startsWith('premise-'))
    
    return {
      antecedent: (antecedentNode?.data?.value as string) || '',
      consequent: (consequentNode?.data?.value as string) || '',
      premiseNodes: premiseNodes.map(node => ({
        id: node.id,
        value: (node.data?.value as string) || ''
      }))
    }
  }, [nodes])

  // 前回の値を保持
  const prevNodeValuesRef = useRef<string>('')
  
  // コールバックをrefで保持（無限ループ防止）
  const onGetNodeValuesRef = useRef(onGetNodeValues)
  useEffect(() => {
    onGetNodeValuesRef.current = onGetNodeValues
  }, [onGetNodeValues])

  // ノードの値が変更された場合のみコールバックを呼び出す
  useEffect(() => {
    if (!onGetNodeValuesRef.current || !nodeValues) return
    
    // JSON文字列化して比較（深い比較）
    const currentValuesStr = JSON.stringify(nodeValues)
    
    if (prevNodeValuesRef.current !== currentValuesStr) {
      prevNodeValuesRef.current = currentValuesStr
      onGetNodeValuesRef.current(nodeValues)
    }
  }, [nodeValues])

  // エッジを動的に生成（linksとactiveLinksの変更を監視）
  useEffect(() => {
    const newEdges: Edge[] = []
    
    if (currentStep >= 1) {
      // Step1: 導出命題のリンク（固定、削除不可）
      newEdges.push({
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

    if (currentStep >= 2 && currentStep < 3) {
      // Step2: ユーザー作成リンク（削除可能）
      links.forEach((link, index) => {
        newEdges.push({
          id: `user-link-${index}`,
          source: link.from,
          target: link.to,
          type: 'triangleEdge',
          data: {
            isActive: true,
            isDeletable: true,
            onDelete: () => {
              const filteredLinks = links.filter((_, i) => i !== index)
              onLinksChange?.(filteredLinks)
            },
          },
        })
      })
    }

    if (currentStep === 3) {
      // Step3: 表示のみ（削除不可）
      links.forEach((link, index) => {
        newEdges.push({
          id: `user-link-${index}`,
          source: link.from,
          target: link.to,
          type: 'triangleEdge',
          data: {
            isActive: true,
            isDeletable: false,
          },
        })
      })
    }

    if (currentStep >= 4) {
      // Step4: 活性/非活性リンク
      activeLinks.forEach((link, index) => {
        newEdges.push({
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

    setEdges(newEdges as Edge[])
  }, [currentStep, links, activeLinks, onLinksChange, setEdges])

  return (
    <div className="w-full h-full rounded-2xl border-2 border-border bg-card overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Strict}
        connectOnClick={false}
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
              onAddNode={addPremiseNode}
            />
          </div>
        )}
      </ReactFlow>
    </div>
  )
}
