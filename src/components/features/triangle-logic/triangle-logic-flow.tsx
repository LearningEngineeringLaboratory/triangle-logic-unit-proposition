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

  // ノード位置変更を検知してpremiseNodesの位置を更新
  const handleNodePositionChange = useCallback((nodeId: string, position: { x: number; y: number }) => {
    // このコールバックはuseTriangleNodes内でpremiseNodesの位置を更新するために使用される
  }, [])

  // カスタムフックを使用してノード管理
  const { addPremiseNode, removePremiseNode, updateNodePosition } = useTriangleNodes({ 
    currentStep, 
    options, 
    setNodes: setNodes as (nodes: Node[] | ((prevNodes: Node[]) => Node[])) => void,
    onNodeDelete: handleNodeDelete,
    onNodePositionChange: handleNodePositionChange
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
          arrowType: 'triangle', // 三角形の矢印
          strokeWidth: 8, // 太く
          strokeColor: '#a5b4fc',
          showCircleMarker: false, // 円マーカーを非表示
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
      // Step3: 表示のみ（削除不可、「ならば」ラベル表示）
      links.forEach((link, index) => {
        newEdges.push({
          id: `user-link-${index}`,
          source: link.from,
          target: link.to,
          type: 'triangleEdge',
          data: {
            label: 'ならば',
            isActive: true,
            isDeletable: false,
          },
        })
      })
    }

    if (currentStep === 4) {
      // Step4: エッジの追加/削除のみ可能（ノード操作は不可）
      // Step2のリンクも含めて表示（Step4に遷移時に初期化される）
      const allLinks = [...links]
      activeLinks.forEach(activeLink => {
        // activeLinksに既に存在するかチェック（linksには含まれている可能性がある）
        const exists = allLinks.some(link => 
          link.from === activeLink.from && link.to === activeLink.to
        )
        if (!exists) {
          // activeLinksにしかないリンクは追加（Step4で新規作成したエッジ）
          allLinks.push({ from: activeLink.from, to: activeLink.to })
        }
      })
      
      allLinks.forEach((link, index) => {
        // Step1の派生リンク（antecedent → consequent）は操作不可
        const isDerivedLink = link.from === 'antecedent' && link.to === 'consequent'
        
        // Step2のエッジか、Step4で新規作成したエッジかを判定
        const isStep2Link = links.some(l => l.from === link.from && l.to === link.to)
        const isStep4NewLink = !isStep2Link && !isDerivedLink
        
        // activeLinksからactive状態を取得
        const activeLink = activeLinks.find(al => 
          al.from === link.from && al.to === link.to
        )
        // Step2のエッジでactiveLinksに存在しない場合はtrue（初期化時に追加されているはず）
        // Step4で新規作成したエッジでactiveLinksに存在しない場合もtrue
        const isActive = activeLink ? activeLink.active : true
        
        newEdges.push({
          id: `user-link-${index}`,
          source: link.from,
          target: link.to,
          type: 'triangleEdge',
          data: {
            isActive,
            // Step1のエッジ：操作不可
            // Step2のエッジ：active切り替えボタン
            // Step4で新規作成したエッジ：削除ボタン
            isToggleable: !isDerivedLink && isStep2Link,
            isDeletable: isStep4NewLink,
            onToggle: !isDerivedLink && isStep2Link ? () => {
              // Step2のエッジのactive状態を切り替え
              const existingLink = activeLinks.find(al => 
                al.from === link.from && al.to === link.to
              )
              if (existingLink) {
                // 既存のリンクのactive状態を切り替え
                const newActiveLinks = activeLinks.map(al => 
                  al.from === link.from && al.to === link.to
                    ? { ...al, active: !al.active }
                    : al
                )
                onActiveLinksChange?.(newActiveLinks)
              } else {
                // 新規にactive: falseとして追加
                const newActiveLinks = [...activeLinks, {
                  from: link.from,
                  to: link.to,
                  active: false,
                }]
                onActiveLinksChange?.(newActiveLinks)
              }
            } : undefined,
            onDelete: isStep4NewLink ? () => {
              // Step4で新規作成したエッジを削除
              const newActiveLinks = activeLinks.filter(al => 
                !(al.from === link.from && al.to === link.to)
              )
              onActiveLinksChange?.(newActiveLinks)
            } : undefined,
          },
        })
      })
    }

    if (currentStep >= 5) {
      // Step5: 表示のみ（すべての操作を無効化）
      // Step2のリンクも含めて表示（Step4に遷移時に初期化される）
      const allLinks = [...links]
      activeLinks.forEach(activeLink => {
        // activeLinksに既に存在するかチェック（linksには含まれている可能性がある）
        const exists = allLinks.some(link => 
          link.from === activeLink.from && link.to === activeLink.to
        )
        if (!exists) {
          // activeLinksにしかないリンクは追加（Step4で新規作成したエッジ）
          allLinks.push({ from: activeLink.from, to: activeLink.to })
        }
      })
      
      allLinks.forEach((link, index) => {
        // activeLinksからactive状態を取得
        const activeLink = activeLinks.find(al => 
          al.from === link.from && al.to === link.to
        )
        // Step2のエッジでactiveLinksに存在しない場合はtrue（初期化時に追加されているはず）
        // Step4で新規作成したエッジでactiveLinksに存在しない場合もtrue
        const isActive = activeLink ? activeLink.active : true
        
        newEdges.push({
          id: `user-link-${index}`,
          source: link.from,
          target: link.to,
          type: 'triangleEdge',
          data: {
            isActive,
            // アクティブなエッジのみ中央に「ならば」を表示
            label: isActive ? 'ならば' : undefined,
            // Step5ではすべての操作を無効化
            isToggleable: false,
            isDeletable: false,
            onToggle: undefined,
            onDelete: undefined,
          },
        })
      })
    }

    setEdges(newEdges as Edge[])
  }, [currentStep, links, activeLinks, onLinksChange, onActiveLinksChange, setEdges])

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
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
