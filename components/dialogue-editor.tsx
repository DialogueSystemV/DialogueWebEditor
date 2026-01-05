"use client"

import React from "react"
import { DialogueProvider, useDialogueContext } from "@/contexts/dialogue-context"
import { DialogueCanvas } from "./dialogue-canvas"
import { DialogueToolbar } from "./dialogue-toolbar"
import { DialogueProperties } from "./dialogue-properties"

function DialogueEditorContent() {
  const { nodes, selectedNode } = useDialogueContext()
  const selectedNodeData = selectedNode ? nodes.find((n) => n.id === selectedNode) : null
  
  // Get canvas/interaction handlers from context (but pass as props)
  const {
    connecting,
    removing,
    firstLinkClick,
    isPanning,
    panOffset,
    zoom,
    canvasRef,
    draggedNode,
    handleNodeMouseDown,
    handleCanvasMouseDown,
    handleNodeClick,
    startConnecting,
    cancelConnecting,
    cancelRemoving,
    cloneNode,
  } = useDialogueContext()

  return (
    <div className="h-full w-full bg-gray-900 flex">
      {/* Main Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <DialogueCanvas
          connecting={connecting}
          firstLinkClick={firstLinkClick}
          isPanning={isPanning}
          panOffset={panOffset}
          zoom={zoom}
          canvasRef={canvasRef}
          draggedNode={draggedNode}
          handleNodeMouseDown={handleNodeMouseDown}
          handleCanvasMouseDown={handleCanvasMouseDown}
          handleNodeClick={handleNodeClick}
          startConnecting={startConnecting}
          cloneNode={cloneNode}
        />
        <DialogueToolbar
          connecting={connecting}
          removing={removing}
          cancelConnecting={cancelConnecting}
          cancelRemoving={cancelRemoving}
        />
      </div>

      {/* Properties Panel */}
      {selectedNodeData && !draggedNode && (
        <DialogueProperties />
      )}
    </div>
  )
}

export function DialogueEditor() {
  return (
    <DialogueProvider>
      <DialogueEditorContent />
    </DialogueProvider>
  )
}

