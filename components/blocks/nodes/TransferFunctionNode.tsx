'use client';

import { useState, useEffect } from 'react';
import { Position, NodeProps, Handle } from 'reactflow';
import { withNodeDataHandling } from '../withNodeDataHandling';

export interface TransferFunctionNodeData {
  label: string;
  description?: string;
  numerator: string;
  denominator: string;
}

interface TransferFunctionNodeProps extends NodeProps<TransferFunctionNodeData> {
  onNodeDataChange?: (nodeId: string, data: Partial<TransferFunctionNodeData>) => void;
}

const TransferFunctionNode = ({ 
  data, 
  selected, 
  id, 
  isConnectable, 
  onNodeDataChange 
}: TransferFunctionNodeProps) => {
  const [numerator, setNumerator] = useState(data.numerator || '1');
  const [denominator, setDenominator] = useState(data.denominator || '1,1');

  // Update state when props change
  useEffect(() => {
    setNumerator(data.numerator || '1');
    setDenominator(data.denominator || '1,1');
  }, [data.numerator, data.denominator]);

  // Handle numerator change
  const handleNumeratorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setNumerator(newValue);
    
    // Update the model data
    if (onNodeDataChange) {
      onNodeDataChange(id, { numerator: newValue });
    }
  };

  // Handle denominator change
  const handleDenominatorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDenominator(newValue);
    
    // Update the model data
    if (onNodeDataChange) {
      onNodeDataChange(id, { denominator: newValue });
    }
  };

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
        
        <div className="mb-2">
          <label className="block text-xs text-gray-600 mb-1">Numerator:</label>
          <input
            type="text"
            value={numerator}
            onChange={handleNumeratorChange}
            className="w-full p-1 text-xs border rounded nodrag"
            placeholder="e.g. 1"
          />
        </div>
        
        <div className="border-t border-gray-200 my-2"></div>
        
        <div>
          <label className="block text-xs text-gray-600 mb-1">Denominator:</label>
          <input
            type="text"
            value={denominator}
            onChange={handleDenominatorChange}
            className="w-full p-1 text-xs border rounded nodrag"
            placeholder="e.g. 1,1"
          />
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

export default withNodeDataHandling(TransferFunctionNode);