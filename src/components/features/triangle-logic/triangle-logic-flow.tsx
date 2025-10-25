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
  Handle,
  Position,
  NodeTypes,
  EdgeTypes,
  ConnectionMode,
} from '@xyflow/react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

// ========================================
// カスタムノードコンポーネント
// ========================================
interface TriangleNodeData {
  label: string
  options: string[]
  value: string
  onValueChange: (value: string) => void
  isReadOnly?: boolean
  nodeId: string
}

interface TriangleNodeProps {
  data: TriangleNodeData
}

function TriangleNode({ data }: TriangleNodeProps) {
  const { label, options, value, onValueChange, isReadOnly = false, nodeId } = data

  return (
    <div className="relative">
      {/* ノード外側のハンドル（接続ポイント） */}
      <Handle
        type="source"
        position={Position.Right}
        id={`${nodeId}-right`}
        className="w-3 h-3 bg-primary border-2 border-background"
        style={{ right: -6 }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id={`${nodeId}-left`}
        className="w-3 h-3 bg-primary border-2 border-background"
        style={{ left: -6 }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id={`${nodeId}-top`}
        className="w-3 h-3 bg-primary border-2 border-background"
        style={{ top: -6 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={`${nodeId}-bottom`}
        className="w-3 h-3 bg-primary border-2 border-background"
        style={{ bottom: -6 }}
      />

      {/* ターゲットハンドル */}
      <Handle
        type="target"
        position={Position.Right}
        id={`${nodeId}-target-right`}
        className="w-3 h-3 bg-secondary border-2 border-background"
        style={{ right: -6 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id={`${nodeId}-target-left`}
        className="w-3 h-3 bg-secondary border-2 border-background"
        style={{ left: -6 }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id={`${nodeId}-target-top`}
        className="w-3 h-3 bg-secondary border-2 border-background"
        style={{ top: -6 }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id={`${nodeId}-target-bottom`}
        className="w-3 h-3 bg-secondary border-2 border-background"
        style={{ bottom: -6 }}
      />

      {/* ノード本体 */}
      <div className="px-4 py-2 bg-background border-2 border-border rounded-lg shadow-sm min-w-[120px]">
        {isReadOnly ? (
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">{label}</div>
            <div className="text-lg font-medium">{value || "選択されていません"}</div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">{label}</div>
            <Select value={value} onValueChange={onValueChange}>
              <SelectTrigger className={`w-full ${value ? '' : 'animate-glow-pulse'}`}>
                <SelectValue placeholder="選択" />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  )
}

// ========================================
// カスタムエッジコンポーネント
// ========================================
interface TriangleEdgeProps {
  id: string
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourcePosition: Position
  targetPosition: Position
  style?: React.CSSProperties
  data?: {
    label?: string
    isActive?: boolean
    isDeletable?: boolean
    onDelete?: () => void
  }
}

function TriangleEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data
}: TriangleEdgeProps) {
  const { label, isActive = true, isDeletable = false, onDelete } = data || {}

  // エッジのパスを計算
  const edgePath = useMemo(() => {
    const offsetX = targetX - sourceX
    const offsetY = targetY - sourceY
    const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY)
    
    // 双方向リンクの場合は弧を描く
    const isBidirectional = Math.abs(offsetX) < 50 && Math.abs(offsetY) < 50
    
    if (isBidirectional) {
      const radius = 30
      const controlX = sourceX + offsetX / 2
      const controlY = sourceY - radius
      return `M ${sourceX} ${sourceY} Q ${controlX} ${controlY} ${targetX} ${targetY}`
    }
    
    return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`
  }, [sourceX, sourceY, targetX, targetY])

  const edgeStyle = {
    ...style,
    stroke: isActive ? '#64748b' : '#f97316',
    strokeWidth: isActive ? 3 : 2,
    strokeDasharray: isActive ? 'none' : '5,5',
    opacity: isActive ? 1 : 0.6,
  }

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={edgeStyle}
      />
      {label && (
        <text>
          <textPath href={`#${id}`} style={{ fontSize: 12, fill: '#64748b' }}>
            {label}
          </textPath>
        </text>
      )}
      {isDeletable && onDelete && (
        <foreignObject
          x={(sourceX + targetX) / 2 - 10}
          y={(sourceY + targetY) / 2 - 10}
          width={20}
          height={20}
        >
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="h-6 w-6 rounded-full p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </foreignObject>
      )}
    </>
  )
}

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
  // ノードの初期設定（値の変更時は再作成しない）
  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = []
    
    if (currentStep >= 1) {
      // Step1: 前件ノード（左上）
      nodes.push({
        id: 'antecedent',
        type: 'triangleNode',
        position: { x: 50, y: 50 },
        data: {
          label: '前件',
          options,
          value: '',
          onValueChange: onAntecedentChange || (() => {}),
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
          label: '後件',
          options,
          value: '',
          onValueChange: onConsequentChange || (() => {}),
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
          label: '所与命題',
          options,
          value: '',
          onValueChange: onPremiseChange || (() => {}),
          isReadOnly: false,
          nodeId: 'premise',
        },
      })
    }

    return nodes
  }, [currentStep, options, onAntecedentChange, onConsequentChange, onPremiseChange])

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
  }, [antecedentValue, consequentValue, premiseValue, currentStep])

  // 値が変更されたときにノードを更新
  useEffect(() => {
    updateNodes()
  }, [updateNodes])

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

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // 初期ノードの設定（一度だけ実行）
  useEffect(() => {
    if (nodes.length === 0) {
      setNodes(initialNodes)
    }
  }, [initialNodes, nodes.length, setNodes])

  // 初期エッジの設定（一度だけ実行）
  useEffect(() => {
    if (edges.length === 0) {
      setEdges(initialEdges)
    }
  }, [initialEdges, edges.length, setEdges])

  // エッジの更新（linksやactiveLinksが変更されたとき）
  useEffect(() => {
    setEdges(initialEdges)
  }, [initialEdges, setEdges])

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
