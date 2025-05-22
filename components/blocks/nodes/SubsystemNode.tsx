// components/blocks/nodes/SubsystemNode.tsx - Enhanced with dynamic handles
'use client';

import { memo, useMemo } from 'react';
import { Position, NodeProps, Handle } from 'reactflow';
import { Sheet, analyzeSubsystemHandles } from '@/lib/models/modelSchema';

export interface SubsystemBlockData {
  label: string;
  description?: string;
  sheet?: Sheet; // Embedded sheet definition
  inputHandles?: Array<{ id: string; name: string; unit?: string }>; // Cached for performance
  outputHandles?: Array<{ id: string; name: string; unit?: string }>; // Cached for performance
}

interface SubsystemNodeProps extends NodeProps<SubsystemBlockData> {
  onDoubleClick?: (nodeId: string, sheet?: Sheet) => void;
}

const SubsystemNode = ({ 
  data, 
  selected, 
  id, 
  isConnectable,
  onDoubleClick 
}: SubsystemNodeProps) => {
  
  // Analyze the embedded sheet to determine handles
  const { inputHandles, outputHandles } = useMemo(() => {
    if (data.sheet) {
      return analyzeSubsystemHandles(data.sheet);
    }
    // Fallback to cached handles or defaults
    return {
      inputHandles: data.inputHandles || [{ id: 'in', name: 'input' }],
      outputHandles: data.outputHandles || [{ id: 'out', name: 'output' }]
    };
  }, [data.sheet, data.inputHandles, data.outputHandles]);

  // Handle double-click to open subsystem
  const handleDoubleClick = () => {
    if (onDoubleClick) {
      onDoubleClick(id, data.sheet);
    }
  };

  // Calculate minimum width based on number of handles
  const maxHandles = Math.max(inputHandles.length, outputHandles.length);
  const minWidth = Math.max(150, maxHandles * 40 + 80);

  return (
    <div 
      className={`px-4 py-4 shadow-md rounded-md bg-white border-2 cursor-pointer ${
        selected ? 'border-blue-500' : 'border-purple-400'
      }`}
      style={{ minWidth: `${minWidth}px` }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Input handles */}
      {inputHandles.map((handle, index) => {
        const yPosition = inputHandles.length === 1 
          ? 50 // Center if only one handle
          : 20 + (index * (60 / Math.max(1, inputHandles.length - 1))); // Distribute evenly
        
        return (
          <div key={`input-${handle.id}`} className="absolute left-0" style={{ top: `${yPosition}%` }}>
            <Handle
              type="target"
              position={Position.Left}
              id={handle.id}
              className="w-3 h-3 bg-green-500"
              isConnectable={isConnectable}
            />
            <span 
              className="text-xs text-gray-800 font-medium ml-1 absolute left-3" 
              style={{ transform: 'translateY(-50%)', whiteSpace: 'nowrap' }}
            >
              {handle.name}
              {handle.unit && <span className="text-gray-600"> [{handle.unit}]</span>}
            </span>
          </div>
        );
      })}

      {/* Block content */}
      <div className="flex flex-col items-center min-h-[80px] justify-center">
        <div className="text-sm font-semibold text-gray-900 mb-2">{data.label}</div>
        <div className="p-3 border-2 border-dashed border-purple-300 rounded text-center bg-purple-50">
          <div className="text-xs text-purple-700 font-medium">Double-click to open</div>
          <div className="mt-1 text-xs text-purple-600">Subsystem</div>
          {data.sheet && (
            <div className="mt-1 text-xs text-purple-500">
              {data.sheet.blocks.length} blocks
            </div>
          )}
        </div>
      </div>

      {/* Output handles */}
      {outputHandles.map((handle, index) => {
        const yPosition = outputHandles.length === 1 
          ? 50 // Center if only one handle
          : 20 + (index * (60 / Math.max(1, outputHandles.length - 1))); // Distribute evenly
        
        return (
          <div key={`output-${handle.id}`} className="absolute right-0" style={{ top: `${yPosition}%` }}>
            <Handle
              type="source"
              position={Position.Right}
              id={handle.id}
              className="w-3 h-3 bg-blue-500"
              isConnectable={isConnectable}
            />
            <span 
              className="text-xs text-gray-800 font-medium mr-1 absolute right-3" 
              style={{ transform: 'translateY(-50%)', whiteSpace: 'nowrap' }}
            >
              {handle.name}
              {handle.unit && <span className="text-gray-600"> [{handle.unit}]</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default memo(SubsystemNode);