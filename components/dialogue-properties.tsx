"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Play, Square } from "lucide-react"
import type { NodeData, Answer } from "@/types/dialogue"

interface DialoguePropertiesProps {
  selectedNode: NodeData
  nodes: NodeData[]
  onUpdateNodeData: (nodeId: string, field: string, value: any) => void
  onUpdateNodeAnswers: (nodeId: string, answers: Answer[]) => void
}

export function DialogueProperties({
  selectedNode,
  nodes,
  onUpdateNodeData,
  onUpdateNodeAnswers,
}: DialoguePropertiesProps) {
  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
      <h3 className="text-white font-medium mb-4">Node Properties</h3>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-300 block mb-1">Title</label>
          <Input
            value={selectedNode.title}
            onChange={(e) => onUpdateNodeData(selectedNode.id, "title", e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>

        <>
          <div>
            <label className="text-sm text-gray-300 block mb-1">Question Text</label>
            <Textarea
              value={selectedNode.data.questionText || ""}
              onChange={(e) => onUpdateNodeData(selectedNode.id, "questionText", e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-1">Answers</label>
            <div className="space-y-2">
              {(selectedNode.data.answers || []).map((answer) => (
                <div key={answer.id} className="bg-gray-800 p-2 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-300">{answer.text}</span>
                    <div className="flex space-x-1">
                      <Badge variant="default" className="text-xs">
                        {answer.probability}%
                      </Badge>
                      {answer.condition && (
                        <Badge variant="outline" className="text-xs">
                          Cond
                        </Badge>
                      )}
                      {answer.endsCondition && (
                        <Badge variant="outline" className="text-xs">
                          Ends
                        </Badge>
                      )}
                      {answer.action && (
                        <Badge variant="outline" className="text-xs">
                          Action
                        </Badge>
                      )}
                      {answer.targetNodeId && (
                        <Badge variant="outline" className="text-xs">
                          Target
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-gray-400 block mb-1">Text</label>
                      <Input
                        value={answer.text}
                        onChange={(e) => {
                          const updatedAnswers = (selectedNode.data.answers || []).map(a =>
                            a.id === answer.id ? { ...a, text: e.target.value } : a
                          )
                          onUpdateNodeAnswers(selectedNode.id, updatedAnswers)
                        }}
                        className="bg-gray-700 border-gray-600 text-white h-6"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1">Probability (%)</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={answer.probability}
                        onChange={(e) => {
                          const updatedAnswers = (selectedNode.data.answers || []).map(a =>
                            a.id === answer.id ? { ...a, probability: Number.parseInt(e.target.value) || 100 } : a
                          )
                          onUpdateNodeAnswers(selectedNode.id, updatedAnswers)
                        }}
                        className="bg-gray-700 border-gray-600 text-white h-6"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1">Condition</label>
                      <Input
                        value={answer.condition || ""}
                        onChange={(e) => {
                          const updatedAnswers = (selectedNode.data.answers || []).map(a =>
                            a.id === answer.id ? { ...a, condition: e.target.value || undefined } : a
                          )
                          onUpdateNodeAnswers(selectedNode.id, updatedAnswers)
                        }}
                        className="bg-gray-700 border-gray-600 text-white h-6"
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1">Action</label>
                      <Input
                        value={answer.action || ""}
                        onChange={(e) => {
                          const updatedAnswers = (selectedNode.data.answers || []).map(a =>
                            a.id === answer.id ? { ...a, action: e.target.value || undefined } : a
                          )
                          onUpdateNodeAnswers(selectedNode.id, updatedAnswers)
                        }}
                        className="bg-gray-700 border-gray-600 text-white h-6"
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1">Target Node</label>
                      <Select
                        value={answer.targetNodeId || "none"}
                        onValueChange={(value) => {
                          const updatedAnswers = (selectedNode.data.answers || []).map(a =>
                            a.id === answer.id ? { ...a, targetNodeId: value === "none" ? undefined : value } : a
                          )
                          onUpdateNodeAnswers(selectedNode.id, updatedAnswers)
                        }}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-6">
                          <SelectValue placeholder="Select target" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No target</SelectItem>
                          {nodes.filter(n => n.id !== selectedNode.id).map((node) => (
                            <SelectItem key={node.id} value={node.id}>
                              {node.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-gray-400">Ends Condition</label>
                      <Select
                        value={answer.endsCondition.toString()}
                        onValueChange={(value) => {
                          const updatedAnswers = (selectedNode.data.answers || []).map(a =>
                            a.id === answer.id ? { ...a, endsCondition: value === "true" } : a
                          )
                          onUpdateNodeAnswers(selectedNode.id, updatedAnswers)
                        }}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-6 w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">True</SelectItem>
                          <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const updatedAnswers = (selectedNode.data.answers || []).filter(a => a.id !== answer.id)
                      onUpdateNodeAnswers(selectedNode.id, updatedAnswers)
                    }}
                    className="h-6 w-6 p-0 text-red-400 hover:text-red-300 mt-2"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const newAnswer: Answer = {
                    id: Date.now().toString(),
                    text: "",
                    probability: 100,
                    condition: undefined,
                    endsCondition: false,
                    action: undefined,
                    targetNodeId: undefined,
                  }
                  const updatedAnswers = [...(selectedNode.data.answers || []), newAnswer]
                  onUpdateNodeAnswers(selectedNode.id, updatedAnswers)
                }}
                className="w-full bg-gray-700 border-gray-600 text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Answer
              </Button>
            </div>
          </div>
        </>

        <div className="pt-4 border-t border-gray-700">
          <div className="flex space-x-2">
            <Button size="sm" className="flex-1">
              <Play className="h-4 w-4 mr-1" />
              Test
            </Button>
            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
              <Square className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 