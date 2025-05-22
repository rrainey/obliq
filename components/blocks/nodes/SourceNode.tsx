// components/blocks/nodes/SourceNode.tsx
'use client';

import { memo } from 'react';
import { Position, NodeProps, Handle } from 'reactflow';

export interface SourceBlockData {
  label: string;
  description?: string;
  value: number;
  name?: string;
  unit?: string;
  sourceType?: 'constant' | 'sine';
  // Sine wave parameters
  amplitude?: number;
  frequency?: number; // Hz
  phase?: number; // radians
  offset?: number;
}

const SourceNode = ({ 
  data, 
  selected, 
  id, 
  isConnectable 
}: NodeProps<SourceBlockData>) => {
  // Get the source value to display
  const value = data.value !== undefined ? data.value : 0;
  const unit = data.unit || '';
  const sourceName = data.name || 'source';
  const sourceType = data.sourceType || 'constant';

  // Generate display text based on source type
  const getDisplayText = () => {
    if (sourceType === 'constant') {
      return `${value}${unit ? ' ' + unit : ''}`;
    } else if (sourceType === 'sine') {
      const amp = data.amplitude || 1;
      const freq = data.frequency || 1;
      const offset = data.offset || 0;
      return `${amp}sin(2π×${freq}t)${offset !== 0 ? `+${offset}` : ''}`;
    }
    return `${value}${unit ? ' ' + unit : ''}`;
  };

  return (
    <div className={`relative px-4 py-3 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-amber-400'
    } min-w-[140px]`}>
      {/* Block header */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold text-gray-900">{data.label}</div>
        <div className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded font-medium">Source</div>
      </div>
      
      {/* Value display */}
      <div className="mb-2">
        <div className="p-1 bg-gray-100 rounded font-mono text-center">
          <span className="text-gray-900 font-medium text-sm">{getDisplayText()}</span>
        </div>
      </div>
      
      {/* Source name */}
      <div className="text-xs text-gray-700 font-medium truncate">
        Signal: {sourceName}
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

export default memo(SourceNode);