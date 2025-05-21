'use client';

import { memo } from 'react';
import { Position, NodeProps, Handle } from 'reactflow';
import { InputPortBlockData } from '@/lib/models/modelSchema';

const InputPortNode = ({ 
  data, 
  selected, 
  id, 
  isConnectable 
}: NodeProps<InputPortBlockData>) => {
  // Get the input value to display
  const value = data.value !== undefined ? data.value : 0;
  const unit = data.unit || '';
  const signalName = data.name || 'input';
  const inputType = data.inputType || 'constant';

  return (
    <div className={`relative px-4 py-3 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-green-400'
    } min-w-[140px]`}>
      {/* Block header */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">{data.label}</div>
        <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Input</div>
      </div>
      
      {/* Value display */}
      <div className="mb-2">
        {inputType === 'constant' && (
          <div className="p-1 bg-gray-100 rounded font-mono flex justify-between">
            <span>{value}</span>
            {unit && <span className="text-xs text-gray-500">{unit}</span>}
          </div>
        )}
        {inputType === 'signal' && (
          <div className="p-1 bg-gray-100 rounded font-mono flex justify-between">
            <span className="text-xs text-gray-500 italic">External Signal</span>
          </div>
        )}
        {inputType === 'variable' && (
          <div className="p-1 bg-gray-100 rounded font-mono flex justify-between">
            <span className="text-xs text-gray-500 italic">Variable: {data.variableName}</span>
          </div>
        )}
      </div>
      
      {/* Signal name */}
      <div className="text-xs text-gray-500 truncate">
        Signal: {signalName}
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

export default memo(InputPortNode);