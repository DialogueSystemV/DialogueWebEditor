"use client"

import React from "react"
import type { NodeData, Connection } from "@/types/dialogue"
import { DialogueNode } from "./dialogue-node"

interface DialogueCanvasProps {
  nodes: NodeData[]
  connections: Connection[]
  selectedNode: string | null
  connecting: { nodeId: string } | null
  canvasRef: React.RefObject<HTMLDivElement | null>
  onNodeMouseDown: (e: React.MouseEvent, nodeId: string) => void
  onNodeClick: (nodeId: string, isRightClick?: boolean) => void
  onNodeDelete: (nodeId: string) => void
  onStartConnecting: (nodeId: string, answerId: string) => void
}

export function DialogueCanvas({
  nodes,
  connections,
  selectedNode,
  connecting,
  canvasRef,
  onNodeMouseDown,
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

  const getArrowPath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const arrowLength = 10
    const arrowAngle = Math.PI / 6 // 30 degrees
    
    // Calculate the direction from source to target
    const dx = to.x - from.x
    const dy = to.y - from.y
    const angle = Math.atan2(dy, dx)
    
    // Calculate arrow points
    const arrowPoint1 = {
      x: to.x - arrowLength * Math.cos(angle - arrowAngle),
      y: to.y - arrowLength * Math.sin(angle - arrowAngle)
    }
    const arrowPoint2 = {
      x: to.x - arrowLength * Math.cos(angle + arrowAngle),
      y: to.y - arrowLength * Math.sin(angle + arrowAngle)
    }
    
    return `M ${to.x} ${to.y} L ${arrowPoint1.x} ${arrowPoint1.y} M ${to.x} ${to.y} L ${arrowPoint2.x} ${arrowPoint2.y}`
  }

  return (
    <div
      ref={canvasRef}
      className="w-full h-full relative bg-gray-800"
      style={{
        backgroundImage: "radial-gradient(circle, #374151 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      {/* Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {connections.map((connection) => {
          const fromNode = nodes.find((n) => n.id === connection.from.nodeId)
          const toNode = nodes.find((n) => n.id === connection.to.nodeId)

          if (!fromNode || !toNode) return null

          const fromPos = {
            x: fromNode.position.x + 280,
            y: fromNode.position.y + 40,
          }
          const toPos = {
            x: toNode.position.x,
            y: toNode.position.y + 40,
          }

          return (
            <g key={connection.id}>
              <path
                d={getConnectionPath(fromPos, toPos)}
                stroke="#10b981"
                strokeWidth="2"
                fill="none"
                className={!!connecting ? "opacity-50" : ""}
              />
              <path
                d={getArrowPath(fromPos, toPos)}
                stroke="#10b981"
                strokeWidth="2"
                fill="none"
                className={!!connecting ? "opacity-50" : ""}
              />
            </g>
          )
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node) => (
        <DialogueNode
          key={node.id}
          node={node}
          isSelected={selectedNode === node.id}
          isConnecting={!!connecting}
          onMouseDown={onNodeMouseDown}
          onClick={onNodeClick}
          onDelete={onNodeDelete}
          onStartConnecting={onStartConnecting}
        />
      ))}
    </div>
  )
} 