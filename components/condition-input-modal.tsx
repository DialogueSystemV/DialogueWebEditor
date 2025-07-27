import React, { useState, useEffect } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"

// Helper to split condition/action string into parts
function parseFieldValue(value: string | undefined) {
  if (!value) return { assembly: '', namespace: '', className: '', method: '' }
  const parts = value.split('.')
  return {
    assembly: parts[0] || '',
    namespace: parts[1] || '',
    className: parts[2] || '',
    method: parts[3] || '',
  }
}

export function ConditionInputModal({ answer, selectedNode, onUpdateNodeAnswers, fieldType }: any) {
  const [fields, setFields] = useState(() => parseFieldValue(answer[fieldType]))

  useEffect(() => {
    setFields(parseFieldValue(answer[fieldType]))
  }, [answer[fieldType]])

  function handleChange(field: string, value: string) {
    const newFields = { ...fields, [field]: value }
    setFields(newFields)
    // Build string, skipping empty parts but keeping dots between non-empty
    const fieldValue = [newFields.assembly, newFields.namespace, newFields.className, newFields.method]
      .filter((v, i, arr) => v || arr.slice(i+1).some(Boolean)) // keep empty if followed by non-empty
      .join('.')
    const updatedAnswers = (selectedNode.data.answers || []).map((a: any) =>
      a.id === answer.id ? { ...a, [fieldType]: fieldValue || undefined } : a
    )
    onUpdateNodeAnswers(selectedNode.id, updatedAnswers)
  }

  function handleClear() {
    setFields({ assembly: '', namespace: '', className: '', method: '' })
    const updatedAnswers = (selectedNode.data.answers || []).map((a: any) =>
      a.id === answer.id ? { ...a, [fieldType]: undefined } : a
    )
    onUpdateNodeAnswers(selectedNode.id, updatedAnswers)
  }

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800/90 to-gray-900/80 backdrop-blur-md shadow-xl">
      <div className="flex gap-2">
        <Input
          placeholder="Assembly"
          value={fields.assembly}
          onChange={e => handleChange('assembly', e.target.value)}
          className="bg-gray-900/80 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400 rounded-md"
        />
        <Input
          placeholder="Namespace"
          value={fields.namespace}
          onChange={e => handleChange('namespace', e.target.value)}
          className="bg-gray-900/80 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400 rounded-md"
        />
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Class"
          value={fields.className}
          onChange={e => handleChange('className', e.target.value)}
          className="bg-gray-900/80 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400 rounded-md"
        />
        <Input
          placeholder="Method"
          value={fields.method}
          onChange={e => handleChange('method', e.target.value)}
          className="bg-gray-900/80 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400 rounded-md"
        />
      </div>
      <div className="flex justify-end mt-2">
        <Button size="sm" variant="outline" onClick={handleClear} className="text-white hover:text-white bg-gray-700 hover:bg-gray-600 border-gray-500">Clear</Button>
      </div>
    </div>
  )
} 