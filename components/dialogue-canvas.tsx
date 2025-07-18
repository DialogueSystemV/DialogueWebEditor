"use client"

import React from "react"
import type { NodeData, Connection } from "@/types/dialogue"
import { DialogueNode } from "./dialogue-node"
interface DialogueCanvasProps {
  nodes: NodeData[]
  connections: Connection[]
  selectedNode: string | null
  connecting: { nodeId: string } | null
  firstLinkClick: string | null
  isPanning: boolean
  panOffset: { x: number; y: number }
  zoom: number
  canvasRef: React.RefObject<HTMLDivElement | null>
  onNodeMouseDown: (e: React.MouseEvent, nodeId: string) => void
  onCanvasMouseDown: (e: React.MouseEvent) => void
  onNodeClick: (nodeId: string, isRightClick?: boolean) => void
  onNodeDelete: (nodeId: string) => void
  onStartConnecting: (nodeId: string, answerId: string) => void
}

export function DialogueCanvas({
  nodes,
  connections,
  selectedNode,
  connecting,
  firstLinkClick,
  isPanning,
  panOffset,
  zoom,
  canvasRef,
  onNodeMouseDown,
  onCanvasMouseDown,
  onNodeClick,
  onNodeDelete,
  onStartConnecting,
}: DialogueCanvasProps) {
  const getConnectionPath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const dx = to.x - from.x
    const dy = to.y - from.y
    const controlPoint1X = from.x + dx * 0.5
    const controlPoint2X = to.x - dx * 0.5

    return `M ${from.x} ${from.y} C ${controlPoint1X} ${from.y} ${controlPoint2X} ${to.y} ${to.x} ${to.y}`
  }

  const getDotPath = (to: { x: number; y: number }) => {
    const radius = 4
    return `M ${to.x - radius} ${to.y} a ${radius} ${radius} 0 1 0 ${radius * 2} 0 a ${radius} ${radius} 0 1 0 -${radius * 2} 0`
  }

  return (
    <div
      ref={canvasRef}
      className={`w-full h-full relative bg-gray-800 ${isPanning ? 'cursor-grabbing' : 'cursor-default'}`}
      style={{
        backgroundImage: "radial-gradient(circle, #374151 1px, transparent 1px)",
        backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
        backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
      }}
      onMouseDown={onCanvasMouseDown}
    >
      {/* Nodes - rendered first so connections appear on top */}
      {nodes.map((node) => (
        <DialogueNode
          key={node.id}
          node={{
            ...node,
            position: {
              x: node.position.x * zoom + panOffset.x,
              y: node.position.y * zoom + panOffset.y,
            }
          }}
          isSelected={selectedNode === node.id}
          isConnecting={!!connecting}
          isFirstLinkClick={firstLinkClick === node.id}
          onMouseDown={onNodeMouseDown}
          onClick={onNodeClick}
          onDelete={onNodeDelete}
          onStartConnecting={onStartConnecting}
        />
      ))}

      {/* Connections - rendered after nodes so they appear on top */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          zIndex: 10,
        }}
      >
        {connections.map((connection) => {
          const fromNode = nodes.find((n) => n.id === connection.from.nodeId)
          const toNode = nodes.find((n) => n.id === connection.to.nodeId)
          
          if (!fromNode || !toNode) return null

          const fromPos = {
            x: (fromNode.position.x + (288 / zoom)) * zoom + panOffset.x,
            y: (fromNode.position.y + 40) * zoom + panOffset.y,
          }
          const toPos = {
            x: toNode.position.x * zoom + panOffset.x,
            y: (toNode.position.y + 40) * zoom + panOffset.y,
          }

          const getHorizontalDirection = (from: { x: number; y: number }, to: { x: number; y: number }) => {
            if (to.x > from.x) {
              return;
            } else if (to.x < from.x) {
              fromPos.x = (fromNode.position.x + (1 / zoom)) * zoom + panOffset.x
              fromPos.y = (fromNode.position.y + 40) * zoom + panOffset.y
              toPos.x = (toNode.position.x + (288 / zoom)) * zoom + panOffset.x
              toPos.y = (toNode.position.y + 40) * zoom + panOffset.y
            }
          };
          // Calculate positions after zoom and pan transformations
         getHorizontalDirection(fromPos, toPos)

          return (
            <g key={connection.id}>
              <path
                d={getDotPath(fromPos)}
                stroke="#10b981"
                strokeWidth="2"
                fill="#10b981"
                className={!!connecting ? "opacity-50" : ""}
              />
              <path
                d={getConnectionPath(fromPos, toPos)}
                stroke="#3b82f6"
                strokeWidth="2"
                fill="none"
                className={!!connecting ? "opacity-50" : ""}
              />
              
              <path
                d={getDotPath(toPos)}
                stroke="#ef4444"
                strokeWidth="2"
                fill="#ef4444"
                className={!!connecting ? "opacity-50" : ""}
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
} 