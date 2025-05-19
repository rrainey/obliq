'use client';

import { useState, useEffect } from 'react';
import { Position, NodeProps, Handle } from 'reactflow';
import { withNodeDataHandling } from '../withNodeDataHandling';

export interface SumNodeData {
  label: string;
  description?: string;
  inputCount: number;
}

interface SumNodeProps extends NodeProps<SumNodeData> {
  onNodeDataChange?: (nodeId: string, data: Partial<SumNodeData>) => void;
}

const SumNode = ({ data, selected, id, isConnectable, onNodeDataChange }: SumNodeProps) => {
  // Default to 2 inputs if not specified
  const [inputCount, setInputCount] = useState(data.inputCount || 2);

  // Update state when props change
  useEffect(() => {
    setInputCount(data.inputCount || 2);
  }, [data.inputCount]);

  // Generate input handles based on count
  const renderInputHandles = () => {
    const handles = [];
    const totalInputs = inputCount;
    
    for (let i = 0; i < totalInputs; i++) {
      const yPosition = 20 + (i * (60 / totalInputs));
      handles.push(
        <Handle
          key={`in${i+1}`}
          type="target"
          position={Position.Left}
          id={`in${i+1}`}
          className="w-3 h-3 bg-green-500"
          style={{ top: `${yPosition}%` }}
          isConnectable={isConnectable}
        />
      );
    }
    
    return handles;
  };
  
  const addInput = () => {
    const newCount = inputCount + 1;
    setInputCount(newCount);
    if (onNodeDataChange) {
      onNodeDataChange(id, { inputCount: newCount });
    }
  };
  
  const removeInput = () => {
    if (inputCount > 2) {
      const newCount = inputCount - 1;
      setInputCount(newCount);
      if (onNodeDataChange) {
        onNodeDataChange(id, { inputCount: newCount });
      }
    }
  };

  return (
    <div className={`px-4 py-4 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-300'
    } min-w-[100px] min-h-[100px] flex flex-col`}>
      {/* Input handles */}
      {renderInputHandles()}

      {/* Block content */}
      <div className="flex flex-col items-center mb-2">
        <div className="text-xs text-gray-500 mb-1">{data.label}</div>
        <div className="text-3xl font-bold">+</div>
      </div>
      
      {/* Add/remove input buttons */}
      <div className="flex justify-center space-x-2 mt-2">
        <button 
          className="px-2 py-1 bg-gray-200 rounded text-xs nodrag"
          onClick={addInput}
          type="button"
        >
          + Input
        </button>
        {inputCount > 2 && (
          <button 
            className="px-2 py-1 bg-gray-200 rounded text-xs nodrag"
            onClick={removeInput}
            type="button"
          >
            - Input
          </button>
        )}
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className="w-3 h-3 bg-blue-500"
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default withNodeDataHandling(SumNode);