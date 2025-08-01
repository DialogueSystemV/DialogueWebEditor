export interface Consequences {
  answerNodeId: string
  questionsToAdd?: string[]
  questionsToRemove?: string[]
}

export interface Answer {
  id: string
  title: string
  text: string
  probability: number
  condition?: string
  endsCondition: boolean
  action?: string
  consequences?: Consequences
}

export interface NodeData {
  id: string
  title: string
  position: { x: number; y: number }
  startsConversation: boolean
  removeQuestionAfterAsked: boolean
  data: {
    questionText?: string
    answers?: Answer[]
  }
}

export interface Connection {
  id: string
  from: { nodeId: string}
  to: { nodeId: string }
}

export const nodeTypes = {
  question: { color: "bg-blue-600", title: "Question Node" },
} as const

export type NodeType = keyof typeof nodeTypes 