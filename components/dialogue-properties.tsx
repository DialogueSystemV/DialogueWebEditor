"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, MessageSquare } from "lucide-react"
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
      <div className="flex items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">Node Properties</h3>
            <p className="text-gray-400 text-sm">Configure dialogue node settings</p>
          </div>
        </div>
        <div className="ml-auto gap-2 flex">
          {selectedNode.removeQuestionAfterAsked && (
            <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-300">
              1 Time Ask
            </Badge>
          )}
          {selectedNode.startsConversation && (
            <Badge variant="outline" className="text-xs border-green-500 text-green-300">
              Starter
            </Badge>
          )}
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

        <div className="flex flex-col gap-4 bg-gray-750 rounded-lg p-4 border border-gray-700 mb-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">Remove Question After Asked</label>
            <Checkbox
              checked={selectedNode.removeQuestionAfterAsked}
              onCheckedChange={(checked) => {
                onUpdateNodeData(selectedNode.id, "removeQuestionAfterAsked", checked === true)
              }}
              className="h-5 w-5 rounded border-gray-500 bg-gray-600 text-blue-500 
                              focus:ring-blue-500 focus:ring-offset-0 hover:bg-gray-500 
                              transition-colors duration-200"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">Starts Conversation</label>
            <Checkbox
              checked={selectedNode.startsConversation}
              onCheckedChange={(checked) => {
                onUpdateNodeData(selectedNode.id, "startsConversation", checked === true)
              }}
              className="h-5 w-5 rounded border-gray-500 bg-gray-600 text-blue-500 
                              focus:ring-blue-500 focus:ring-offset-0 hover:bg-gray-500 
                              transition-colors duration-200"
            />
          </div>
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
                  <div className="flex items-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const updatedAnswers = (selectedNode.data.answers || []).filter(a => a.id !== answer.id)
                        onUpdateNodeAnswers(selectedNode.id, updatedAnswers)
                      }}
                      className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 mr-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium text-gray-200 truncate max-w-[120px] block">
                      {answer.text || "Untitled Answer"}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    {answer.condition && (
                      <Badge variant="outline" className="text-xs border-orange-500 text-orange-300">
                        Condition
                      </Badge>
                    )}
                    {answer.endsCondition && (
                      <Badge variant="outline" className="text-xs border-red-500 text-red-300">
                        Ender
                      </Badge>
                    )}
                    {answer.action && (
                      <Badge variant="outline" className="text-xs border-purple-500 text-purple-300">
                        Action
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
                        min="0"
                        max="100"
                        value={answer.probability}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : Number.parseInt(e.target.value);
                          const probability = isNaN(value) ? 100 / (selectedNode.data.answers?.length || 1) : value;
                          const updatedAnswers = (selectedNode.data.answers || []).map(a =>
                            a.id === answer.id ? { ...a, probability } : a
                          )
                          onUpdateNodeAnswers(selectedNode.id, updatedAnswers)
                        }}
                        className="bg-gray-600 border-gray-500 text-white focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-rows-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-400">Ends Conversation Abruptly</label>
                          <Checkbox
                            checked={answer.endsCondition}
                            onCheckedChange={(checked) => {
                              const updatedAnswers = (selectedNode.data.answers || []).map(a =>
                                a.id === answer.id ? { ...a, endsCondition: checked === true } : a
                              )
                              onUpdateNodeAnswers(selectedNode.id, updatedAnswers)
                            }}
                            className="h-5 w-5 rounded border-gray-500 bg-gray-600 text-blue-500 
                              focus:ring-blue-500 focus:ring-offset-0 hover:bg-gray-500 
                              transition-colors duration-200"
                          />
                        </div>
                      </div>
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
                  probability: selectedNode.data.answers?.length ? 100 - selectedNode.data.answers.reduce((sum, a) => sum + a.probability, 0) : 100,
                  condition: undefined,
                  endsCondition: false,
                  action: undefined,
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
      </div>
    </div>
  )
} 