'use client';

import { memo, useEffect, useState } from 'react';
import { Position, NodeProps, Handle } from 'reactflow';

export interface DisplayNodeData {
  label: string;
  description?: string;
  value?: number | string | null;
  connected?: boolean;
  unit?: string;
  displayMode?: 'value' | 'gauge' | 'indicator';
  min?: number;
  max?: number;
  precision?: number;
  showUnit?: boolean;
  showSettings?: boolean;
}

const DisplayNode = ({ 
  data, 
  selected, 
  id, 
  isConnectable
}: NodeProps<DisplayNodeData>) => {
  // Default values
  const displayMode = data.displayMode || 'value';
  const min = data.min ?? 0;
  const max = data.max ?? 100;
  const precision = data.precision ?? 2;
  const showUnit = data.showUnit ?? true;
  const showSettings = data.showSettings ?? false;
  
  // Add animation state for value changes
  const [isHighlighted, setIsHighlighted] = useState(false);
  
  // Animate value changes
  useEffect(() => {
    if (data.value !== undefined && data.value !== null) {
      setIsHighlighted(true);
      const timeout = setTimeout(() => {
        setIsHighlighted(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [data.value]);
  
  // Format the display value
  const formattedValue = () => {
    if (data.value === undefined || data.value === null) {
      return '---';
    }
    
    if (typeof data.value === 'number') {
      return data.value.toFixed(precision);
    }
    
    return data.value;
  };
  
  // Calculate gauge percentage
  const gaugePercentage = () => {
    if (typeof data.value !== 'number') return 0;
    
    const percentage = ((data.value - min) / (max - min)) * 100;
    return Math.max(0, Math.min(percentage, 100)); // Clamp between 0-100
  };

  return (
    <div 
      className={`px-4 py-4 shadow-md rounded-md bg-white border-2 ${
        selected ? 'border-blue-500' : data.connected ? 'border-green-400' : 'border-gray-300'
      } min-w-[150px] transition-all duration-200 ${isHighlighted ? 'ring-2 ring-yellow-300' : ''}`}
    >
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
        <div className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
          {displayMode === 'value' ? 'Value' : displayMode === 'gauge' ? 'Gauge' : 'Indicator'}
        </div>
      </div>

      {/* Block content */}
      <div className="flex flex-col">
        
        {/* Value display - different modes */}
        {displayMode === 'value' && (
          <div className={`p-3 bg-gray-100 rounded text-center transition-colors duration-300 ${
            isHighlighted ? 'bg-yellow-100' : 'bg-gray-100'
          }`}>
            <div className="text-lg font-mono">
              {formattedValue()}
              {showUnit && data.unit && <span className="text-xs ml-1 text-gray-500">{data.unit}</span>}
            </div>
          </div>
        )}
        
        {displayMode === 'gauge' && (
          <div className="p-3 bg-gray-100 rounded">
            <div className="h-4 w-full bg-gray-300 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${gaugePercentage()}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>{min}</span>
              <span className="font-mono">
                {formattedValue()}
                {showUnit && data.unit && <span className="ml-1 text-gray-500">{data.unit}</span>}
              </span>
              <span>{max}</span>
            </div>
          </div>
        )}
        
        {displayMode === 'indicator' && (
          <div className="p-3 bg-gray-100 rounded text-center">
            {typeof data.value === 'number' ? (
              <div className="flex flex-col items-center">
                <div className={`h-5 w-5 rounded-full transition-colors duration-300 ${
                  data.value > 0 ? 'bg-green-500' : 
                  data.value < 0 ? 'bg-red-500' : 'bg-gray-500'
                }`}></div>
                <div className="text-sm font-mono mt-1">
                  {formattedValue()}
                  {showUnit && data.unit && <span className="text-xs ml-1 text-gray-500">{data.unit}</span>}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No value</div>
            )}
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

export default memo(DisplayNode);