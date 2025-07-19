"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, X, HelpCircle, MousePointer, MousePointer2, ZoomIn, Link, Unlink, Move } from "lucide-react"
import { Connection, NodeData, nodeTypes, type NodeType } from "@/types/dialogue"
import { toast, Toaster } from "sonner"

interface DialogueToolbarProps {
  onAddNode: (type: NodeType) => void
  nodes: NodeData[]
  connections: Connection[]
  connecting: { nodeId: string } | null
  removing: { nodeId: string } | null
  onCancelConnecting: () => void
  onCancelRemoving: () => void
}

export function DialogueToolbar({
  onAddNode,
  nodes,
  connections,
  connecting,
  removing,
  onCancelConnecting,
  onCancelRemoving
}: DialogueToolbarProps) {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <>
      <Toaster position="top-center" theme="dark" />
      <div className="absolute top-4 left-4 flex space-x-2">
        {Object.entries(nodeTypes).map(([type, config]) => (
          <Button
            key={type}
            variant="secondary"
            size="sm"
            onClick={() => onAddNode(type as NodeType)}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            {config.title}
          </Button>
        ))}

        <Button onClick={() => {
          var allData = {
            nodes: nodes,
            connections: connections
          }
          const json = JSON.stringify(allData, null, 2)
          const blob = new Blob([json], { type: "application/json" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = "dialogue.json"
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }}
          variant="secondary"
          size="sm"
          className="bg-gray-700 hover:bg-gray-600 text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          Export
        </Button>
        <Button
          variant="secondary"
          disabled
          size="sm"
          className="bg-gray-700 hover:bg-gray-600 text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          Import
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowHelp(!showHelp)}
          className="bg-gray-700 hover:bg-gray-600 text-white"
        >
          <HelpCircle className="h-4 w-4 mr-1" />
          Help
        </Button>

        {connecting && (
          <div className="flex items-center space-x-2 bg-green-900/50 px-3 py-1 rounded-md border border-green-500">
            <span className="text-green-300 text-sm">Click link button on target node to connect</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelConnecting}
              className="h-6 w-6 p-0 text-green-300 hover:text-green-200"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {removing && (
          <div className="flex items-center space-x-2 bg-red-900/50 px-3 py-1 rounded-md border border-red-500">
            <span className="text-red-300 text-sm">Right click on target node to remove connections</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelRemoving}
              className="h-6 w-6 p-0 text-red-300 hover:text-red-200"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="absolute top-4 right-4 bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md text-white shadow-xl z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-blue-400" />
              Quick Guide
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowHelp(false)}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Connection Legend */}
            <div className="bg-gray-750 rounded-lg p-3 border border-gray-600">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Connection Colors</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Green dot = Connection starts from this node</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Red dot = Connection goes to this node</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-750 rounded-lg p-3 border border-gray-600">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Controls</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 bg-gray-700 px-2 py-1 rounded text-xs">
                    <span className="text-gray-400 text-sm">Alt</span>
                    <span className="text-gray-300 text-sm">+</span>
                    <MousePointer className="h-4 w-4 text-gray-300" />
                  </div>
                  <div className="mt-1 flex flex-col">
                    <span className="text-base">Pan canvas</span>
                    <span className="text-sm text-gray-400">Alt + Left click + drag</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-gray-700 px-2 py-1 rounded text-xs">
                    <ZoomIn className="h-4 w-4 text-gray-300" />
                  </div>
                  <div className="mt-1 flex flex-col">
                    <span className="text-base">Zoom in/out</span>
                    <span className="text-sm text-gray-400">Mouse wheel</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-gray-700 px-2 py-1 rounded text-xs">
                    <MousePointer2 className="h-4 w-4 text-gray-300" />
                  </div>
                  <div className="mt-1 flex flex-col">
                    <span className="text-base">Select node</span>
                    <span className="text-sm text-gray-400">Left click</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-gray-700 px-2 py-1 rounded text-xs">
                    <Move className="h-4 w-4 text-gray-300" />
                  </div>
                  <div className="mt-1 flex flex-col">
                    <span className="text-base">Drag node</span>
                    <span className="text-sm text-gray-400">Left click + drag</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-gray-700 px-2 py-1 rounded text-xs">
                    <Link className="h-4 w-4 text-gray-300" />
                  </div>
                  <div className="mt-1 flex flex-col">
                    <span className="text-base">Create connection</span>
                    <span className="text-sm text-gray-400">Left click the link button on the source node, then left click the link button on the target node</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-gray-700 px-2 py-1 rounded text-xs">
                    <Unlink className="h-4 w-4 text-gray-300" />
                  </div>
                  <div className="mt-1 flex flex-col">
                    <span className="text-base">Remove connection </span>
                    <span className="text-sm text-gray-400">Right click on source node, then right click on target node</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 