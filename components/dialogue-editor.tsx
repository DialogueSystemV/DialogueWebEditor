"use client"

import React from "react"
import { useDialogueEditor } from "@/hooks/use-dialogue-editor"
import { DialogueCanvas } from "./dialogue-canvas"
import { DialogueToolbar } from "./dialogue-toolbar"
import { DialogueProperties } from "./dialogue-properties"

export function DialogueEditor() {
  const {
    nodes,
    connections,
    selectedNode,
    connecting,
    removing,
    firstLinkClick,
    isPanning,
    panOffset,
    zoom,
    canvasRef,
    handleNodeMouseDown,
    handleCanvasMouseDown,
    handleNodeClick,
    addNode,
    deleteNode,
    deleteConnection,
    updateNodeData,
    updateNodeAnswers,
    startConnecting,
    cancelConnecting,
    cancelRemoving,
  } = useDialogueEditor()

  const selectedNodeData = selectedNode ? nodes.find((n) => n.id === selectedNode) : null

  return (
    <div className="h-full w-full bg-gray-900 flex">
      {/* Main Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <DialogueCanvas
          nodes={nodes}
          connections={connections}
          selectedNode={selectedNode}
          connecting={connecting}
          firstLinkClick={firstLinkClick}
          isPanning={isPanning}
          panOffset={panOffset}
          zoom={zoom}
          canvasRef={canvasRef}
          onNodeMouseDown={handleNodeMouseDown}
          onCanvasMouseDown={handleCanvasMouseDown}
          onNodeClick={handleNodeClick}
          onNodeDelete={deleteNode}
          onStartConnecting={startConnecting}
        />

        <DialogueToolbar
          onAddNode={addNode}
          nodes={nodes} 
          connections={connections}
          connecting={connecting}
          removing={removing}
          onCancelConnecting={cancelConnecting}
          onCancelRemoving={cancelRemoving}
        />
      </div>

      {/* Properties Panel */}
      {selectedNodeData && (
        <DialogueProperties
          selectedNode={selectedNodeData}
          nodes={nodes}
          onUpdateNodeData={updateNodeData}
          onUpdateNodeAnswers={updateNodeAnswers}
        />
      )}
    </div>
  )
}

