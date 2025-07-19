"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "lucide-react"
import type { NodeData, Answer } from "@/types/dialogue"
import { nodeTypes } from "@/types/dialogue"

interface DialogueNodeProps {
  node: NodeData
  isSelected: boolean
  isConnecting: boolean
  isFirstLinkClick: boolean
  zoom: number
  onMouseDown: (e: React.MouseEvent, nodeId: string) => void
  onClick: (nodeId: string, isRightClick?: boolean) => void
  onStartConnecting: (nodeId: string, answerId: string) => void
}

export function DialogueNode({
  node,
  isSelected,
  isConnecting,
  isFirstLinkClick,
  zoom,
  onMouseDown,
  onClick,
  onStartConnecting,
}: DialogueNodeProps) {
  return (
    <Card
      className={`absolute w-72 bg-gray-700 border-gray-600 cursor-grab ${isSelected ? "ring-2 ring-blue-500" : ""} ${isFirstLinkClick ? "ring-2 ring-green-500" : ""}`}
      style={{
        left: node.position.x,
        top: node.position.y,
        userSelect: "none",
        transform: `scale(${zoom})`,
        transformOrigin: "top left",
      }}
      onMouseDown={(e) => onMouseDown(e, node.id)}
      onClick={() => onClick(node.id)}
      onContextMenu={(e) => {
        e.preventDefault()
        onClick(node.id, true)
      }}
    >
      {/* Node Header */}
      <div className={
        `${node.startsConversation ? "bg-green-600" : "bg-blue-600"} ${node.removeQuestionAfterAsked && !node.startsConversation ? "bg-yellow-600" : ""} px-3 py-2 rounded-t-lg`
      }>
        <div className="flex items-center justify-between">
          <span className="text-white font-medium text-sm">{node.title}</span>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon" 
              className="h-6 w-6 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                onStartConnecting(node.id, "null")
              }}
            >
              <Link className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Node Content */}
      <div className="p-3 space-y-2 bg-gray-800">
        {node.data.questionText && (
          <div className="flex items-center justify-between bg-gray-700 p-1 rounded text-xs p-2 text-white">
            <span className="truncate">{node.data.questionText}</span>
          </div>
        )}

        {node.data.answers && node.data.answers.length > 0 && (
          <div className="text-xs text-gray-300">
            <div className="flex items-center justify-between mb-1">
              <Badge variant="default" className="text-white text-xs mb-2">
                {node.data.answers.length} answers
              </Badge>
            </div>
            <div className="space-y-1">
              {node.data.answers.map((answer) => (
                <div key={answer.id} className={`flex items-center justify-between bg-gray-700 ${answer.endsCondition ? "border border-red-600" : ""} p-1 rounded text-xs p-2`}>
                  <span className="text-gray-300 truncate">{answer.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
} 