import { useState, useRef, useCallback, useEffect } from "react"
import type { NodeData, Connection, Answer, NodeType } from "@/types/dialogue"
import { toast } from "sonner"

export function useDialogueEditor() {
  const [nodes, setNodes] = useState<NodeData[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [dragGhost, setDragGhost] = useState<{ nodeId: string | null; x: number; y: number }>({ nodeId: null, x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [connecting, setConnecting] = useState<{ nodeId: string } | null>(null)
  const [removing, setRemoving] = useState<{ nodeId: string } | null>(null)
  const [firstLinkClick, setFirstLinkClick] = useState<string | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [lastPanPosition, setLastPanPosition] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const canvasRef = useRef<HTMLDivElement>(null)
  const rafIdRef = useRef<number | null>(null)
  const lastUpdateTimeRef = useRef<number>(0)
  // Refs to avoid stale closures and to enable rAF-coalesced updates
  const draggedNodeRef = useRef<string | null>(null)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const isPanningRef = useRef(false)
  const panOffsetRef = useRef({ x: 0, y: 0 })
  const lastPanPositionRef = useRef({ x: 0, y: 0 })
  const zoomRef = useRef(1)
  const pendingMouseRef = useRef<{ x: number; y: number } | null>(null)

  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      if (e.button !== 0) return
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return

      const rect = e.currentTarget.getBoundingClientRect()
      setDragOffset({
        x: (e.clientX - rect.left) / zoom,
        y: (e.clientY - rect.top) / zoom,
      })
      setDraggedNode(nodeId)
      // sync refs
      dragOffsetRef.current = {
        x: (e.clientX - rect.left) / zoom,
        y: (e.clientY - rect.top) / zoom,
      }
      draggedNodeRef.current = nodeId
      // initialize ghost at current node position
      setDragGhost({ nodeId, x: node.position.x, y: node.position.y })
    },
    [nodes, zoom],
  )

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) { // Middle mouse or Alt+Left click
      e.preventDefault()
      e.stopPropagation()
      setIsPanning(true)
      setSelectedNode(null)
      setLastPanPosition({ x: e.clientX, y: e.clientY })
      // sync refs
      isPanningRef.current = true
      lastPanPositionRef.current = { x: e.clientX, y: e.clientY }
    }
  }, [])

  // rAF-coalesced move processing
  const processMove = useCallback(() => {
    rafIdRef.current = null
    const coords = pendingMouseRef.current
    if (!coords) return

    if (isPanningRef.current) {
      const deltaX = coords.x - lastPanPositionRef.current.x
      const deltaY = coords.y - lastPanPositionRef.current.y
      setPanOffset(prev => {
        const next = { x: prev.x + deltaX, y: prev.y + deltaY }
        panOffsetRef.current = next
        return next
      })
      const nextLast = { x: coords.x, y: coords.y }
      setLastPanPosition(nextLast)
      lastPanPositionRef.current = nextLast
    } else if (draggedNodeRef.current && canvasRef.current) {
      // Update lightweight ghost only (no node state updates)
      const canvasRect = canvasRef.current.getBoundingClientRect()
      const newX = (coords.x - canvasRect.left - dragOffsetRef.current.x * zoomRef.current - panOffsetRef.current.x) / zoomRef.current
      const newY = (coords.y - canvasRect.top - dragOffsetRef.current.y * zoomRef.current - panOffsetRef.current.y) / zoomRef.current
      setDragGhost({ nodeId: draggedNodeRef.current, x: newX, y: newY })
    }
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    pendingMouseRef.current = { x: e.clientX, y: e.clientY }
    if (rafIdRef.current == null) {
      rafIdRef.current = requestAnimationFrame(processMove)
    }
  }, [processMove])

  const handleMouseUp = useCallback((e: MouseEvent) => {
    // Commit final node position on mouseup (if dragging)
    if (draggedNodeRef.current && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect()
      const clientX = e.clientX
      const clientY = e.clientY
      const finalX = (clientX - canvasRect.left - dragOffsetRef.current.x * zoomRef.current - panOffsetRef.current.x) / zoomRef.current
      const finalY = (clientY - canvasRect.top - dragOffsetRef.current.y * zoomRef.current - panOffsetRef.current.y) / zoomRef.current
      const targetId = draggedNodeRef.current
      setNodes((prev) =>
        prev.map((node) => (node.id === targetId ? { ...node, position: { x: finalX, y: finalY } } : node)),
      )
    }
    setDraggedNode(null)
    setIsPanning(false)
    // sync refs
    draggedNodeRef.current = null
    isPanningRef.current = false
    // clear ghost
    setDragGhost({ nodeId: null, x: 0, y: 0 })
  }, [])

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    
    const zoomSpeed = 0.05
    const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed
    const newZoom = Math.max(0.1, Math.min(3, zoom + delta))
    
    // Simplified zoom to cursor calculation
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      
      // Simple zoom to cursor
      const zoomRatio = newZoom / zoom
      setPanOffset(prev => ({
        x: mouseX - (mouseX - prev.x) * zoomRatio,
        y: mouseY - (mouseY - prev.y) * zoomRatio
      }))
    }
    setSelectedNode(null)
    setZoom(newZoom)
    // sync refs
    zoomRef.current = newZoom
  }, [zoom])

  // Toolbar zoom controls (zoom around canvas center)
  const zoomBy = useCallback((delta: number) => {
    const currentZoom = zoomRef.current
    const newZoom = Math.max(0.1, Math.min(3, currentZoom + delta))
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const cx = rect.width / 2
      const cy = rect.height / 2
      const zoomRatio = newZoom / currentZoom
      setPanOffset(prev => ({
        x: cx - (cx - prev.x) * zoomRatio,
        y: cy - (cy - prev.y) * zoomRatio
      }))
    }
    setZoom(newZoom)
    zoomRef.current = newZoom
  }, [])

  const zoomIn = useCallback(() => zoomBy(0.1), [zoomBy])
  const zoomOut = useCallback(() => zoomBy(-0.1), [zoomBy])
  const resetZoom = useCallback(() => {
    const currentZoom = zoomRef.current
    const newZoom = 1
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const cx = rect.width / 2
      const cy = rect.height / 2
      const zoomRatio = newZoom / currentZoom
      setPanOffset(prev => ({
        x: cx - (cx - prev.x) * zoomRatio,
        y: cy - (cy - prev.y) * zoomRatio
      }))
    }
    setZoom(newZoom)
    zoomRef.current = newZoom
  }, [])

  useEffect(() => {
    if (draggedNode || isPanning) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [draggedNode, isPanning, handleMouseMove, handleMouseUp])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false })
      return () => canvas.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel])

  // Keep refs in sync with state that are read in rAF
  useEffect(() => { panOffsetRef.current = panOffset }, [panOffset])
  useEffect(() => { zoomRef.current = zoom }, [zoom])
  useEffect(() => { isPanningRef.current = isPanning }, [isPanning])
  useEffect(() => { draggedNodeRef.current = draggedNode }, [draggedNode])
  useEffect(() => { dragOffsetRef.current = dragOffset }, [dragOffset])
  useEffect(() => { lastPanPositionRef.current = lastPanPosition }, [lastPanPosition])

  // Handle page exit warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Always show warning when user tries to leave
      e.preventDefault()
      toast.error('The editor WILL NOT save your changes. Please export before leaving.')
      e.returnValue = '' // This triggers the browser's confirmation dialog
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  const addNode = (type: NodeType) => {
    const newNode: NodeData = {
      id: Date.now().toString(),
      title: "Question Node",
      position: { 
        x: (window.innerWidth / 3 + (Math.random() * 50 - 25) - panOffset.x) / zoom,
        y: (window.innerHeight / 3 + (Math.random() * 50 - 25) - panOffset.y) / zoom
      },
      removeQuestionAfterAsked: false,
      startsConversation: false,
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

  const cloneNode = (nodeId: string) => {
    const originalNode = nodes.find((n) => n.id === nodeId)
    if (!originalNode) return

    // Create a deep copy of the node data, including consequences
    const clonedNode: NodeData = {
      ...originalNode,
      id: Date.now().toString(),
      title: `${originalNode.title} (Copy)`,
      position: {
        x: originalNode.position.x + 50,
        y: originalNode.position.y + 50,
      },
      data: {
        ...originalNode.data,
        answers: originalNode.data.answers?.map((answer, index) => ({
          ...answer,
          id: (Date.now() + index).toString() + Math.random().toString(36).substr(2, 9),
          // Clone consequences if they exist
          consequences: undefined
        }))
      }
    }

    setNodes((prev) => [...prev, clonedNode])
    setSelectedNode(clonedNode.id)
    toast.success("Node cloned successfully")
  }

  const updateNodeData = (nodeId: string, field: string, value: any) => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id === nodeId) {
          // Handle top-level properties
          if (field === "title" || field === "startsConversation" || field === "removeQuestionAfterAsked") {
            return { ...node, [field]: value }
          }
          // Handle data properties
          return { ...node, data: { ...node.data, [field]: value } }
        }
        return node
      }),
    )
  }

  const updateNodeAnswers = (nodeId: string, answers: Answer[]) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, answers } } : node)),
    )
  }

  const createConnection = (fromNodeId: string, toNodeId: string) => {
    if(nodes.find((node) => node.id === toNodeId)?.startsConversation) {
      toast.error("Cannot connect to a node that starts a conversation")
      return
    }
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

    // Only select the node, connections are now handled through link button clicks
    setSelectedNode(nodeId)
  }

  const startConnecting = (nodeId: string) => {
    if (firstLinkClick === null) {
      // First click - store the node and enter connecting mode
      setFirstLinkClick(nodeId)
      setConnecting({ nodeId })
    } else if (firstLinkClick === nodeId) {
      // Second click on the same node - cancel the connection
      setFirstLinkClick(null)
      setConnecting(null)
    } else {
      // Second click on a different node - create the connection
      createConnection(firstLinkClick, nodeId)
      setFirstLinkClick(null)
      setConnecting(null)
    }
  }

  const cancelConnecting = () => {
    setConnecting(null)
    setFirstLinkClick(null)
  }

  const cancelRemoving = () => {
    setRemoving(null)
  }

  const loadNodesAndConnections = (newNodes: NodeData[], newConnections: Connection[]) => {
    // Find a node to center on, defaulting to first node
    const centerNode = newNodes[0]
    if (centerNode) {
      // Center the canvas on this node's position
      setPanOffset({
        x: -(centerNode.position.x || 0),
        y: -(centerNode.position.y || 0)
      })
    }
    
    setNodes(newNodes)
    setConnections(newConnections)
    setSelectedNode(null) // Clear selection when loading new data
  }

  return {
    nodes,
    connections,
    selectedNode,
    draggedNode,
    dragGhost,
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
    zoomIn,
    zoomOut,
    resetZoom,
  }
} 