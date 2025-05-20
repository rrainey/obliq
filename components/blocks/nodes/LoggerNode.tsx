'use client';

import { memo } from 'react';
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


const LoggerNode = ({ 
  data, 
  selected, 
  id, 
  isConnectable
}: NodeProps<LoggerNodeData>) => {
  // Default values
  const maxEntries = data.maxEntries || 100;
  const logs = data.logs || [];
  const unit = data.unit || '';
  const recording = data.recording !== false;
  const showSettings = data.showSettings ?? false;

  
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

export default memo(LoggerNode);