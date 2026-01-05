"use client"

import React, { memo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link, CopyPlus, MessageCircleQuestion } from "lucide-react"
import type { NodeData } from "@/types/dialogue"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"

interface DialogueNodeProps {
  node: NodeData
  isSelected: boolean
  connecting: { nodeId: string } | null
  firstLinkClick: string | null
  zoom: number
  panOffset: { x: number; y: number }
  handleNodeMouseDown: (e: React.MouseEvent, nodeId: string) => void
  handleNodeClick: (nodeId: string, isRightClick?: boolean) => void
  startConnecting: (nodeId: string) => void
  cloneNode: (nodeId: string) => void
}

export const DialogueNode = memo(function DialogueNode({
  node,
  isSelected,
  connecting,
  firstLinkClick,
  zoom,
  panOffset,
  handleNodeMouseDown,
  handleNodeClick,
  startConnecting,
  cloneNode,
}: DialogueNodeProps) {
  const isConnecting = !!connecting
  const isFirstLinkClick = firstLinkClick === node.id

  const transformedPosition = {
    x: node.position.x * zoom + panOffset.x,
    y: node.position.y * zoom + panOffset.y,
  }
  return (
    <Card
      className={`absolute w-72 bg-gray-700 border-gray-600 cursor-grab ${isSelected ? "ring-2 ring-blue-500" : ""} ${isFirstLinkClick ? "ring-2 ring-green-500" : ""}`}
      style={{
        transform: `translate3d(${transformedPosition.x}px, ${transformedPosition.y}px, 0) scale(${zoom})`,
        userSelect: "none",
        transformOrigin: "top left",
        willChange: "transform",
      }}
      onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
      onClick={() => handleNodeClick(node.id)}
      onContextMenu={(e) => {
        e.preventDefault()
        handleNodeClick(node.id, true)
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
                cloneNode(node.id)
              }}
              title="Clone node"
            >
              <CopyPlus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon" 
              className="h-6 w-6 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                startConnecting(node.id)
              }}
              title="Connect node"
            >
              <Link className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Node Content */}
      <div className="p-3 space-y-2 bg-gray-800">
        {node.data.questionText && (
          <div className="flex items-center bg-blue-900/80 border-l-4 border-blue-400 px-3 py-2 rounded-t text-xs text-white font-semibold mb-1 shadow">
            <span className="flex items-center gap-2 truncate">
              <span className="flex items-center gap-1">
                <MessageCircleQuestion className="h-5 w-5 text-blue-300" />
                {node.data.questionText}
              </span>
            </span>
          </div>
        )}

        {node.data.answers && node.data.answers.length > 0 && (
          <Collapsible defaultOpen={false}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between mb-2 cursor-pointer select-none bg-gray-700 rounded px-2 py-1 hover:bg-gray-600 transition-colors">
                <Badge variant="default" className="text-white text-xs">
                  {node.data.answers.length} {node.data.answers.length === 1 ? "answer" : "answers"}
                </Badge>
                <svg
                  className="h-4 w-4 text-gray-400 ml-2"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2 mt-2 text-xs text-gray-300">
                {node.data.answers.map((answer) => (
                  <div
                    key={answer.id}
                    className={`
                      flex flex-col gap-1 bg-gray-700 
                      ${answer.endsCondition ? "border-2 border-red-600" : "border border-gray-600"} 
                      rounded p-2 shadow-sm
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-100 font-medium truncate">{answer.text || <span className="italic text-gray-400">No text</span>}</span>
                      {answer.endsCondition && (
                        <Badge variant="destructive" className="ml-2 text-[10px] font-semibold uppercase tracking-wide">
                          Ender
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-gray-300">
                      <span className="flex items-center gap-1">
                        <span className="font-semibold">Probability:</span>
                        <span className="text-blue-300">{typeof answer.probability === "number" ? `${answer.probability}%` : "—"}</span>
                      </span>
                      {answer.condition && (
                        <span className="flex items-center gap-1">
                          <span className="font-semibold">Condition:</span>
                          <span
                            className="truncate max-w-[8rem] text-yellow-300"
                            title={answer.condition}
                          >
                            {answer.condition.split('.').pop()}
                          </span>
                        </span>
                      )}
                      {answer.action && (
                        <span className="flex items-center gap-1">
                          <span className="font-semibold">Action:</span>
                          <span
                            className="truncate max-w-[8rem] text-green-300"
                            title={answer.action}
                          >
                            {answer.action.split('.').pop()}
                          </span>
                        </span>
                      )}
                      {answer.consequences && (answer.consequences.questionsToAdd && answer.consequences.questionsToAdd.length > 0 || answer.consequences.questionsToRemove && answer.consequences.questionsToRemove.length > 0) && (
                        <span className="flex items-center gap-1">
                          <span className="font-semibold">Consequences:</span>
                          {answer.consequences.questionsToAdd && answer.consequences.questionsToAdd.length > 0 && (
                            <span className="text-cyan-300" title="Questions to Add">
                              +{answer.consequences.questionsToAdd.length}
                            </span>
                          )}
                          {answer.consequences.questionsToRemove && answer.consequences.questionsToRemove.length > 0 && (
                            <span className="text-pink-300" title="Questions to Remove">
                              -{answer.consequences.questionsToRemove.length}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </Card>
  )
}, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render), false if different (re-render)
  // Only check answers length, not full content (expensive)
  const prevAnswersLength = prevProps.node.data.answers?.length ?? 0
  const nextAnswersLength = nextProps.node.data.answers?.length ?? 0
  
  return (
    prevProps.node.id === nextProps.node.id &&
    prevProps.node.position.x === nextProps.node.position.x &&
    prevProps.node.position.y === nextProps.node.position.y &&
    prevProps.node.title === nextProps.node.title &&
    prevProps.node.startsConversation === nextProps.node.startsConversation &&
    prevProps.node.removeQuestionAfterAsked === nextProps.node.removeQuestionAfterAsked &&
    prevProps.node.data.questionText === nextProps.node.data.questionText &&
    prevAnswersLength === nextAnswersLength &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.connecting?.nodeId === nextProps.connecting?.nodeId &&
    prevProps.firstLinkClick === nextProps.firstLinkClick &&
    prevProps.zoom === nextProps.zoom &&
    prevProps.panOffset.x === nextProps.panOffset.x &&
    prevProps.panOffset.y === nextProps.panOffset.y
  )
}) 