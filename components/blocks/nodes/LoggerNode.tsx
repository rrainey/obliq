'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Position, NodeProps, Handle } from 'reactflow';
import { withNodeDataHandling } from '../withNodeDataHandling';

export interface LogEntry {
  time: number;
  value: number | string;
}

export interface LoggerNodeData {
  label: string;
  description?: string;
  logs: LogEntry[];
  connected?: boolean;
  maxEntries?: number;
  recording?: boolean;
  unit?: string;
  showSettings?: boolean;
}

interface LoggerNodeProps extends NodeProps<LoggerNodeData> {
  onNodeDataChange?: (nodeId: string, data: Partial<LoggerNodeData>) => void;
}

const LoggerNode = ({ 
  data, 
  selected, 
  id, 
  isConnectable, 
  onNodeDataChange 
}: LoggerNodeProps) => {
  // Default values
  const maxEntries = data.maxEntries || 100;
  const logs = data.logs || [];
  const unit = data.unit || '';
  const recording = data.recording !== false;
  const showSettings = data.showSettings ?? false;
  
  // Refs for interactive elements
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const recordButtonRef = useRef<HTMLButtonElement>(null);
  const clearButtonRef = useRef<HTMLButtonElement>(null);
  
  // We'll use useEffect to add direct DOM event listeners
  useEffect(() => {
    // Settings toggle handler
    const handleSettingsClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (onNodeDataChange) {
        onNodeDataChange(id, { showSettings: !showSettings });
      }
      
      return false;
    };
    
    // Record toggle handler
    const handleRecordClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (onNodeDataChange) {
        onNodeDataChange(id, { recording: !recording });
      }
      
      return false;
    };
    
    // Clear logs handler
    const handleClearClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (onNodeDataChange) {
        onNodeDataChange(id, { logs: [] });
      }
      
      return false;
    };
    
    // Add event listeners to refs
    if (settingsButtonRef.current) {
      settingsButtonRef.current.addEventListener('mousedown', handleSettingsClick, { capture: true });
      settingsButtonRef.current.addEventListener('click', handleSettingsClick, { capture: true });
    }
    
    if (recordButtonRef.current) {
      recordButtonRef.current.addEventListener('mousedown', handleRecordClick, { capture: true });
      recordButtonRef.current.addEventListener('click', handleRecordClick, { capture: true });
    }
    
    if (clearButtonRef.current) {
      clearButtonRef.current.addEventListener('mousedown', handleClearClick, { capture: true });
      clearButtonRef.current.addEventListener('click', handleClearClick, { capture: true });
    }
    
    // Cleanup
    return () => {
      if (settingsButtonRef.current) {
        settingsButtonRef.current.removeEventListener('mousedown', handleSettingsClick);
        settingsButtonRef.current.removeEventListener('click', handleSettingsClick);
      }
      
      if (recordButtonRef.current) {
        recordButtonRef.current.removeEventListener('mousedown', handleRecordClick);
        recordButtonRef.current.removeEventListener('click', handleRecordClick);
      }
      
      if (clearButtonRef.current) {
        clearButtonRef.current.removeEventListener('mousedown', handleClearClick);
        clearButtonRef.current.removeEventListener('click', handleClearClick);
      }
    };
  }, [id, onNodeDataChange, showSettings, recording]);
  
  // Handle max entries change
  const handleMaxEntriesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      if (onNodeDataChange) {
        onNodeDataChange(id, { maxEntries: value });
      }
    }
  }, [id, onNodeDataChange]);
  
  // Handle unit change
  const handleUnitChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onNodeDataChange) {
      onNodeDataChange(id, { unit: e.target.value });
    }
  }, [id, onNodeDataChange]);

  return (
    <div 
      className={`px-4 py-4 shadow-md rounded-md bg-white border-2 ${
        selected ? 'border-blue-500' : data.connected ? 'border-green-400' : 'border-gray-300'
      } min-w-[200px]`}
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
              <label className="block text-gray-600 mb-1">Max Entries:</label>
              <input 
                type="number"
                min="1"
                value={maxEntries}
                onChange={handleMaxEntriesChange}
                className="w-full p-1 text-xs border rounded nodrag"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            <div className="mb-2">
              <label className="block text-gray-600 mb-1">Unit:</label>
              <input 
                type="text"
                value={unit}
                onChange={handleUnitChange}
                className="w-full p-1 text-xs border rounded nodrag"
                placeholder="e.g., m/s"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                ref={recordButtonRef}
                className={`px-2 py-1 rounded text-white text-xs nodrag ${
                  recording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                }`}
                type="button"
              >
                {recording ? 'Pause' : 'Record'}
              </button>
              
              <button
                ref={clearButtonRef}
                className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs nodrag"
                type="button"
              >
                Clear
              </button>
            </div>
          </div>
        )}
        
        {/* Log display */}
        <div className="p-2 bg-gray-100 rounded h-32 overflow-y-auto text-xs">
          {logs.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="py-1 px-2">Time</th>
                  <th className="py-1 px-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice().reverse().map((entry, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-1 px-2">{entry.time.toFixed(2)}s</td>
                    <td className="py-1 px-2 font-mono">
                      {typeof entry.value === 'number' 
                        ? entry.value.toFixed(2) 
                        : entry.value}
                      {unit && <span className="ml-1 text-gray-500">{unit}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No data recorded
            </div>
          )}
        </div>
        
        {/* Status indicators */}
        <div className="mt-2 flex justify-between text-xs">
          <span className={recording ? 'text-red-600' : 'text-gray-500'}>
            {recording ? '● Recording' : '○ Paused'}
          </span>
          <span className={data.connected ? 'text-green-600' : 'text-gray-500'}>
            {data.connected ? '● Connected' : '○ Not connected'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default withNodeDataHandling(LoggerNode);