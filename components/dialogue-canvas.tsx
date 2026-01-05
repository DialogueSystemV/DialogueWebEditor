"use client"

import React, { useMemo, memo } from "react"
import { useDialogueContext } from "@/contexts/dialogue-context"
import type { NodeData, Connection } from "@/types/dialogue"
import { DialogueNode } from "./dialogue-node"

interface DialogueCanvasProps {
  connecting: { nodeId: string } | null
  firstLinkClick: string | null
  isPanning: boolean
  panOffset: { x: number; y: number }
  zoom: number
  canvasRef: React.RefObject<HTMLDivElement | null>
  draggedNode: string | null
  handleNodeMouseDown: (e: React.MouseEvent, nodeId: string) => void
  handleCanvasMouseDown: (e: React.MouseEvent) => void
  handleNodeClick: (nodeId: string, isRightClick?: boolean) => void
  startConnecting: (nodeId: string) => void
  cloneNode: (nodeId: string) => void
}

export function DialogueCanvas({
  connecting,
  firstLinkClick,
  isPanning,
  panOffset,
  zoom,
  canvasRef,
  draggedNode,
  handleNodeMouseDown,
  handleCanvasMouseDown,
  handleNodeClick,
  startConnecting,
  cloneNode,
}: DialogueCanvasProps) {
  const { nodes, connections, selectedNode, dragGhost } = useDialogueContext()
  
  // Cache per-node transformed positions for this frame
  const nodePositionCache = useMemo(() => {
    const cache = new Map<string, { fromX: number; toX: number; y: number }>()
    for (const node of nodes) {
      const y = (node.position.y + 40) * zoom + panOffset.y
      const toX = node.position.x * zoom + panOffset.x
      const fromX = (node.position.x + 288) * zoom + panOffset.x
      cache.set(node.id, { fromX, toX, y })
    }
    return cache
  }, [nodes, zoom, panOffset])

  // Memoized connection component (re-renders only when endpoints/connecting change)
  const ConnectionPath = memo(function ConnectionPath({
    id,
    fromX,
    fromY,
    toX,
    toY,
    dimmed,
  }: {
    id: string
    fromX: number
    fromY: number
    toX: number
    toY: number
    dimmed: boolean
  }) {
    const paths = useMemo(() => {
      const dx = toX - fromX
      const controlPoint1X = fromX + dx * 0.5
      const controlPoint2X = toX - dx * 0.5
      const connectionPath = `M ${fromX} ${fromY} C ${controlPoint1X} ${fromY} ${controlPoint2X} ${toY} ${toX} ${toY}`
      const radius = 4
      const fromDot = `M ${fromX - radius} ${fromY} a ${radius} ${radius} 0 1 0 ${radius * 2} 0 a ${radius} ${radius} 0 1 0 -${radius * 2} 0`
      const toDot = `M ${toX - radius} ${toY} a ${radius} ${radius} 0 1 0 ${radius * 2} 0 a ${radius} ${radius} 0 1 0 -${radius * 2} 0`
      return { connectionPath, fromDot, toDot }
    }, [fromX, fromY, toX, toY])

    const opacityClass = dimmed ? "opacity-50" : ""
    return (
      <g key={id}>
        <path
          d={paths.fromDot}
          stroke="#10b981"
          strokeWidth="2"
          fill="#10b981"
          className={opacityClass}
        />
        <path
          d={paths.connectionPath}
          stroke="#3b82f6"
          strokeWidth="2"
          fill="none"
          className={opacityClass}
        />
        <path
          d={paths.toDot}
          stroke="#ef4444"
          strokeWidth="2"
          fill="#ef4444"
          className={opacityClass}
        />
      </g>
    )
  })

  return (
    <div
      ref={canvasRef}
      className={`w-full h-full relative bg-gray-800 ${isPanning ? 'cursor-grabbing' : 'cursor-default'}`}
      style={{
        backgroundImage: "radial-gradient(circle, #374151 1px, transparent 1px)",
        backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
        backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
      }}
      onMouseDown={handleCanvasMouseDown}
    >
      {/* Nodes - rendered first so connections appear on top */}
      {nodes.map((node) => (
        <DialogueNode
          key={node.id}
          node={node}
          isSelected={selectedNode === node.id}
          connecting={connecting}
          firstLinkClick={firstLinkClick}
          zoom={zoom}
          panOffset={panOffset}
          handleNodeMouseDown={handleNodeMouseDown}
          handleNodeClick={handleNodeClick}
          startConnecting={startConnecting}
          cloneNode={cloneNode}
        />
      ))}

      {/* Drag ghost overlay */}
      {dragGhost.nodeId && (() => {
        const ghostNode = nodes.find(n => n.id === dragGhost.nodeId)
        if (!ghostNode) return null
        const tx = dragGhost.x * zoom + panOffset.x
        const ty = dragGhost.y * zoom + panOffset.y
        return (
          <div
            key={`ghost-${dragGhost.nodeId}`}
            className="absolute pointer-events-none"
            style={{
              transform: `translate3d(${tx}px, ${ty}px, 0) scale(${zoom})`,
              transformOrigin: "top left",
              zIndex: 20,
              width: 288,
            }}
          >
            <div className="w-72 opacity-60">
              <div className={`${ghostNode.startsConversation ? "bg-green-600" : "bg-blue-600"} ${ghostNode.removeQuestionAfterAsked && !ghostNode.startsConversation ? "bg-yellow-600" : ""} px-3 py-2 rounded-t-lg border-2 border-dashed border-white/60`}>
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium text-sm">{ghostNode.title}</span>
                </div>
              </div>
              <div className="p-3 bg-gray-800 border-2 border-dashed border-white/40 rounded-b-lg">
                {ghostNode.data.questionText && (
                  <div className="flex items-center bg-blue-900/80 border-l-4 border-blue-400 px-3 py-2 rounded text-xs text-white font-semibold mb-1">
                    <span className="truncate">{ghostNode.data.questionText}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Connections - rendered after nodes so they appear on top */}
      {!draggedNode && (
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            zIndex: 10,
          }}
        >
          {connections.map((connection) => {
            const from = nodePositionCache.get(connection.from.nodeId)
            const to = nodePositionCache.get(connection.to.nodeId)
            if (!from || !to) return null
            return (
              <ConnectionPath
                key={connection.id}
                id={connection.id}
                fromX={from.fromX}
                fromY={from.y}
                toX={to.toX}
                toY={to.y}
                dimmed={!!connecting}
              />
            )
          })}
        </svg>
      )}
    </div>
  )
} 