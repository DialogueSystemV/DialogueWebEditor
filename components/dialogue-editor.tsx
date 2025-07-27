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
    cloneNode,
    deleteConnection,
    updateNodeData,
    updateNodeAnswers,
    startConnecting,
    cancelConnecting,
    cancelRemoving,
    loadNodesAndConnections,
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
          onStartConnecting={startConnecting}
          onCloneNode={cloneNode}
        />

        <DialogueToolbar
          onAddNode={addNode}
          nodes={nodes} 
          connections={connections}
          connecting={connecting}
          removing={removing}
          onCancelConnecting={cancelConnecting}
          onCancelRemoving={cancelRemoving}
          onLoadData={loadNodesAndConnections}
        />
      </div>

      {/* Properties Panel */}
      {selectedNodeData && (
        <DialogueProperties
          selectedNode={selectedNodeData}
          nodes={nodes}
          connections={connections}
          onUpdateNodeData={updateNodeData}
          onUpdateNodeAnswers={updateNodeAnswers}
          onDeleteNode={deleteNode}
        />
      )}
    </div>
  )
}

