// components/blocks/nodes/InputPortNode.tsx - Refactored for external input only
'use client';

import { memo } from 'react';
import { Position, NodeProps, Handle } from 'reactflow';

export interface InputPortBlockData {
  label: string;
  description?: string;
  name: string; // Required for input ports
  unit?: string;
  defaultValue?: number; // Default value when not connected externally
}

const InputPortNode = ({ 
  data, 
  selected, 
  id, 
  isConnectable 
}: NodeProps<InputPortBlockData>) => {
  const inputName = data.name || 'input';
  const unit = data.unit || '';
  const defaultValue = data.defaultValue !== undefined ? data.defaultValue : 0;

  return (
    <div className={`relative px-4 py-3 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-green-400'
    } min-w-[140px]`}>
      {/* Block header */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold text-gray-900">{data.label}</div>
        <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">Input</div>
      </div>
      
      {/* Input name display */}
      <div className="mb-2">
        <div className="p-1 bg-gray-100 rounded text-center">
          <div className="text-sm font-semibold text-gray-900">{inputName}</div>
          {unit && <div className="text-xs text-gray-700">[{unit}]</div>}
        </div>
      </div>
      
      {/* Default value info */}
      <div className="text-xs text-gray-700 font-medium text-center">
        Default: {defaultValue}{unit ? ` ${unit}` : ''}
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