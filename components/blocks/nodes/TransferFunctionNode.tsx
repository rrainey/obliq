'use client';

import { memo } from 'react';
import { useState, useEffect } from 'react';
import { Position, NodeProps, Handle } from 'reactflow';

export interface TransferFunctionNodeData {
  label: string;
  description?: string;
  numerator: string;
  denominator: string;
}


const TransferFunctionNode = ({ 
  data, 
  selected, 
  id, 
  isConnectable
}: NodeProps<TransferFunctionNodeData>) => {
  const [numerator, setNumerator] = useState(data.numerator || '1');
  const [denominator, setDenominator] = useState(data.denominator || '1,1');

  // Update state when props change
  useEffect(() => {
    setNumerator(data.numerator || '1');
    setDenominator(data.denominator || '1,1');
  }, [data.numerator, data.denominator]);



  return (
    <div className={`px-4 py-4 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-300'
    } min-w-[180px]`}>
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        className="w-3 h-3 bg-green-500"
        isConnectable={isConnectable}
      />

      {/* Block content */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{data.label}</span>
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Transfer Fn</span>
        </div>
        
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

export default memo(TransferFunctionNode);