"use client"

import React, { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, X, HelpCircle, MousePointer, MousePointer2, ZoomIn, Link, Unlink, Move, CopyPlus } from "lucide-react"
import { Connection, NodeData, nodeTypes, type NodeType } from "@/types/dialogue"
import { toast, Toaster } from "sonner"
import { Input } from "./ui/input"

interface DialogueToolbarProps {
  onAddNode: (type: NodeType) => void
  nodes: NodeData[]
  connections: Connection[]
  connecting: { nodeId: string } | null
  removing: { nodeId: string } | null
  onCancelConnecting: () => void
  onCancelRemoving: () => void
  onLoadData: (nodes: NodeData[], connections: Connection[]) => void
}

export function DialogueToolbar({
  onAddNode,
  nodes,
  connections,
  connecting,
  removing,
  onCancelConnecting,
  onCancelRemoving,
  onLoadData
}: DialogueToolbarProps) {
  const [showHelp, setShowHelp] = useState(false)
  const [helpPage, setHelpPage] = useState(0); // 0: controls, 1: directions
  const fileInputRef = useRef<HTMLInputElement>(null);

  function exportDialogue() {
    // Extract consequences from all answers
    const allConsequences: any[] = []
    
    nodes.forEach(node => {
      if (node.data.answers) {
        node.data.answers.forEach(answer => {
          if (answer.consequences) {
            allConsequences.push({
              consequences: answer.consequences
            })
          }
        })
      }
    })

    // Create nodes without consequences
    const nodesWithoutConsequences = nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        answers: node.data.answers?.map(answer => {
          const { consequences, ...answerWithoutConsequences } = answer
          return answerWithoutConsequences
        })
      }
    }))

    var allData = {
      nodes: nodesWithoutConsequences,
      connections: connections,
      consequences: allConsequences
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
  }

  // Generic HelpItem component for help panel controls
  function HelpItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
      <div className="flex items-center space-x-3">
        <div className="bg-gray-700 px-2 py-1 rounded text-xs">
          {icon}
        </div>
        <div className="mt-1 flex flex-col">
          <span className="text-base">{title}</span>
          <span className="text-sm text-gray-400">{description}</span>
        </div>
      </div>
    );
  }

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
          if (!nodes.some(node => node.startsConversation)) {
            toast.error("No starting node found. Please mark one or more nodes as conversation starter.")
            return
          }
          // Check for any node with no inbound or outbound connections
          const nodeWithNoConnections = nodes.find(node => {
            const hasOutbound = connections.some(conn => conn.from.nodeId === node.id);
            const hasInbound = connections.some(conn => conn.to.nodeId === node.id);
            return !hasOutbound && !hasInbound;
          });
          if (nodeWithNoConnections) {
            toast(`Node ${nodeWithNoConnections.title} has no inbound or outbound connections. Are you sure you want to continue?`, {
              duration: Infinity,
              cancel: {
                label: 'Cancel',
                onClick: () => {
                  toast.dismiss();
                }
              },
              action: {
                label: 'Confirm',
                onClick: () => {
                  exportDialogue()
                }
              }
            });
          } else {
            exportDialogue()
          }
        }}
          variant="secondary"
          size="sm"
          className="bg-gray-700 hover:bg-gray-600 text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          Export
        </Button>
        <Input
          type="file"
          ref={fileInputRef}
          accept=".json"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0];

            if (!selectedFile) {
              toast.error('File selection cancelled.');
              return;
            }
            toast('This action will overwrite the current canvas!', {
              duration: Infinity,
              cancel: {
                label: 'Cancel',
                onClick: () => {
                  toast.dismiss();
                  fileInputRef.current!.value = "";
                }
              },
              action: {
                label: 'Confirm',
                onClick: () => {
                  if (selectedFile) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      try {
                        const json = JSON.parse(e.target?.result as string);
                        onLoadData(json.nodes, json.connections);
                        toast.success('File loaded successfully');
                        fileInputRef.current!.value = "";
                      } catch (err) {
                        toast.error('Invalid file format');
                      }
                    };
                    reader.readAsText(selectedFile);
                  }
                }
              }
            });
          }}
          className="bg-gray-700 hover:bg-gray-600 h-9 file:text-white text-white border-none file:border-none file:bg-transparent file:text-white hover:cursor-pointer hover:file:cursor-pointer w-[14rem]"
        />


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
          <div className="flex items-center bg-green-900/50 px-3 py-1 rounded-md border border-green-500">
            <span className="text-green-300 text-sm">Click link button on target node to connect</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelConnecting}
              className="h-6 w-6 px-5 text-green-300 hover:bg-green-900/50"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {removing && (
          <div className="flex items-center bg-red-900/50 px-3 py-1 rounded-md border border-red-500">
            <span className="text-red-300 text-sm">Right click on target node to disconnect</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelRemoving}
              className="h-6 w-6 px-5 text-red-300 hover:bg-red-900/50"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="absolute top-4 right-4 bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md text-white shadow-xl z-50 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-blue-400" />
              {helpPage === 0 ? 'Quick Guide' : 'Directions'}
            </h3>
            {/* Navigation Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              size="sm"
              variant={helpPage === 0 ? "default" : "secondary"}
              className={`px-4 text-white ${helpPage === 0 ? "bg-gray-900" : "bg-gray-700 hover:bg-gray-600"}`}
              onClick={() => setHelpPage(0)}
            >
              Controls
            </Button>
            <Button
              size="sm"
              variant={helpPage === 1 ? "default" : "secondary"}
              className={`px-4 text-white ${helpPage === 1 ? "bg-gray-900" : "bg-gray-700 hover:bg-gray-600"}`}
              onClick={() => setHelpPage(1)}
            >
              Directions
            </Button>
          </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowHelp(false)}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          {helpPage === 0 ? (
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
                  <HelpItem
                    icon={
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-400 text-sm">Alt</span>
                        <span className="text-gray-300 text-sm">+</span>
                        <MousePointer className="h-4 w-4 text-gray-300" />
                      </div>
                    }
                    title="Pan canvas"
                    description="Alt + Left click + drag"
                  />
                  <HelpItem
                    icon={<ZoomIn className="h-4 w-4 text-gray-300" />}
                    title="Zoom in/out"
                    description="Mouse wheel"
                  />
                  <HelpItem
                    icon={<MousePointer2 className="h-4 w-4 text-gray-300" />}
                    title="Get node properties"
                    description="Left click"
                  />
                  <HelpItem
                    icon={<Move className="h-4 w-4 text-gray-300" />}
                    title="Drag node"
                    description="Left click + drag"
                  />
                  <HelpItem
                    icon={<Link className="h-4 w-4 text-gray-300" />}
                    title="Create connection"
                    description="Left click the link button on the source node, then left click the link button on the target node"
                  />
                  <HelpItem
                    icon={<Unlink className="h-4 w-4 text-gray-300" />}
                    title="Remove connection "
                    description="Right click on source node, then right click on target node"
                  />
                  <HelpItem
                    icon={<CopyPlus className="h-4 w-4 text-gray-300" />}
                    title="Clone node"
                    description="Click the copy button on any node to create a duplicate"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[1250px]">
              <div className="bg-gray-750 rounded-lg p-3 border border-gray-600">
                <div className="space-y-2">
                  <h4 className="mb-3 font-semibold">Directions</h4>
                  <div className="pl-4">
                    <div className="space-y-3 text-sm">
                      <p>
                        Create interactive dialogue trees by connecting nodes that represent conversations and choices.
                      </p>
                      
                      <div className="space-y-2">
                        <h5 className="font-medium text-gray-300">Key Components:</h5>
                        <ul className="pl-4 space-y-1">
                          <li>• <strong>Question Nodes:</strong> Contain dialogue text and multiple answer options</li>
                          <li>• <strong>Answer Options:</strong> Possible answer choices with titles, values, and probabilities</li>
                          <li>• <strong>Connections:</strong> Define the flow between questions and answers</li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <h5 className="font-medium text-gray-300">Getting Started:</h5>
                        <ul className="pl-4 space-y-1">
                          <li>• Mark at least one node as a "conversation starter"</li>
                          <li>• Add answers to nodes through the properties panel</li>
                          <li>• Connect nodes to create dialogue flow</li>
                          <li>• Use tooltips for help with complex variables</li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <h5 className="font-medium text-gray-300">How It Works:</h5>
                        <ul className="pl-4 space-y-1">
                          <li>• Players see the starting question</li>
                          <li>• Their choice determines which connected question node appears next</li>
                          <li>• Nodes can be removed or kept based on settings</li>
                          <li>• Process continues until dialogue ends</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <p>
                    <span className="font-semibold">To summarize:</span>
                    <span className="pl-2 flex flex-col gap-1 mt-1">
                      <span className="text-sm">• Step 1: Add nodes to the canvas using the toolbar.</span>
                      <span className="text-sm">• Step 2: Edit node properties as needed.</span>
                      <span className="text-sm">• Step 3: Connect nodes to define dialogue flow.</span>
                      <span className="text-sm">• Step 4: Export dialogue.</span>
                    <span className="font-semibold">OR</span>
                    <span className="pl-2 flex flex-col gap-1 mt-1">
                      <span className="text-sm">• Step 1: Import an existing dialogue file.</span>
                      <span className="text-sm">• Step 2: Edit as needed.</span>
                    </span>
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
} 