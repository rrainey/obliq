'use client';

import { useState, useEffect } from 'react';

interface DisplayNodeData {
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
}

interface DisplayNodePropertiesProps {
  data: DisplayNodeData;
  onChange: (data: Partial<DisplayNodeData>) => void;
}

const DisplayNodeProperties: React.FC<DisplayNodePropertiesProps> = ({ data, onChange }) => {
  const [label, setLabel] = useState(data.label || 'Display');
  const [description, setDescription] = useState(data.description || '');
  const [displayMode, setDisplayMode] = useState(data.displayMode || 'value');
  const [min, setMin] = useState(data.min ?? 0);
  const [max, setMax] = useState(data.max ?? 100);
  const [precision, setPrecision] = useState(data.precision ?? 2);
  const [showUnit, setShowUnit] = useState(data.showUnit ?? true);
  const [unit, setUnit] = useState(data.unit || '');

  // Update local state when props change
  useEffect(() => {
    setLabel(data.label || 'Display');
    setDescription(data.description || '');
    setDisplayMode(data.displayMode || 'value');
    setMin(data.min ?? 0);
    setMax(data.max ?? 100);
    setPrecision(data.precision ?? 2);
    setShowUnit(data.showUnit ?? true);
    setUnit(data.unit || '');
  }, [data]);

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

  // Handle display mode change
  const handleDisplayModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = e.target.value as 'value' | 'gauge' | 'indicator';
    setDisplayMode(newMode);
    onChange({ displayMode: newMode });
  };

  // Handle min change
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = parseFloat(e.target.value);
    setMin(newMin);
    onChange({ min: newMin });
  };

  // Handle max change
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = parseFloat(e.target.value);
    setMax(newMax);
    onChange({ max: newMax });
  };

  // Handle precision change
  const handlePrecisionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrecision = parseInt(e.target.value, 10);
    if (!isNaN(newPrecision) && newPrecision >= 0 && newPrecision <= 10) {
      setPrecision(newPrecision);
      onChange({ precision: newPrecision });
    }
  };

  // Handle show unit change
  const handleShowUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newShowUnit = e.target.checked;
    setShowUnit(newShowUnit);
    onChange({ showUnit: newShowUnit });
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
        <h3 className="font-medium mb-2">Display Settings</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Mode</label>
          <select
            value={displayMode}
            onChange={handleDisplayModeChange}
            className="w-full p-2 border rounded"
          >
            <option value="value">Value</option>
            <option value="gauge">Gauge</option>
            <option value="indicator">Indicator</option>
          </select>
        </div>

        {displayMode === 'gauge' && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Value</label>
              <input
                type="number"
                value={min}
                onChange={handleMinChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Value</label>
              <input
                type="number"
                value={max}
                onChange={handleMaxChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        )}

        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Decimal Precision</label>
          <input
            type="number"
            min="0"
            max="10"
            value={precision}
            onChange={handlePrecisionChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
          <div className="flex">
            <input
              type="text"
              value={unit}
              onChange={handleUnitChange}
              className="flex-grow p-2 border rounded-l"
              placeholder="e.g., V, m/s, kg"
            />
            <div className="flex items-center px-3 border border-l-0 rounded-r">
              <input
                type="checkbox"
                checked={showUnit}
                onChange={handleShowUnitChange}
                className="mr-2"
              />
              <span className="text-sm">Show</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-200 mt-2">
        <h3 className="font-medium mb-2">Preview</h3>
        
        {displayMode === 'value' && (
          <div className="p-3 bg-gray-100 rounded text-center">
            <div className="text-lg font-mono">
              {formattedValue()}
              {showUnit && unit && <span className="text-xs ml-1 text-gray-500">{unit}</span>}
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
                {showUnit && unit && <span className="ml-1 text-gray-500">{unit}</span>}
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
                  {showUnit && unit && <span className="text-xs ml-1 text-gray-500">{unit}</span>}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No value</div>
            )}
          </div>
        )}

        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Connection Status</label>
          <div className={data.connected ? 'text-green-600' : 'text-gray-500'}>
            {data.connected ? '● Connected' : '○ Not connected'}
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-200">
        <h3 className="font-medium mb-2">Block Info</h3>
        <p className="text-sm text-gray-600">
          The Display block shows the value of a signal in real-time during simulation.
          You can configure the appearance and formatting of the displayed value.
        </p>
      </div>
    </div>
  );
};

export default DisplayNodeProperties;