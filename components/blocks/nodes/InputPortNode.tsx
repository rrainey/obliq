'use client';

import { useState, useEffect } from 'react';
import { Position, NodeProps, Handle } from 'reactflow';
import { withNodeDataHandling } from '../withNodeDataHandling';

export interface InputPortNodeData {
  label: string;
  description?: string;
  value: number;
  name?: string; // Signal name for code generation
  unit?: string; // Optional unit for the value
}

interface InputPortNodeProps extends NodeProps<InputPortNodeData> {
  onNodeDataChange?: (nodeId: string, data: Partial<InputPortNodeData>) => void;
}

const InputPortNode = ({ 
  data, 
  selected, 
  id, 
  isConnectable, 
  onNodeDataChange 
}: InputPortNodeProps) => {
  const [value, setValue] = useState(data.value || 0);
  const [name, setName] = useState(data.name || '');
  const [unit, setUnit] = useState(data.unit || '');

  // Update state when props change
  useEffect(() => {
    setValue(data.value || 0);
    setName(data.name || '');
    setUnit(data.unit || '');
  }, [data.value, data.name, data.unit]);

  // Handle value change
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    setValue(newValue);
    
    // Update the model data
    if (onNodeDataChange) {
      onNodeDataChange(id, { value: newValue });
    }
  };

  // Handle name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    
    // Update the model data
    if (onNodeDataChange) {
      onNodeDataChange(id, { name: newName });
    }
  };

  // Handle unit change
  const handleUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUnit = e.target.value;
    setUnit(newUnit);
    
    // Update the model data
    if (onNodeDataChange) {
      onNodeDataChange(id, { unit: newUnit });
    }
  };

  return (
    <div className={`px-4 py-4 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-300'
    } min-w-[150px]`}>
      {/* Block content */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{data.label}</span>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Input</span>
        </div>
        
        {/* Signal name field */}
        <div className="mb-2">
          <label className="block text-xs text-gray-600 mb-1">Signal Name:</label>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            className="w-full p-1 text-sm border rounded nodrag"
            placeholder="Enter signal name"
          />
        </div>
        
        {/* Value field */}
        <div className="mb-2">
          <label className="block text-xs text-gray-600 mb-1">Value:</label>
          <div className="flex">
            <input
              type="number"
              value={value}
              onChange={handleValueChange}
              className="w-full p-1 text-sm border rounded-l nodrag"
              step="0.1"
            />
            <input
              type="text"
              value={unit}
              onChange={handleUnitChange}
              className="w-20 p-1 text-sm border border-l-0 rounded-r nodrag"
              placeholder="Unit"
            />
          </div>
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

export default withNodeDataHandling(InputPortNode);