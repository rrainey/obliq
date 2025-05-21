'use client';

import { useState, useEffect } from 'react';

interface OutputPortNodeData {
  label: string;
  description?: string;
  name?: string;
  unit?: string;
  value?: number | null;
  connected?: boolean;
  exportEnabled?: boolean;
  exportFormat?: 'none' | 'csv' | 'json';
  exportFilename?: string;
  history?: Array<{ time: number, value: number }>;
  historyMaxLength?: number;
}

interface OutputPortNodePropertiesProps {
  data: OutputPortNodeData;
  onChange: (data: Partial<OutputPortNodeData>) => void;
}

const OutputPortNodeProperties: React.FC<OutputPortNodePropertiesProps> = ({ data, onChange }) => {
  const [label, setLabel] = useState(data.label || 'Output');
  const [description, setDescription] = useState(data.description || '');
  const [name, setName] = useState(data.name || '');
  const [unit, setUnit] = useState(data.unit || '');
  const [exportEnabled, setExportEnabled] = useState(data.exportEnabled || false);
  const [exportFormat, setExportFormat] = useState(data.exportFormat || 'csv');
  const [exportFilename, setExportFilename] = useState(data.exportFilename || 'output_data');
  const [historyMaxLength, setHistoryMaxLength] = useState(data.historyMaxLength || 1000);

  // Update local state when props change
  useEffect(() => {
    setLabel(data.label || 'Output');
    setDescription(data.description || '');
    setName(data.name || '');
    setUnit(data.unit || '');
    setExportEnabled(data.exportEnabled || false);
    setExportFormat(data.exportFormat || 'csv');
    setExportFilename(data.exportFilename || 'output_data');
    setHistoryMaxLength(data.historyMaxLength || 1000);
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

  // Handle name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    onChange({ name: newName });
  };

  // Handle unit change
  const handleUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUnit = e.target.value;
    setUnit(newUnit);
    onChange({ unit: newUnit });
  };

  // Handle export enabled change
  const handleExportEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setExportEnabled(newValue);
    onChange({ exportEnabled: newValue });
  };

  // Handle export format change
  const handleExportFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFormat = e.target.value as 'none' | 'csv' | 'json';
    setExportFormat(newFormat);
    onChange({ exportFormat: newFormat });
  };

  // Handle export filename change
  const handleExportFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilename = e.target.value;
    setExportFilename(newFilename);
    onChange({ exportFilename: newFilename });
  };

  // Handle history max length change
  const handleHistoryMaxLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLength = parseInt(e.target.value, 10);
    if (!isNaN(newLength) && newLength > 0) {
      setHistoryMaxLength(newLength);
      onChange({ historyMaxLength: newLength });
    }
  };

  // Handle clear history
  const handleClearHistory = () => {
    onChange({ history: [] });
  };

  // Handle download history
  const handleDownloadHistory = () => {
    // In a real implementation, this would generate a file for download
    // For now, we'll just show an alert
    alert('Download functionality will be implemented in the simulation engine');
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
        <h3 className="font-medium mb-2">Output Settings</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Signal Name</label>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            className="w-full p-2 border rounded"
            placeholder="e.g., output_voltage"
          />
          <p className="text-sm text-gray-500 mt-1">Name used in generated code</p>
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

        {data.value !== undefined && data.value !== null && (
          <div className="mt-3 p-3 bg-gray-100 rounded">
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
            <div className="font-mono">{data.value}</div>
          </div>
        )}

        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Connection Status</label>
          <div className={data.connected ? 'text-green-600' : 'text-gray-500'}>
            {data.connected ? '● Connected' : '○ Not connected'}
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-200 mt-2">
        <h3 className="font-medium mb-2">Data Export Settings</h3>
        
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            id="exportEnabled"
            checked={exportEnabled}
            onChange={handleExportEnabledChange}
            className="mr-2"
          />
          <label htmlFor="exportEnabled" className="text-sm font-medium text-gray-700">
            Enable Data Export
          </label>
        </div>
        
        {exportEnabled && (
          <>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Export Format</label>
              <select
                value={exportFormat}
                onChange={handleExportFormatChange}
                className="w-full p-2 border rounded"
              >
                <option value="csv">CSV (Comma Separated Values)</option>
                <option value="json">JSON (JavaScript Object Notation)</option>
              </select>
            </div>
            
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filename</label>
              <input
                type="text"
                value={exportFilename}
                onChange={handleExportFilenameChange}
                className="w-full p-2 border rounded"
                placeholder="e.g., output_data"
              />
              <p className="text-sm text-gray-500 mt-1">
                Extension ({exportFormat}) will be added automatically
              </p>
            </div>
            
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max History Length
              </label>
              <input
                type="number"
                value={historyMaxLength}
                onChange={handleHistoryMaxLengthChange}
                className="w-full p-2 border rounded"
                min="1"
                step="100"
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum number of data points to store
              </p>
            </div>
            
            <div className="mt-3 flex space-x-2">
              <button
                type="button"
                onClick={handleClearHistory}
                className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
              >
                Clear History
              </button>
              
              <button
                type="button"
                onClick={handleDownloadHistory}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                disabled={!data.history || data.history.length === 0}
              >
                Download Data
              </button>
            </div>
          </>
        )}
      </div>

      {data.history && data.history.length > 0 && (
        <div className="pt-2 border-t border-gray-200 mt-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">History Data</h3>
            <span className="text-xs text-gray-500">
              {data.history.length} points
            </span>
          </div>
          
          <div className="h-40 overflow-y-auto border rounded p-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-1 px-2 text-left">Time</th>
                  <th className="py-1 px-2 text-left">Value</th>
                </tr>
              </thead>
              <tbody>
                {data.history.slice(-10).map((entry, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-1 px-2">{entry.time.toFixed(3)}s</td>
                    <td className="py-1 px-2 font-mono">
                      {typeof entry.value === 'number' 
                        ? entry.value.toFixed(4) 
                        : entry.value}
                      {unit && <span className="ml-1 text-gray-500">{unit}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Showing the most recent 10 data points
          </p>
        </div>
      )}

      <div className="pt-2 border-t border-gray-200">
        <h3 className="font-medium mb-2">Block Info</h3>
        <p className="text-sm text-gray-600">
          The Output Port block represents a terminal output from the model. It can be used to
          observe and export values during simulation. In generated code, this will become a 
          variable with the specified name.
        </p>
      </div>
    </div>
  );
};

export default OutputPortNodeProperties;