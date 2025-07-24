"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, MessageSquare, HelpCircle } from "lucide-react"
import type { NodeData, Answer, Connection } from "@/types/dialogue"
import { MultiSelect } from "./ui/multi-select"

interface DialoguePropertiesProps {
  selectedNode: NodeData
  nodes: NodeData[]
  connections: Connection[]
  onUpdateNodeData: (nodeId: string, field: string, value: any) => void
  onUpdateNodeAnswers: (nodeId: string, answers: Answer[]) => void
  onDeleteNode?: (nodeId: string) => void
}

export function DialogueProperties({
  selectedNode,
  nodes,
  connections,
  onUpdateNodeData,
  onUpdateNodeAnswers,
  onDeleteNode,
}: DialoguePropertiesProps) {
  return (
    <div className="w-[26rem] bg-gray-800 border-l border-gray-700 p-6 overflow-y-auto">
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
              disabled={connections.some(connection => connection.to.nodeId === selectedNode.id)}
              onCheckedChange={(checked) => {
                onUpdateNodeData(selectedNode.id, "startsConversation", checked === true)
              }}
              className="h-5 w-5 rounded border-gray-500 bg-gray-600 text-blue-500 
                              focus:ring-blue-500 focus:ring-offset-0 hover:bg-gray-500 
                              transition-colors duration-200"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 bg-gray-750 rounded-lg p-4 border border-gray-700 mb-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Questions to Add</label>
            <MultiSelect
              options={nodes
                .filter(node => node.id !== selectedNode.id)
                .map(node => ({
                  label: node.title,
                  value: node.id
                }))
              }
              selected={
                (selectedNode.data.questionsToAdd || []).filter(id =>
                  nodes.some(node => node.id === id)
                )
              }
              onChange={(selected) => {
                onUpdateNodeData(selectedNode.id, "questionsToAdd", selected.filter(id => nodes.some(node => node.id === id)))
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Questions to Remove</label>
            <MultiSelect
              options={nodes
                .filter(node => node.id !== selectedNode.id)
                .map(node => ({
                  label: node.title,
                  value: node.id
                }))
              }
              selected={
                (selectedNode.data.questionsToRemove || []).filter(id =>
                  nodes.some(node => node.id === id)
                )
              }
              onChange={(selected) => {
                onUpdateNodeData(selectedNode.id, "questionsToRemove", selected.filter(id => nodes.some(node => node.id === id)))
              }}
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

                  <div className="flex flex-row gap-4 items-center">
                    <div className="flex-1">
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

                    <div className="flex flex-col gap-3 flex-1">
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
                    <div className="flex items-center gap-2 mb-2 group relative">
                      <label className="text-xs font-medium text-gray-400">Condition (Optional)</label>
                      <div className="relative flex items-center group">
                        <HelpCircle
                          className="h-4 w-4 text-gray-400 hover:text-gray-300"
                        />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-sm text-gray-200 rounded-lg shadow-lg w-fit p-2 z-10">
                          Enter a <strong>public static</strong> C# method that returns a boolean that takes in <strong>0 parameters.</strong> This determines if this answer should be available to be chosen. Leave empty to always show the answer. Expected format: Assembly.Namespace.Class.Method
                        </div>
                      </div>
                    </div>
                    <Input
                      value={answer.condition || ""}
                      onChange={(e) => {
                        const updatedAnswers = (selectedNode.data.answers || []).map(a =>
                          a.id === answer.id ? { ...a, condition: e.target.value || undefined } : a
                        )
                        onUpdateNodeAnswers(selectedNode.id, updatedAnswers)
                      }}
                      className="bg-gray-600 border-gray-500 text-white focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Assembly.Namespace.Class.Method"
                    />
                  </div>

                  <div>
                  <div className="flex items-center gap-2 mb-2 group relative">
                      <label className="text-xs font-medium text-gray-400">Action (Optional)</label>
                      <div className="relative flex items-center group">
                        <HelpCircle
                          className="h-4 w-4 text-gray-400 hover:text-gray-300"
                        />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-sm text-gray-200 rounded-lg shadow-lg w-fit p-2 z-10">
                          Enter a <strong>public static</strong> C# method that takes in <strong>0 parameters.</strong> This method will be called when this answer is chosen. Expected format: Assembly.Namespace.Class.Method
                        </div>
                      </div>
                    </div>
                    <Input
                      value={answer.action || ""}
                      onChange={(e) => {
                        const updatedAnswers = (selectedNode.data.answers || []).map(a =>
                          a.id === answer.id ? { ...a, action: e.target.value || undefined } : a
                        )
                        onUpdateNodeAnswers(selectedNode.id, updatedAnswers)
                      }}
                      className="bg-gray-600 border-gray-500 text-white focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Assembly.Namespace.Class.Method"
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

        {/* Connections Section */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-gray-300">Connections</label>
            <Badge variant="secondary" className="bg-purple-600 text-purple-100">
              {connections.filter(c => c.from.nodeId === selectedNode.id || c.to.nodeId === selectedNode.id).length} connections
            </Badge>
          </div>

          <div className="space-y-3">
            {/* Outgoing Connections (Green) */}
            {connections
              .filter(connection => connection.from.nodeId === selectedNode.id)
              .map(connection => {
                const targetNode = nodes?.find(node => node.id === connection.to.nodeId)
                return (
                  <div key={connection.id} className="bg-gray-700 p-3 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-200">Outgoing</span>
                      </div>
                      <Badge variant="outline" className="text-xs border-green-500 text-green-300">
                        To: {targetNode?.title || 'Unknown Node'}
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      Connection ID: {connection.id}
                    </div>
                  </div>
                )
              })}

            {/* Incoming Connections (Red) */}
            {connections
              .filter(connection => connection.to.nodeId === selectedNode.id)
              .map(connection => {
                const sourceNode = nodes?.find(node => node.id === connection.from.nodeId)
                return (
                  <div key={connection.id} className="bg-gray-700 p-3 rounded-lg border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-200">Incoming</span>
                      </div>
                      <Badge variant="outline" className="text-xs border-red-500 text-red-300">
                        From: {sourceNode?.title || 'Unknown Node'}
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      Connection ID: {connection.id}
                    </div>
                  </div>
                )
              })}

            {/* No Connections Message */}
            {connections.filter(c => c.from.nodeId === selectedNode.id || c.to.nodeId === selectedNode.id).length === 0 && (
              <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 text-center">
                <div className="text-gray-400 text-sm">
                  No connections found for this node
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Node Button */}
        <Button
          variant="destructive"
          onClick={() => onDeleteNode?.(selectedNode.id)}
          className="w-full border bg-gray-700 border-red-500 hover:bg-red-700 text-white h-15 flex items-center justify-center flex-col"
        >
          <div className="flex flex-col gap-1">
            <div className="flex flex-row items-center justify-center gap-2">
              <Trash2 className="h-4 w-4 translate-y-[-1px]" />
              <span className="font-medium">Delete Node</span>
            </div>
          </div>
          <span className="text-xs text-gray-300 w-11/12 text-wrap">This action is irreversible and will delete all connections to this node</span>
        </Button>
      </div>
    </div>
  )
} 