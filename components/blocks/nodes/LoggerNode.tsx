'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Position, NodeProps, Handle } from 'reactflow';

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

  // Animation state for new log entries
  const [newEntryAnimation, setNewEntryAnimation] = useState(false);
  const logLength = useRef(logs.length);
  
  // Animate when new log entry arrives
  useEffect(() => {
    if (logs.length > logLength.current) {
      setNewEntryAnimation(true);
      const timeout = setTimeout(() => {
        setNewEntryAnimation(false);
      }, 300);
      logLength.current = logs.length;
      return () => clearTimeout(timeout);
    }
  }, [logs.length]);
  
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

      {/* Block header */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">{data.label}</div>
        <div className={`text-xs px-2 py-1 rounded ${
          recording ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {recording ? 'Recording' : 'Paused'}
        </div>
      </div>

      {/* Block content */}
      <div className="flex flex-col">
        
        {/* Log display */}
        <div className={`p-2 bg-gray-100 rounded h-32 overflow-y-auto text-xs transition-colors duration-300 ${
          newEntryAnimation ? 'bg-yellow-50' : 'bg-gray-100'
        }`}>
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
                  <tr key={index} className={`border-b border-gray-200 ${
                    index === 0 && newEntryAnimation ? 'bg-yellow-100' : ''
                  }`}>
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
        
        {/* Entry count */}
        <div className="mt-1 text-xs text-gray-500 text-right">
          {logs.length} entries
        </div>
      </div>
    </div>
  );
};

export default memo(LoggerNode);