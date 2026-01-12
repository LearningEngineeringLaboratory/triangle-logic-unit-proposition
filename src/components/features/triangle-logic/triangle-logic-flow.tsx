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
import { ActiveTriangleLink, NodeValues, TriangleLink, StepsState } from '@/lib/types'
import { logLinkCreated, logLinkDeleted, logLinkMarkedInactive, logLinkMarkedActive, logSelectDropdown, logCreateNode } from '@/lib/logging'
import { createNodeValueResolver } from '@/lib/answer-validation'
import { mapUiToDbState } from '@/lib/utils'

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
  // ログ記録用
  attemptId?: string | null
  problemId?: string
  sessionInfo?: { sessionId: string; userId: string } | null
  steps?: StepsState // 現在のステップ状態（state記録用）
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
  attemptId,
  problemId,
  sessionInfo,
  steps,
}: TriangleLogicFlowProps) {
  // テーマを取得
  const { theme } = useTheme()

  // ReactFlowの状態管理
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[])
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState([] as Edge[])
  
  // ReactFlowインスタンスを保持（ビューポート制御用）
  const reactFlowInstanceRef = useRef<any>(null)
  const previousStepRef = useRef<number>(currentStep)

  // Step2に移行した時にビューポートを下方向にシフト
  useEffect(() => {
    // Step1からStep2に移行した時のみビューポートを下方向にシフト
    if (previousStepRef.current === 1 && currentStep === 2 && reactFlowInstanceRef.current) {
      const instance = reactFlowInstanceRef.current
      
      // fitViewが実行された後にビューポートをシフトするため、少し遅延させる
      // ノードの位置変更が反映されるまで待つ
      setTimeout(() => {
        if (reactFlowInstanceRef.current) {
          const viewport = instance.getViewport()
          
          // ビューポートを下方向に100pxシフト（Y座標が100から200に移動した分）
          instance.setViewport(
            {
              x: viewport.x,
              y: viewport.y + 300, // 下方向に移動するため、Y座標を減らす
              zoom: viewport.zoom,
            },
            { duration: 300 } // アニメーション付きで移動
          )
        }
      }, 200) // fitViewとノード位置変更の反映を待つため、200ms遅延
    }
    
    previousStepRef.current = currentStep
  }, [currentStep])

  // ノードの値をメモ化（他のコールバックより前に定義）
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
  const { addPremiseNode: originalAddPremiseNode, updateNodePosition } = useTriangleNodes({
    currentStep,
    options,
    setNodes: setNodes as (nodes: Node[] | ((prevNodes: Node[]) => Node[])) => void,
    onNodeDelete: handleNodeDelete
  })

  // premiseノード追加時のログ記録付きラッパー
  const addPremiseNode = useCallback((value: string) => {
    // ノードIDを生成（useTriangleNodesと同じロジック）
    const newNodeId = `premise-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    originalAddPremiseNode(value)

    // ログ記録（create_nodeイベントとして記録）
    // nodeValuesはuseEffectで更新されるため、少し遅延してから記録
    // または、追加予定のノードを含めて計算
    if (sessionInfo && problemId && steps) {
      // ノード追加後のnodeValuesを計算（新しく追加されたノードを含む）
      const updatedNodeValues: NodeValues = nodeValues ? {
        ...nodeValues,
        premiseNodes: [
          ...nodeValues.premiseNodes,
          { id: newNodeId, value }
        ]
      } : {
        antecedent: '',
        consequent: '',
        premiseNodes: [{ id: newNodeId, value }]
      }
      const dbState = mapUiToDbState(steps, updatedNodeValues)
      logCreateNode({
        nodeId: newNodeId,
        nodeLabel: value,
        attemptId: attemptId ?? undefined,
        problemId,
        sessionId: sessionInfo.sessionId,
        userId: sessionInfo.userId,
        state: dbState,
      }).catch(console.error)
    }
  }, [originalAddPremiseNode, attemptId, problemId, sessionInfo, steps, nodeValues])

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

  // ノードの状態更新（ログ記録付き）
  const handleAntecedentChange = useCallback((value: string) => {
    onAntecedentChange?.(value)
    // ログ記録（sessionInfoとproblemIdがあれば記録）
    if (sessionInfo && problemId && steps) {
      // 更新後の状態を計算してstateを生成
      const currentStep1 = steps.step1 || { isPassed: false, antecedent: '', consequent: '' }
      const updatedSteps: StepsState = {
        ...steps,
        step1: {
          ...currentStep1,
          antecedent: value, // 更新後の値を使用
        },
      }

      // nodeValuesも更新後の値を反映させてログに送る
      const updatedNodeValues: NodeValues = nodeValues
        ? { ...nodeValues, antecedent: value }
        : { antecedent: value, consequent: '', premiseNodes: [] }

      const dbState = mapUiToDbState(updatedSteps, updatedNodeValues)
      console.log('[handleAntecedentChange] Logging:', { controlId: 'antecedent', value, attemptId, problemId, sessionId: sessionInfo.sessionId, userId: sessionInfo.userId })
      logSelectDropdown({
        controlId: 'antecedent',
        value,
        attemptId: attemptId ?? undefined,
        problemId,
        sessionId: sessionInfo.sessionId,
        userId: sessionInfo.userId,
        state: dbState,
      }).catch((err) => {
        console.error('[handleAntecedentChange] Log error:', err)
      })
    } else {
      console.warn('[handleAntecedentChange] Skipping log - missing sessionInfo or problemId:', { sessionInfo: !!sessionInfo, problemId })
    }
  }, [onAntecedentChange, attemptId, problemId, sessionInfo, steps, nodeValues])

  const handleConsequentChange = useCallback((value: string) => {
    onConsequentChange?.(value)
    // ログ記録（sessionInfoとproblemIdがあれば記録）
    if (sessionInfo && problemId && steps) {
      // 更新後の状態を計算してstateを生成
      const currentStep1 = steps.step1 || { isPassed: false, antecedent: '', consequent: '' }
      const updatedSteps: StepsState = {
        ...steps,
        step1: {
          ...currentStep1,
          consequent: value, // 更新後の値を使用
        },
      }

      // nodeValuesも更新後の値を反映させてログに送る
      const updatedNodeValues: NodeValues = nodeValues
        ? { ...nodeValues, consequent: value }
        : { antecedent: '', consequent: value, premiseNodes: [] }

      const dbState = mapUiToDbState(updatedSteps, updatedNodeValues)
      console.log('[handleConsequentChange] Logging:', { controlId: 'consequent', value, attemptId, problemId, sessionId: sessionInfo.sessionId, userId: sessionInfo.userId })
      logSelectDropdown({
        controlId: 'consequent',
        value,
        attemptId: attemptId ?? undefined,
        problemId,
        sessionId: sessionInfo.sessionId,
        userId: sessionInfo.userId,
        state: dbState,
      }).catch((err) => {
        console.error('[handleConsequentChange] Log error:', err)
      })
    } else {
      console.warn('[handleConsequentChange] Skipping log - missing sessionInfo or problemId:', { sessionInfo: !!sessionInfo, problemId })
    }
  }, [onConsequentChange, attemptId, problemId, sessionInfo, steps, nodeValues])

  useNodeUpdates({
    nodes,
    setNodes: setNodes as (nodes: Node[] | ((prevNodes: Node[]) => Node[])) => void,
    currentStep,
    antecedentValue,
    consequentValue,
    onAntecedentChange: handleAntecedentChange,
    onConsequentChange: handleConsequentChange,
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

        // ログ記録（ノードIDと文字列ラベルを含む）
        // nodeValuesが最新の状態を反映していることを確認するため、
        // nodesから直接計算する
        if (sessionInfo && problemId && steps) {
          // nodesから最新のnodeValuesを計算
          const latestNodeValues: NodeValues | null = (() => {
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
          })()

          if (latestNodeValues) {
            const resolveNodeValue = createNodeValueResolver(latestNodeValues)
            // 更新後の状態を計算してstateを生成
            const currentStep2 = steps.step2 || { isPassed: false, links: [] }
            const updatedSteps: StepsState = {
              ...steps,
              step2: {
                ...currentStep2,
                links: newLinks, // 更新後のリンクを使用
              },
            }
            const dbState = mapUiToDbState(updatedSteps, latestNodeValues)
            logLinkCreated({
              fromNode: params.source,
              toNode: params.target,
              fromLabel: resolveNodeValue(params.source),
              toLabel: resolveNodeValue(params.target),
              attemptId: attemptId ?? undefined,
              problemId,
              sessionId: sessionInfo.sessionId,
              userId: sessionInfo.userId,
              state: dbState,
            }).catch(console.error)
          }
        }
      } else if (currentStep === 4 && params.source && params.target) {
        // Step4: activeLinksを更新（active: trueとして追加）
        const newLink = {
          from: params.source,
          to: params.target,
          active: true,
        }
        const newActiveLinks = [...activeLinks, newLink]
        onActiveLinksChange?.(newActiveLinks)

        // ログ記録（ノードIDと文字列ラベルを含む）
        if (sessionInfo && problemId && nodeValues && steps) {
          const resolveNodeValue = createNodeValueResolver(nodeValues)
          // 更新後の状態を計算してstateを生成
          const currentStep4 = steps.step4 || { isPassed: false, links: [] }
          const updatedSteps: StepsState = {
            ...steps,
            step4: {
              ...currentStep4,
              links: newActiveLinks, // 更新後のリンクを使用
            },
          }
          const dbState = mapUiToDbState(updatedSteps, nodeValues ?? undefined)
          logLinkCreated({
            fromNode: params.source,
            toNode: params.target,
            fromLabel: resolveNodeValue(params.source),
            toLabel: resolveNodeValue(params.target),
            attemptId: attemptId ?? undefined,
            problemId,
            sessionId: sessionInfo.sessionId,
            userId: sessionInfo.userId,
            state: dbState,
          }).catch(console.error)
        }
      }
    },
    [currentStep, links, activeLinks, onLinksChange, onActiveLinksChange, attemptId, problemId, nodeValues, sessionInfo, steps]
  )

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

  // リンク変更時のログ記録付きコールバック
  const handleLinksChange = useCallback((newLinks: TriangleLink[]) => {
    onLinksChange?.(newLinks)

    // 削除されたリンクを検出してログ記録
    if (sessionInfo && problemId && nodeValues && steps) {
      const resolveNodeValue = createNodeValueResolver(nodeValues)
      // 更新後の状態を計算してstateを生成
      const currentStep2 = steps.step2 || { isPassed: false, links: [] }
      const updatedSteps: StepsState = {
        ...steps,
        step2: {
          ...currentStep2,
          links: newLinks, // 更新後のリンクを使用
        },
      }
      const dbState = mapUiToDbState(updatedSteps, nodeValues ?? undefined)
      const deletedLinks = links.filter(link =>
        !newLinks.some(newLink => newLink.from === link.from && newLink.to === link.to)
      )
      deletedLinks.forEach(link => {
        logLinkDeleted({
          fromNode: link.from,
          toNode: link.to,
          fromLabel: resolveNodeValue(link.from),
          toLabel: resolveNodeValue(link.to),
          attemptId: attemptId ?? undefined,
          problemId,
          sessionId: sessionInfo.sessionId,
          userId: sessionInfo.userId,
          state: dbState,
        }).catch(console.error)
      })
    }
  }, [onLinksChange, links, attemptId, problemId, nodeValues, sessionInfo, steps])

  // アクティブリンク変更時のログ記録付きコールバック
  const handleActiveLinksChange = useCallback((newActiveLinks: ActiveTriangleLink[]) => {
    onActiveLinksChange?.(newActiveLinks)

    // 活性/非活性の変更を検出してログ記録
    if (sessionInfo && problemId && nodeValues && steps) {
      const resolveNodeValue = createNodeValueResolver(nodeValues)
      // 更新後の状態を計算してstateを生成
      const currentStep4 = steps.step4 || { isPassed: false, links: [] }
      const updatedSteps: StepsState = {
        ...steps,
        step4: {
          ...currentStep4,
          links: newActiveLinks, // 更新後のリンクを使用
        },
      }
      const dbState = mapUiToDbState(updatedSteps, nodeValues ?? undefined)
      activeLinks.forEach(oldLink => {
        const newLink = newActiveLinks.find(
          nl => nl.from === oldLink.from && nl.to === oldLink.to
        )
        if (newLink) {
          // リンクが存在する場合、活性状態の変更をチェック
          if (oldLink.active !== newLink.active) {
            if (newLink.active) {
              logLinkMarkedActive({
                linkId: `${newLink.from}-${newLink.to}`,
                fromNode: newLink.from,
                toNode: newLink.to,
                fromLabel: resolveNodeValue(newLink.from),
                toLabel: resolveNodeValue(newLink.to),
                attemptId: attemptId ?? undefined,
                problemId,
                sessionId: sessionInfo.sessionId,
                userId: sessionInfo.userId,
                state: dbState,
              }).catch(console.error)
            } else {
              logLinkMarkedInactive({
                linkId: `${newLink.from}-${newLink.to}`,
                fromNode: newLink.from,
                toNode: newLink.to,
                fromLabel: resolveNodeValue(newLink.from),
                toLabel: resolveNodeValue(newLink.to),
                attemptId: attemptId ?? undefined,
                problemId,
                sessionId: sessionInfo.sessionId,
                userId: sessionInfo.userId,
                state: dbState,
              }).catch(console.error)
            }
          }
        } else {
          // リンクが削除された場合
          logLinkDeleted({
            fromNode: oldLink.from,
            toNode: oldLink.to,
            fromLabel: resolveNodeValue(oldLink.from),
            toLabel: resolveNodeValue(oldLink.to),
            attemptId: attemptId ?? undefined,
            problemId,
            sessionId: sessionInfo.sessionId,
            userId: sessionInfo.userId,
            state: dbState,
          }).catch(console.error)
        }
      })

      // 新しく追加されたリンクを検出
      newActiveLinks.forEach(newLink => {
        const oldLink = activeLinks.find(
          ol => ol.from === newLink.from && ol.to === newLink.to
        )
        if (!oldLink) {
          // 新規追加されたリンク（onConnectで記録されるため、ここでは記録しない）
        }
      })
    }
  }, [onActiveLinksChange, activeLinks, attemptId, problemId, nodeValues, sessionInfo, steps])

  // エッジを動的に生成
  const computedEdges = useTriangleEdges({
    currentStep,
    links,
    activeLinks,
    onLinksChange: handleLinksChange,
    onActiveLinksChange: handleActiveLinksChange,
  })

  useEffect(() => {
    setEdges(computedEdges)
  }, [computedEdges, setEdges])

  // ReactFlow内でのタッチ操作が画面スクロールとして扱われないようにする
  // タッチイベントの伝播を防ぎ、親要素へのスクロールイベントを防止
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // ReactFlow内でのタッチ操作は親要素に伝播させない
    e.stopPropagation()
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // ReactFlow内でのタッチ操作は親要素に伝播させない
    e.stopPropagation()
    // 画面スクロールを防ぐ（ReactFlowのパン操作を優先）
    // 注意: preventDefault()はReactFlowの操作を妨げない（touch-action: noneが設定されているため）
    e.preventDefault()
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // ReactFlow内でのタッチ操作は親要素に伝播させない
    e.stopPropagation()
  }, [])

  return (
    <div
      className="w-full h-full relative touch-action-none"
      style={{ overscrollBehavior: 'none' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <ReactFlow
        nodes={nodes}
        edges={flowEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={handleNodeDragStop}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onInit={(instance) => {
          reactFlowInstanceRef.current = instance
        }}
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
