// components/blocks/nodes/SumNode.tsx - Updated for better contrast
'use client';

import { memo } from 'react';
import { Position, NodeProps, Handle } from 'reactflow';
import { SumBlockData } from '@/lib/models/modelSchema';

const SumNode = ({ 
  data, 
  selected, 
  id, 
  isConnectable 
}: NodeProps<SumBlockData>) => {
  // Default values
  const inputCount = data.inputCount || 2;
  const operationType = data.operationType || 'sum';
  const showInputLabels = data.showInputLabels ?? true;

  // Generate input handles based on count
  const renderInputHandles = () => {
    const handles = [];
    const totalInputs = inputCount;
    
    for (let i = 0; i < totalInputs; i++) {
      const yPosition = 20 + (i * (60 / totalInputs));
      handles.push(
        <div key={`input-${i+1}`} className="absolute left-0" style={{ top: `${yPosition}%` }}>
          <Handle
            type="target"
            position={Position.Left}
            id={`in${i+1}`}
            className="w-3 h-3 bg-green-500"
            isConnectable={isConnectable}
          />
          {showInputLabels && (
            <span className="text-xs text-gray-800 font-medium ml-1 absolute left-3" style={{ transform: 'translateY(-50%)' }}>
              {i === 0 && operationType === 'difference' ? 'minuend' : `in ${i+1}`}
            </span>
          )}
        </div>
      );
    }
    
    return handles;
  };

  return (
    <div className={`relative px-6 py-4 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-300'
    } min-w-[120px] min-h-[100px] flex flex-col items-center justify-center`}>
      {/* Input handles */}
      {renderInputHandles()}

      {/* Block content */}
      <div className="flex flex-col items-center mt-2">
        <div className="text-xs text-gray-800 font-semibold mb-2">{data.label}</div>
        <div className="text-3xl font-bold text-gray-900">{operationType === 'sum' ? '+' : '−'}</div>
      </div>

      {/* Output handle */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
        <Handle
          type="source"
          position={Position.Right}
          id="out"
          className="w-3 h-3 bg-blue-500"
          isConnectable={isConnectable}
        />
        {showInputLabels && (
          <span className="text-xs text-gray-800 font-medium mr-5 absolute right-0" style={{ transform: 'translateY(-50%)' }}>
            out
          </span>
        )}
      </div>
    </div>
  );
};

export default memo(SumNode);