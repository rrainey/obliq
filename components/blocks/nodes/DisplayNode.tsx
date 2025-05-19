'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Position, NodeProps, Handle } from 'reactflow';
import { withNodeDataHandling } from '../withNodeDataHandling';

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

interface DisplayNodeProps extends NodeProps<DisplayNodeData> {
  onNodeDataChange?: (nodeId: string, data: Partial<DisplayNodeData>) => void;
}

const DisplayNode = ({ 
  data, 
  selected, 
  id, 
  isConnectable, 
  onNodeDataChange 
}: DisplayNodeProps) => {
  // Default values
  const displayMode = data.displayMode || 'value';
  const min = data.min ?? 0;
  const max = data.max ?? 100;
  const precision = data.precision ?? 2;
  const showUnit = data.showUnit ?? true;
  const showSettings = data.showSettings ?? false;
  
  // Refs for interactive elements
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  
  // We'll use a useEffect with a cleanup function to add direct DOM event listeners
  useEffect(() => {
    // Settings toggle handler - using direct DOM events
    const handleSettingsClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (onNodeDataChange) {
        onNodeDataChange(id, { showSettings: !showSettings });
      }
      
      return false;
    };
    
    // Add event listeners to refs
    if (settingsButtonRef.current) {
      settingsButtonRef.current.addEventListener('mousedown', handleSettingsClick, { capture: true });
      settingsButtonRef.current.addEventListener('click', handleSettingsClick, { capture: true });
    }
    
    // Cleanup
    return () => {
      if (settingsButtonRef.current) {
        settingsButtonRef.current.removeEventListener('mousedown', handleSettingsClick);
        settingsButtonRef.current.removeEventListener('click', handleSettingsClick);
      }
    };
  }, [id, onNodeDataChange, showSettings]);
  
  // Format the display value
  const formattedValue = useCallback(() => {
    if (data.value === undefined || data.value === null) {
      return '---';
    }
    
    if (typeof data.value === 'number') {
      return data.value.toFixed(precision);
    }
    
    return data.value;
  }, [data.value, precision]);
  
  // Calculate gauge percentage
  const gaugePercentage = useCallback(() => {
    if (typeof data.value !== 'number') return 0;
    
    const percentage = ((data.value - min) / (max - min)) * 100;
    return Math.max(0, Math.min(percentage, 100)); // Clamp between 0-100
  }, [data.value, min, max]);

  // Handle various form control changes - for settings panel
  const handleFormChange = useCallback((field: string, value: any) => {
    if (onNodeDataChange) {
      onNodeDataChange(id, { [field]: value });
    }
  }, [id, onNodeDataChange]);

  return (
    <div 
      className={`px-4 py-4 shadow-md rounded-md bg-white border-2 ${
        selected ? 'border-blue-500' : data.connected ? 'border-green-400' : 'border-gray-300'
      } min-w-[150px]`}
    >
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
          <button 
            ref={settingsButtonRef}
            className="text-xs bg-gray-200 hover:bg-gray-300 p-1 rounded nodrag"
            type="button"
          >
            {showSettings ? 'Hide' : 'Settings'}
          </button>
        </div>
        
        {/* Settings panel */}
        {showSettings && (
          <div className="mb-3 p-2 bg-gray-50 rounded border text-xs">
            <div className="mb-2">
              <label className="block text-gray-600 mb-1">Display Mode:</label>
              <select 
                value={displayMode}
                onChange={(e) => {
                  e.stopPropagation();
                  handleFormChange('displayMode', e.target.value);
                }}
                className="w-full p-1 text-xs border rounded nodrag"
              >
                <option value="value">Value</option>
                <option value="gauge">Gauge</option>
                <option value="indicator">Indicator</option>
              </select>
            </div>
            
            {displayMode === 'gauge' && (
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="block text-gray-600 mb-1">Min:</label>
                  <input 
                    type="number"
                    value={min}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleFormChange('min', parseFloat(e.target.value));
                    }}
                    className="w-full p-1 text-xs border rounded nodrag"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Max:</label>
                  <input 
                    type="number"
                    value={max}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleFormChange('max', parseFloat(e.target.value));
                    }}
                    className="w-full p-1 text-xs border rounded nodrag"
                  />
                </div>
              </div>
            )}
            
            <div className="mb-2">
              <label className="block text-gray-600 mb-1">Precision:</label>
              <input 
                type="number"
                min="0"
                max="10"
                value={precision}
                onChange={(e) => {
                  e.stopPropagation();
                  handleFormChange('precision', parseInt(e.target.value, 10));
                }}
                className="w-full p-1 text-xs border rounded nodrag"
              />
            </div>
            
            <div className="mb-2">
              <label className="block text-gray-600 mb-1">Unit:</label>
              <div className="flex">
                <input 
                  type="text"
                  value={data.unit || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleFormChange('unit', e.target.value);
                  }}
                  className="flex-grow p-1 text-xs border rounded-l nodrag"
                  placeholder="e.g., m/s"
                />
                <div className="flex items-center px-2 border border-l-0 rounded-r bg-white">
                  <input 
                    type="checkbox"
                    checked={showUnit}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleFormChange('showUnit', e.target.checked);
                    }}
                    className="mr-1 nodrag"
                  />
                  <span className="text-xs">Show</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Value display - different modes */}
        {displayMode === 'value' && (
          <div className="p-3 bg-gray-100 rounded text-center">
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
                className="h-full bg-blue-500 rounded-full"
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
                <div className={`h-5 w-5 rounded-full ${
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

export default withNodeDataHandling(DisplayNode);