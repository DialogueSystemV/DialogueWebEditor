import { useState, useRef, useCallback, useEffect } from "react"
import type { NodeData, Connection, Answer, NodeType } from "@/types/dialogue"
import { toast } from "sonner"

export function useDialogueEditor() {
  const [nodes, setNodes] = useState<NodeData[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [connecting, setConnecting] = useState<{ nodeId: string } | null>(null)
  const [removing, setRemoving] = useState<{ nodeId: string } | null>(null)
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

  const addNode = (type: NodeType) => {
    const newNode: NodeData = {
      id: Date.now().toString(),
      title: "Question Node",
      position: { x: 200, y: 200 },
      data: {
        answers: type === "question" ? [] : undefined,
      },
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

  const updateNodeAnswers = (nodeId: string, answers: Answer[]) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, answers } } : node)),
    )
  }

  const createConnection = (fromNodeId: string, toNodeId: string) => {
    const connectionExists = connections.some((node) => (node.from.nodeId === fromNodeId && node.to.nodeId === toNodeId))
    if (connectionExists) {
      toast.error("Connection already exists")
      return
    }
    const connection: Connection = {
      id: Date.now().toString(),
      from: { nodeId: fromNodeId },
      to: { nodeId: toNodeId },
    }
    setConnections((prev) => [...prev, connection])
  }

  const deleteConnection = (connectionId: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== connectionId))
  }

  const handleNodeClick = (nodeId: string, isRightClick: boolean = false) => {
    if (isRightClick) {
      if (removing) {
        // Find and remove connection to this node
        const connectionToRemove = connections.find((c) => c.to.nodeId === nodeId)
        if (connectionToRemove) {
          deleteConnection(connectionToRemove.id)
          toast.success("Connection removed")
        }
        setRemoving(null)
        return
      } else {
        // Start removal mode
        setRemoving({ nodeId })
        return
      }
    }

    if (connecting) {
      createConnection(connecting.nodeId, nodeId)
      console.log(connections.length)
      setConnecting(null)
    } else {
      setSelectedNode(nodeId)
    }
  }

  const startConnecting = (nodeId: string) => {
    setConnecting({ nodeId })
  }

  const cancelConnecting = () => {
    setConnecting(null)
  }

  const cancelRemoving = () => {
    setRemoving(null)
  }

  return {
    nodes,
    connections,
    selectedNode,
    connecting,
    removing,
    canvasRef,
    handleNodeMouseDown,
    handleNodeClick,
    addNode,
    deleteNode,
    deleteConnection,
    updateNodeData,
    updateNodeAnswers,
    startConnecting,
    cancelConnecting,
    cancelRemoving,
  }
} 