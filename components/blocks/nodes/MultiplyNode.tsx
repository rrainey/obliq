'use client';

import { memo } from 'react';
import { Position, NodeProps, Handle } from 'reactflow';

export interface MultiplyNodeData {
  label: string;
  description?: string;
  inputCount: number;
}

interface MultiplyNodeProps extends NodeProps<MultiplyNodeData> {
  onNodeDataChange?: (nodeId: string, data: Partial<MultiplyNodeData>) => void;
}

const MultiplyNode = ({ data, selected, id, isConnectable }: NodeProps<MultiplyNodeData>) => {
   // Default to 2 inputs if not specified
  const inputCount = data.inputCount || 2;

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

  return (
    <div className={`px-4 py-4 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-300'
    } min-w-[100px] min-h-[100px] flex flex-col`}>
      {/* Input handles */}
      {renderInputHandles()}

      {/* Block content */}
      <div className="flex flex-col items-center mb-2">
        <div className="text-xs text-gray-500 mb-1">{data.label}</div>
        <div className="text-3xl font-bold">×</div>
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

export default memo(MultiplyNode);