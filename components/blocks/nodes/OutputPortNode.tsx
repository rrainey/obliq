'use client';

import { memo } from 'react';
import { useState, useEffect } from 'react';
import { Position, NodeProps, Handle } from 'reactflow';
import { withNodeDataHandling } from '../withNodeDataHandling';

export interface OutputPortNodeData {
  label: string;
  description?: string;
  name?: string; // Signal name for code generation
  value?: number | null; // Current value (set during simulation)
  connected?: boolean; // Whether this port is connected to a source
  unit?: string; // Optional unit for the value (e.g., "m/s", "kg", etc.)
}

interface OutputPortNodeProps extends NodeProps<OutputPortNodeData> {
  onNodeDataChange?: (nodeId: string, data: Partial<OutputPortNodeData>) => void;
}

const OutputPortNode = ({ 
  data, 
  selected, 
  id, 
  isConnectable
}: NodeProps<OutputPortNodeData>) => {


  return (
    <div className={`px-4 py-4 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : data.connected ? 'border-green-400' : 'border-gray-300'
    } min-w-[150px]`}>
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        className={`w-3 h-3 ${data.connected ? 'bg-green-500' : 'bg-gray-500'}`}
        isConnectable={isConnectable}
      />

      {/* Block content */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{data.label}</span>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Output</span>
        </div>
        
        
        {/* Display current value (if simulation is running) */}
        {data.value !== undefined && (
          <div className="mt-2 p-2 bg-gray-100 rounded text-center">
            <div className="font-mono">
              {data.value !== null ? data.value : '---'}
              {data.unit && <span className="text-xs ml-1 text-gray-500">{data.unit}</span>}
            </div>
            <div className="text-xs text-gray-500 mt-1">Current Value</div>
          </div>
        )}
        
        {/* Connection status */}
        <div className="mt-2 text-xs text-center">
          {data.connected ? (
            <span className="text-green-600">● Connected</span>
          ) : (
            <span className="text-gray-500">○ Not connected</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(OutputPortNode);