'use client';

import { memo } from 'react';
import { Position, NodeProps, Handle } from 'reactflow';
import { OutputPortBlockData } from '@/lib/models/modelSchema';

const OutputPortNode = ({ 
  data, 
  selected, 
  id, 
  isConnectable 
}: NodeProps<OutputPortBlockData>) => {
  // Get the output value to display
  const value = data.value !== undefined && data.value !== null ? data.value : '---';
  const unit = data.unit || '';
  const signalName = data.name || 'output';
  const exportEnabled = data.exportEnabled || false;

  return (
    <div className={`relative px-4 py-3 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : data.connected ? 'border-green-400' : 'border-gray-300'
    } min-w-[140px]`}>
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        className={`w-3 h-3 ${data.connected ? 'bg-green-500' : 'bg-gray-500'}`}
        isConnectable={isConnectable}
      />

      {/* Block header */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">{data.label}</div>
        <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Output</div>
      </div>
      
      {/* Value display */}
      <div className="mb-2">
        <div className="p-1 bg-gray-100 rounded font-mono flex justify-between">
          <span>{value}</span>
          {unit && <span className="text-xs text-gray-500">{unit}</span>}
        </div>
      </div>
      
      {/* Signal name and export status */}
      <div className="text-xs flex justify-between">
        <span className="text-gray-500 truncate">
          Signal: {signalName}
        </span>
        {exportEnabled && (
          <span className="text-green-600">
            Exported
          </span>
        )}
      </div>
    </div>
  );
};

export default memo(OutputPortNode);