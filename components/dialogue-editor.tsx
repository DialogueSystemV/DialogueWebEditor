"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Play, Square } from "lucide-react"

interface NodeData {
  id: string
  type: "dialogue" | "conversation" | "quest" | "condition" | "action"
  title: string
  position: { x: number; y: number }
  data: {
    actor?: string
    dialogueText?: string
    sequence?: number
    conditions?: string[]
    actions?: string[]
    questName?: string
    status?: string
  }
  inputs: string[]
  outputs: string[]
}

interface Connection {
  id: string
  from: { nodeId: string; output: string }
  to: { nodeId: string; input: string }
}

const nodeTypes = {
  dialogue: { color: "bg-emerald-600", title: "Dialogue Entry" },
  conversation: { color: "bg-blue-600", title: "Conversation" },
  quest: { color: "bg-orange-600", title: "Quest Tracker" },
  condition: { color: "bg-purple-600", title: "Condition" },
  action: { color: "bg-pink-600", title: "Action" },
}

export function DialogueEditor() {
  const [nodes, setNodes] = useState<NodeData[]>([
    {
      id: "1",
      type: "conversation",
      title: "Start Conversation",
      position: { x: 100, y: 100 },
      data: { actor: "Player", sequence: 0 },
      inputs: [],
      outputs: ["output1"],
    },
    {
      id: "2",
      type: "dialogue",
      title: "Dialogue Entry",
      position: { x: 400, y: 150 },
      data: {
        actor: "NPC_Guard",
        dialogueText: "Hello there, traveler. What brings you to our town?",
        sequence: 1,
      },
      inputs: ["input1"],
      outputs: ["output1", "output2"],
    },
    {
      id: "3",
      type: "dialogue",
      title: "Player Response",
      position: { x: 700, y: 100 },
      data: {
        actor: "Player",
        dialogueText: "I'm just passing through.",
        sequence: 2,
      },
      inputs: ["input1"],
      outputs: ["output1"],
    },
    {
      id: "4",
      type: "quest",
      title: "Quest Check",
      position: { x: 700, y: 250 },
      data: {
        questName: "Find the Lost Artifact",
        status: "Active",
      },
      inputs: ["input1"],
      outputs: ["output1", "output2"],
    },
  ])

  const [connections, setConnections] = useState<Connection[]>([
    {
      id: "conn1",
      from: { nodeId: "1", output: "output1" },
      to: { nodeId: "2", input: "input1" },
    },
    {
      id: "conn2",
      from: { nodeId: "2", output: "output1" },
      to: { nodeId: "3", input: "input1" },
    },
    {
      id: "conn3",
      from: { nodeId: "2", output: "output2" },
      to: { nodeId: "4", input: "input1" },
    },
  ])

  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [connecting, setConnecting] = useState<{ nodeId: string; output: string } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      if (e.button !== 0) return

      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return

      const rect = e.currentTarget.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setDraggedNode(nodeId)
      setSelectedNode(nodeId)
    },
    [nodes],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggedNode || !canvasRef.current) return

      const canvasRect = canvasRef.current.getBoundingClientRect()
      const newX = e.clientX - canvasRect.left - dragOffset.x
      const newY = e.clientY - canvasRect.top - dragOffset.y

      setNodes((prev) =>
        prev.map((node) => (node.id === draggedNode ? { ...node, position: { x: newX, y: newY } } : node)),
      )
    },
    [draggedNode, dragOffset],
  )

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null)
  }, [])

  useEffect(() => {
    if (draggedNode) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [draggedNode, handleMouseMove, handleMouseUp])

  const addNode = (type: keyof typeof nodeTypes) => {
    const newNode: NodeData = {
      id: Date.now().toString(),
      type,
      title: nodeTypes[type].title,
      position: { x: 200, y: 200 },
      data: {},
      inputs: type === "conversation" ? [] : ["input1"],
      outputs: ["output1"],
    }
    setNodes((prev) => [...prev, newNode])
  }

  const deleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId))
    setConnections((prev) => prev.filter((c) => c.from.nodeId !== nodeId && c.to.nodeId !== nodeId))
    if (selectedNode === nodeId) {
      setSelectedNode(null)
    }
  }

  const updateNodeData = (nodeId: string, field: string, value: any) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, [field]: value } } : node)),
    )
  }

  const getConnectionPath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const dx = to.x - from.x
    const dy = to.y - from.y
    const controlPoint1X = from.x + dx * 0.5
    const controlPoint2X = to.x - dx * 0.5

    return `M ${from.x} ${from.y} C ${controlPoint1X} ${from.y} ${controlPoint2X} ${to.y} ${to.x} ${to.y}`
  }

  const selectedNodeData = selectedNode ? nodes.find((n) => n.id === selectedNode) : null

  return (
    <div className="h-full w-full bg-gray-900 flex">
      {/* Main Canvas */}
      <div className="flex-1 relative overflow-hidden">
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
                y: fromNode.position.y + 60,
              }
              const toPos = {
                x: toNode.position.x,
                y: toNode.position.y + 60,
              }

              return (
                <path
                  key={connection.id}
                  d={getConnectionPath(fromPos, toPos)}
                  stroke="#10b981"
                  strokeWidth="2"
                  fill="none"
                />
              )
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <Card
              key={node.id}
              className={`absolute w-72 bg-gray-700 border-gray-600 cursor-move ${
                selectedNode === node.id ? "ring-2 ring-blue-500" : ""
              }`}
              style={{
                left: node.position.x,
                top: node.position.y,
                userSelect: "none",
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
            >
              {/* Node Header */}
              <div className={`${nodeTypes[node.type].color} px-3 py-2 rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium text-sm">{node.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-white hover:bg-white/20"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNode(node.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Node Content */}
              <div className="p-3 space-y-2">
                {node.data.actor && (
                  <div className="text-xs text-gray-300">
                    Actor:{" "}
                    <Badge variant="secondary" className="text-xs">
                      {node.data.actor}
                    </Badge>
                  </div>
                )}

                {node.data.sequence !== undefined && (
                  <div className="text-xs text-gray-300">Sequence: {node.data.sequence}</div>
                )}

                {node.data.dialogueText && (
                  <div className="text-xs text-gray-300 bg-gray-800 p-2 rounded">{node.data.dialogueText}</div>
                )}

                {node.data.questName && (
                  <div className="text-xs text-gray-300">
                    Quest:{" "}
                    <Badge variant="outline" className="text-xs">
                      {node.data.questName}
                    </Badge>
                  </div>
                )}

                {node.data.status && (
                  <div className="text-xs text-gray-300">
                    Status:{" "}
                    <Badge variant="default" className="text-xs">
                      {node.data.status}
                    </Badge>
                  </div>
                )}

                {/* Connection Points */}
                <div className="flex justify-between items-center pt-2">
                  <div className="flex space-x-1">
                    {node.inputs.map((input, idx) => (
                      <div key={input} className="w-3 h-3 bg-gray-500 rounded-full border-2 border-gray-400" />
                    ))}
                  </div>
                  <div className="flex space-x-1">
                    {node.outputs.map((output, idx) => (
                      <div key={output} className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-emerald-400" />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className="absolute top-4 left-4 flex space-x-2">
          {Object.entries(nodeTypes).map(([type, config]) => (
            <Button
              key={type}
              variant="secondary"
              size="sm"
              onClick={() => addNode(type as keyof typeof nodeTypes)}
              className="bg-gray-700 hover:bg-gray-600 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              {config.title}
            </Button>
          ))}
        </div>
      </div>

      {/* Properties Panel */}
      {selectedNodeData && (
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
          <h3 className="text-white font-medium mb-4">Node Properties</h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 block mb-1">Title</label>
              <Input
                value={selectedNodeData.title}
                onChange={(e) => updateNodeData(selectedNodeData.id, "title", e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            {selectedNodeData.type === "dialogue" && (
              <>
                <div>
                  <label className="text-sm text-gray-300 block mb-1">Actor</label>
                  <Select
                    value={selectedNodeData.data.actor || ""}
                    onValueChange={(value) => updateNodeData(selectedNodeData.id, "actor", value)}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select actor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Player">Player</SelectItem>
                      <SelectItem value="NPC_Guard">NPC Guard</SelectItem>
                      <SelectItem value="NPC_Merchant">NPC Merchant</SelectItem>
                      <SelectItem value="NPC_Villager">NPC Villager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-gray-300 block mb-1">Dialogue Text</label>
                  <Textarea
                    value={selectedNodeData.data.dialogueText || ""}
                    onChange={(e) => updateNodeData(selectedNodeData.id, "dialogueText", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300 block mb-1">Sequence</label>
                  <Input
                    type="number"
                    value={selectedNodeData.data.sequence || 0}
                    onChange={(e) => updateNodeData(selectedNodeData.id, "sequence", Number.parseInt(e.target.value))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </>
            )}

            {selectedNodeData.type === "quest" && (
              <>
                <div>
                  <label className="text-sm text-gray-300 block mb-1">Quest Name</label>
                  <Input
                    value={selectedNodeData.data.questName || ""}
                    onChange={(e) => updateNodeData(selectedNodeData.id, "questName", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300 block mb-1">Status</label>
                  <Select
                    value={selectedNodeData.data.status || ""}
                    onValueChange={(value) => updateNodeData(selectedNodeData.id, "status", value)}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

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
      )}
    </div>
  )
}
