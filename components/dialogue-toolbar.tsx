"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import { nodeTypes, type NodeType } from "@/types/dialogue"
import { Toaster } from "sonner"

interface DialogueToolbarProps {
  onAddNode: (type: NodeType) => void
  connecting: { nodeId: string } | null
  removing: { nodeId: string } | null
  onCancelConnecting: () => void
  onCancelRemoving: () => void
}

export function DialogueToolbar({ 
  onAddNode, 
  connecting, 
  removing, 
  onCancelConnecting, 
  onCancelRemoving 
}: DialogueToolbarProps) {
  return (
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
      
      {connecting && (
        <div className="flex items-center space-x-2 bg-green-900/50 px-3 py-1 rounded-md border border-green-500">
          <span className="text-green-300 text-sm">Connecting...</span>
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
          <span className="text-red-300 text-sm">Removing...</span>
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
  )
} 