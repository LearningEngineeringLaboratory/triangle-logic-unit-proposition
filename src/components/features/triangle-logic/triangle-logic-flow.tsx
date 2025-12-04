'use client'

import React, { useCallback, useEffect, useMemo, useRef } from 'react'
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
  NodeChange,
} from '@xyflow/react'
import { TriangleNode } from './nodes/TriangleNode'
import { PremiseNode } from './nodes/PremiseNode'
import { TriangleEdge } from './edges/TriangleEdge'
import { TriangleConnectionLine } from './edges/TriangleConnectionLine'
import { AddPremiseNodeButton } from './components/AddPremiseNodeButton'
import { useTriangleNodes } from './hooks/useTriangleNodes'
import { useNodeUpdates } from './hooks/useNodeUpdates'
import { useTriangleEdges } from './hooks/useTriangleEdges'
import { ActiveTriangleLink, NodeValues, TriangleLink } from '@/lib/types'

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
  links?: TriangleLink[]
  onLinksChange?: (links: TriangleLink[]) => void
  // Step4 props
  activeLinks?: ActiveTriangleLink[]
  onActiveLinksChange?: (links: ActiveTriangleLink[]) => void
  // 答え合わせ用
  onGetNodeValues?: (values: NodeValues) => void
}

export function TriangleLogicFlow({
  options,
  currentStep,
  antecedentValue = '',
  consequentValue = '',
  onAntecedentChange,
  onConsequentChange,
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
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState([] as Edge[])

  // ノード削除時にリンクも削除するコールバック
  const handleNodeDelete = useCallback((nodeId: string) => {
    // そのノードに関連するリンクを削除
    if (currentStep === 2 && onLinksChange) {
      const filteredLinks = links.filter(link =>
        link.from !== nodeId && link.to !== nodeId
      )
      onLinksChange(filteredLinks)
    }

    // Step4の場合もactiveLinksから削除
    if (currentStep === 4 && onActiveLinksChange) {
      const filteredActiveLinks = activeLinks.filter(link =>
        link.from !== nodeId && link.to !== nodeId
      )
      onActiveLinksChange(filteredActiveLinks)
    }
  }, [currentStep, links, activeLinks, onLinksChange, onActiveLinksChange])

  // カスタムフックを使用してノード管理
  const { addPremiseNode, updateNodePosition } = useTriangleNodes({
    currentStep,
    options,
    setNodes: setNodes as (nodes: Node[] | ((prevNodes: Node[]) => Node[])) => void,
    onNodeDelete: handleNodeDelete
  })

  // onNodesChangeをラップして、premiseノードの位置変更を検知
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    // ReactFlowの変更を適用
    onNodesChange(changes)

    // premiseノードの位置変更を検知して更新（ドラッグ中は無視）
    if (currentStep >= 2) {
      changes.forEach((change) => {
        // 位置変更の場合、change.type === 'position' で、changeには position プロパティがある
        if (change.type === 'position' && change.id && change.id.startsWith('premise-')) {
          // NodeChangeの型定義に基づいて、positionプロパティにアクセス
          const positionChange = change as { type: 'position'; id: string; position: { x: number; y: number }; dragging?: boolean }
          // ドラッグ中（dragging: true）の位置変更は無視し、ドラッグ終了時（dragging !== true）のみ更新
          if (positionChange.position && positionChange.dragging !== true) {
            updateNodePosition(positionChange.id, positionChange.position)
          }
        }
      })
    }
  }, [onNodesChange, currentStep, updateNodePosition])

  // ノードのドラッグ終了時に位置を更新
  const handleNodeDragStop = useCallback((_event: React.MouseEvent, node: Node) => {
    if (currentStep >= 2 && node.id.startsWith('premise-') && node.position) {
      updateNodePosition(node.id, node.position)
    }
  }, [currentStep, updateNodePosition])

  // ノードの状態更新
  useNodeUpdates({
    nodes,
    setNodes: setNodes as (nodes: Node[] | ((prevNodes: Node[]) => Node[])) => void,
    currentStep,
    antecedentValue,
    consequentValue,
    onAntecedentChange,
    onConsequentChange,
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
        // Step2: linksを更新
        const newLink = {
          from: params.source,
          to: params.target,
        }
        const newLinks = [...links, newLink]
        onLinksChange?.(newLinks)
      } else if (currentStep === 4 && params.source && params.target) {
        // Step4: activeLinksを更新（active: trueとして追加）
        const newLink = {
          from: params.source,
          to: params.target,
          active: true,
        }
        const newActiveLinks = [...activeLinks, newLink]
        onActiveLinksChange?.(newActiveLinks)
      }
    },
    [currentStep, links, activeLinks, onLinksChange, onActiveLinksChange]
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

  // エッジを動的に生成
  const computedEdges = useTriangleEdges({
    currentStep,
    links,
    activeLinks,
    onLinksChange,
    onActiveLinksChange,
  })

  useEffect(() => {
    setEdges(computedEdges)
  }, [computedEdges, setEdges])

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={flowEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={handleNodeDragStop}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineComponent={TriangleConnectionLine}
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
