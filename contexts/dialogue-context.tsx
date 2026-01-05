"use client"

import React, { createContext, useContext, ReactNode } from "react"
import { useDialogueEditor } from "@/hooks/use-dialogue-editor"

// Only expose essential shared state in the type
// Canvas/interaction handlers are available but passed as props
interface DialogueContextValue {
  // Core data
  nodes: ReturnType<typeof useDialogueEditor>["nodes"]
  connections: ReturnType<typeof useDialogueEditor>["connections"]
  selectedNode: ReturnType<typeof useDialogueEditor>["selectedNode"]
  draggedNode: ReturnType<typeof useDialogueEditor>["draggedNode"]
  dragGhost: ReturnType<typeof useDialogueEditor>["dragGhost"]
  // Data mutations
  updateNodeData: ReturnType<typeof useDialogueEditor>["updateNodeData"]
  updateNodeAnswers: ReturnType<typeof useDialogueEditor>["updateNodeAnswers"]
  addNode: ReturnType<typeof useDialogueEditor>["addNode"]
  deleteNode: ReturnType<typeof useDialogueEditor>["deleteNode"]
  loadNodesAndConnections: ReturnType<typeof useDialogueEditor>["loadNodesAndConnections"]
  // Canvas/interaction handlers (available but typically passed as props)
  connecting: ReturnType<typeof useDialogueEditor>["connecting"]
  removing: ReturnType<typeof useDialogueEditor>["removing"]
  firstLinkClick: ReturnType<typeof useDialogueEditor>["firstLinkClick"]
  isPanning: ReturnType<typeof useDialogueEditor>["isPanning"]
  panOffset: ReturnType<typeof useDialogueEditor>["panOffset"]
  zoom: ReturnType<typeof useDialogueEditor>["zoom"]
  canvasRef: ReturnType<typeof useDialogueEditor>["canvasRef"]
  handleNodeMouseDown: ReturnType<typeof useDialogueEditor>["handleNodeMouseDown"]
  handleCanvasMouseDown: ReturnType<typeof useDialogueEditor>["handleCanvasMouseDown"]
  handleNodeClick: ReturnType<typeof useDialogueEditor>["handleNodeClick"]
  startConnecting: ReturnType<typeof useDialogueEditor>["startConnecting"]
  cancelConnecting: ReturnType<typeof useDialogueEditor>["cancelConnecting"]
  cancelRemoving: ReturnType<typeof useDialogueEditor>["cancelRemoving"]
  cloneNode: ReturnType<typeof useDialogueEditor>["cloneNode"]
  zoomIn: ReturnType<typeof useDialogueEditor>["zoomIn"]
  zoomOut: ReturnType<typeof useDialogueEditor>["zoomOut"]
  resetZoom: ReturnType<typeof useDialogueEditor>["resetZoom"]
}

const DialogueContext = createContext<DialogueContextValue | undefined>(undefined)

export function DialogueProvider({ children }: { children: ReactNode }) {
  const dialogueEditor = useDialogueEditor()

  return (
    <DialogueContext.Provider value={dialogueEditor}>
      {children}
    </DialogueContext.Provider>
  )
}

export function useDialogueContext() {
  const context = useContext(DialogueContext)
  if (context === undefined) {
    throw new Error("useDialogueContext must be used within a DialogueProvider")
  }
  return context
}

