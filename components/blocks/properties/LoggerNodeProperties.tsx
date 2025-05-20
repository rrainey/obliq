'use client';

import { useState, useEffect } from 'react';

interface LogEntry {
  time: number;
  value: number | string;
}

interface LoggerNodeData {
  label: string;
  description?: string;
  logs: LogEntry[];
  connected?: boolean;
  maxEntries?: number;
  recording?: boolean;
  unit?: string;
}

interface LoggerNodePropertiesProps {
  data: LoggerNodeData;
  onChange: (data: Partial<LoggerNodeData>) => void;
}

const LoggerNodeProperties: React.FC<LoggerNodePropertiesProps> = ({ data, onChange }) => {
  const [label, setLabel] = useState(data.label || 'Logger');
  const [description, setDescription] = useState(data.description || '');
  const [maxEntries, setMaxEntries] = useState(data.maxEntries || 100);
  const [recording, setRecording] = useState(data.recording !== false);
  const [unit, setUnit] = useState(data.unit || '');

  // Update local state when props change
  useEffect(() => {
    setLabel(data.label || 'Logger');
    setDescription(data.description || '');
    setMaxEntries(data.maxEntries || 100);
    setRecording(data.recording !== false);
    setUnit(data.unit || '');
  }, [data]);

  // Handle label change
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
    setLabel(newLabel);
    onChange({ label: newLabel });
  };

  // Handle description change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value;
    setDescription(newDescription);
    onChange({ description: newDescription });
  };

  // Handle max entries change
  const handleMaxEntriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setMaxEntries(value);
      onChange({ maxEntries: value });
    }
  };

  // Handle recording toggle
  const handleRecordingToggle = () => {
    const newRecording = !recording;
    setRecording(newRecording);
    onChange({ recording: newRecording });
  };

  // Handle clear logs
  const handleClearLogs = () => {
    onChange({ logs: [] });
  };

  // Handle unit change
  const handleUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUnit = e.target.value;
    setUnit(newUnit);
    onChange({ unit: newUnit });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Block Label</label>
        <input
          type="text"
          value={label}
          onChange={handleLabelChange}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={handleDescriptionChange}
          className="w-full p-2 border rounded h-20"
          placeholder="Optional description"
        />
      </div>

      <div className="pt-2 border-t border-gray-200 mt-2">
        <h3 className="font-medium mb-2">Logger Settings</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Entries</label>
          <input
            type="number"
            min="1"
            value={maxEntries}
            onChange={handleMaxEntriesChange}
            className="w-full p-2 border rounded"
          />
          <p className="text-sm text-gray-500 mt-1">Maximum number of data points to store</p>
        </div>

        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
          <input
            type="text"
            value={unit}
            onChange={handleUnitChange}
            className="w-full p-2 border rounded"
            placeholder="e.g., V, m/s, kg"
          />
        </div>

        <div className="mt-3 flex space-x-3">
          <button
            onClick={handleRecordingToggle}
            className={`px-3 py-2 rounded text-white text-sm ${
              recording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            }`}
            type="button"
          >
            {recording ? 'Pause Recording' : 'Start Recording'}
          </button>
          
          <button
            onClick={handleClearLogs}
            className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
            type="button"
          >
            Clear Logs
          </button>
        </div>

        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Connection Status</label>
          <div className={data.connected ? 'text-green-600' : 'text-gray-500'}>
            {data.connected ? '● Connected' : '○ Not connected'}
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-200 mt-2">
        <h3 className="font-medium mb-2">Log Data</h3>
        <div className="h-60 overflow-y-auto border rounded p-2">
          {data.logs && data.logs.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-1 px-2 text-left">Time</th>
                  <th className="py-1 px-2 text-left">Value</th>
                </tr>
              </thead>
              <tbody>
                {data.logs.slice().reverse().map((entry, index) => (
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
      </div>

      <div className="pt-2 border-t border-gray-200">
        <h3 className="font-medium mb-2">Block Info</h3>
        <p className="text-sm text-gray-600">
          The Logger block records the value of a signal over time during simulation.
          You can export the logged data for further analysis.
        </p>
      </div>
    </div>
  );
};

export default LoggerNodeProperties;