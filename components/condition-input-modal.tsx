import React, { useState, useEffect } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"

// Helper to split condition string into parts
function parseCondition(condition: string | undefined) {
  if (!condition) return { assembly: '', namespace: '', className: '', method: '' }
  const parts = condition.split('.')
  return {
    assembly: parts[0] || '',
    namespace: parts[1] || '',
    className: parts[2] || '',
    method: parts[3] || '',
  }
}

export function ConditionInputModal({ answer, selectedNode, onUpdateNodeAnswers }: any) {
  const [fields, setFields] = useState(() => parseCondition(answer.condition))

  useEffect(() => {
    setFields(parseCondition(answer.condition))
  }, [answer.condition])

  function handleChange(field: string, value: string) {
    const newFields = { ...fields, [field]: value }
    setFields(newFields)
    // Build condition string, skipping empty parts but keeping dots between non-empty
    const cond = [newFields.assembly, newFields.namespace, newFields.className, newFields.method]
      .filter((v, i, arr) => v || arr.slice(i+1).some(Boolean)) // keep empty if followed by non-empty
      .join('.')
    const updatedAnswers = (selectedNode.data.answers || []).map((a: any) =>
      a.id === answer.id ? { ...a, condition: cond || undefined } : a
    )
    onUpdateNodeAnswers(selectedNode.id, updatedAnswers)
  }

  function handleClear() {
    setFields({ assembly: '', namespace: '', className: '', method: '' })
    const updatedAnswers = (selectedNode.data.answers || []).map((a: any) =>
      a.id === answer.id ? { ...a, condition: undefined } : a
    )
    onUpdateNodeAnswers(selectedNode.id, updatedAnswers)
  }

  return (
    <div className="flex flex-col gap-2 bg-gray-800 p-3 rounded-lg border border-gray-700">
      <div className="flex gap-2">
        <Input
          placeholder="Assembly"
          value={fields.assembly}
          onChange={e => handleChange('assembly', e.target.value)}
          className="bg-gray-700 border-gray-600 text-white"
        />
        <Input
          placeholder="Namespace"
          value={fields.namespace}
          onChange={e => handleChange('namespace', e.target.value)}
          className="bg-gray-700 border-gray-600 text-white"
        />
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Class"
          value={fields.className}
          onChange={e => handleChange('className', e.target.value)}
          className="bg-gray-700 border-gray-600 text-white"
        />
        <Input
          placeholder="Method"
          value={fields.method}
          onChange={e => handleChange('method', e.target.value)}
          className="bg-gray-700 border-gray-600 text-white"
        />
      </div>
      <div className="flex justify-end mt-2">
        <Button size="sm" variant="outline" onClick={handleClear} className="text-white hover:text-white bg-gray-700 hover:bg-gray-600 border-gray-500">Clear</Button>
      </div>
    </div>
  )
} 