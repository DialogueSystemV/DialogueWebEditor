"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Play, Square, MessageSquare, Settings } from "lucide-react"
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
    <div className="w-[30rem] bg-gray-800 border-l border-gray-700 p-6 overflow-y-auto">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-600 rounded-lg">
          <MessageSquare className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-lg">Node Properties</h3>
          <p className="text-gray-400 text-sm">Configure dialogue node settings</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Title Section */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-700">
          <label className="text-sm font-medium text-gray-300 block mb-3">Node Title</label>
          <Input
            value={selectedNode.title}
            onChange={(e) => onUpdateNodeData(selectedNode.id, "title", e.target.value)}
            className="bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter node title..."
          />
        </div>

        {/* Question Text Section */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-700">
          <label className="text-sm font-medium text-gray-300 block mb-3">Question Text</label>
          <Textarea
            value={selectedNode.data.questionText || ""}
            onChange={(e) => onUpdateNodeData(selectedNode.id, "questionText", e.target.value)}
            className="bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500 resize-none"
            rows={4}
            placeholder="Enter the question or dialogue text..."
          />
        </div>

        {/* Answers Section */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-gray-300">Answers</label>
            <Badge variant="secondary" className="bg-blue-600 text-blue-100">
              {(selectedNode.data.answers || []).length} answers
            </Badge>
          </div>
          
          <div className="space-y-4">
            {(selectedNode.data.answers || []).map((answer, index) => (
              <div key={answer.id} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium text-center w-full">{index + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-200 truncate max-w-[120px] block">
                      {answer.text || "Untitled Answer"}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant="default" className="text-xs bg-green-600 text-green-100">
                      {answer.probability}%
                    </Badge>
                    {answer.condition && (
                      <Badge variant="outline" className="text-xs border-orange-500 text-orange-300">
                        Condition
                      </Badge>
                    )}
                    {answer.endsCondition && (
                      <Badge variant="outline" className="text-xs border-red-500 text-red-300">
                        Ends
                      </Badge>
                    )}
                    {answer.action && (
                      <Badge variant="outline" className="text-xs border-purple-500 text-purple-300">
                        Action
                      </Badge>
                    )}
                    {answer.targetNodeId && (
                      <Badge variant="outline" className="text-xs border-blue-500 text-blue-300">
                        Connected
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-400 block mb-2">Answer Text</label>
                    <Input
                      value={answer.text}
                      onChange={(e) => {
                        const updatedAnswers = (selectedNode.data.answers || []).map(a =>
                          a.id === answer.id ? { ...a, text: e.target.value } : a
                        )
                        onUpdateNodeAnswers(selectedNode.id, updatedAnswers)
                      }}
                      className="bg-gray-600 border-gray-500 text-white focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter answer text..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-400 block mb-2">Probability (%)</label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={answer.probability}
                        onChange={(e) => {
                          const updatedAnswers = (selectedNode.data.answers || []).map(a =>
                            a.id === answer.id ? { ...a, probability: Number.parseInt(e.target.value) || 1 } : a
                          )
                          onUpdateNodeAnswers(selectedNode.id, updatedAnswers)
                        }}
                        className="bg-gray-600 border-gray-500 text-white focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-gray-400 block mb-2">Ends Condition</label>
                      <Select
                        value={answer.endsCondition.toString()}
                        onValueChange={(value) => {
                          const updatedAnswers = (selectedNode.data.answers || []).map(a =>
                            a.id === answer.id ? { ...a, endsCondition: value === "true" } : a
                          )
                          onUpdateNodeAnswers(selectedNode.id, updatedAnswers)
                        }}
                      >
                        <SelectTrigger className="bg-gray-600 border-gray-500 text-white focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">True</SelectItem>
                          <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-400 block mb-2">Condition (Optional)</label>
                    <Input
                      value={answer.condition || ""}
                      onChange={(e) => {
                        const updatedAnswers = (selectedNode.data.answers || []).map(a =>
                          a.id === answer.id ? { ...a, condition: e.target.value || undefined } : a
                        )
                        onUpdateNodeAnswers(selectedNode.id, updatedAnswers)
                      }}
                      className="bg-gray-600 border-gray-500 text-white focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter condition logic..."
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-400 block mb-2">Action (Optional)</label>
                    <Input
                      value={answer.action || ""}
                      onChange={(e) => {
                        const updatedAnswers = (selectedNode.data.answers || []).map(a =>
                          a.id === answer.id ? { ...a, action: e.target.value || undefined } : a
                        )
                        onUpdateNodeAnswers(selectedNode.id, updatedAnswers)
                      }}
                      className="bg-gray-600 border-gray-500 text-white focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter action to execute..."
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-400 block mb-2">Target Node</label>
                    <Select
                      value={answer.targetNodeId || "none"}
                      onValueChange={(value) => {
                        const updatedAnswers = (selectedNode.data.answers || []).map(a =>
                          a.id === answer.id ? { ...a, targetNodeId: value === "none" ? undefined : value } : a
                        )
                        onUpdateNodeAnswers(selectedNode.id, updatedAnswers)
                      }}
                    >
                      <SelectTrigger className="bg-gray-600 border-gray-500 text-white focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select target node" />
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
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const updatedAnswers = (selectedNode.data.answers || []).filter(a => a.id !== answer.id)
                      onUpdateNodeAnswers(selectedNode.id, updatedAnswers)
                    }}
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
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
              className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-gray-500 h-12"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Answer
            </Button>
          </div>
        </div>

        {/* Actions Section */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">Actions</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-10">
              <Play className="h-4 w-4 mr-2" />
              Test Node
            </Button>
            <Button variant="outline" size="sm" className="bg-transparent border-gray-600 text-white hover:bg-gray-700 h-10">
              <Square className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 