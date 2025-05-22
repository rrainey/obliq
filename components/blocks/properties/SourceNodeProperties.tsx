// components/blocks/properties/SourceNodeProperties.tsx
'use client';

import { useState, useEffect } from 'react';

interface SourceBlockData {
  label: string;
  description?: string;
  value: number;
  name?: string;
  unit?: string;
  sourceType?: 'constant' | 'sine';
  // Sine wave parameters
  amplitude?: number;
  frequency?: number; // Hz
  phase?: number; // radians
  offset?: number;
}

interface SourceNodePropertiesProps {
  data: SourceBlockData;
  onChange: (data: Partial<SourceBlockData>) => void;
}

const SourceNodeProperties: React.FC<SourceNodePropertiesProps> = ({ data, onChange }) => {
  const [label, setLabel] = useState(data.label || 'Source');
  const [description, setDescription] = useState(data.description || '');
  const [value, setValue] = useState(data.value || 0);
  const [name, setName] = useState(data.name || '');
  const [unit, setUnit] = useState(data.unit || '');
  const [sourceType, setSourceType] = useState(data.sourceType || 'constant');
  const [amplitude, setAmplitude] = useState(data.amplitude || 1);
  const [frequency, setFrequency] = useState(data.frequency || 1);
  const [phase, setPhase] = useState(data.phase || 0);
  const [offset, setOffset] = useState(data.offset || 0);

  // Update local state when props change
  useEffect(() => {
    setLabel(data.label || 'Source');
    setDescription(data.description || '');
    setValue(data.value || 0);
    setName(data.name || '');
    setUnit(data.unit || '');
    setSourceType(data.sourceType || 'constant');
    setAmplitude(data.amplitude || 1);
    setFrequency(data.frequency || 1);
    setPhase(data.phase || 0);
    setOffset(data.offset || 0);
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

  // Handle value change
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    setValue(newValue);
    onChange({ value: newValue });
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

  // Handle source type change
  const handleSourceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as 'constant' | 'sine';
    setSourceType(newType);
    onChange({ sourceType: newType });
  };

  // Handle amplitude change
  const handleAmplitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmplitude = parseFloat(e.target.value) || 1;
    setAmplitude(newAmplitude);
    onChange({ amplitude: newAmplitude });
  };

  // Handle frequency change
  const handleFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFrequency = parseFloat(e.target.value) || 1;
    setFrequency(newFrequency);
    onChange({ frequency: newFrequency });
  };

  // Handle phase change
  const handlePhaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhase = parseFloat(e.target.value) || 0;
    setPhase(newPhase);
    onChange({ phase: newPhase });
  };

  // Handle offset change
  const handleOffsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOffset = parseFloat(e.target.value) || 0;
    setOffset(newOffset);
    onChange({ offset: newOffset });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1">Block Label</label>
        <input
          type="text"
          value={label}
          onChange={handleLabelChange}
          className="w-full p-2 border rounded text-gray-900"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1">Description</label>
        <textarea
          value={description}
          onChange={handleDescriptionChange}
          className="w-full p-2 border rounded h-20 text-gray-900"
          placeholder="Optional description"
        />
      </div>

      <div className="pt-2 border-t border-gray-200 mt-2">
        <h3 className="font-semibold text-gray-900 mb-2">Source Settings</h3>
        
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Signal Name</label>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            className="w-full p-2 border rounded text-gray-900"
            placeholder="e.g., reference_signal"
          />
          <p className="text-sm text-gray-700 mt-1 font-medium">Name used in generated code</p>
        </div>

        <div className="mt-3">
          <label className="block text-sm font-semibold text-gray-900 mb-1">Source Type</label>
          <select
            value={sourceType}
            onChange={handleSourceTypeChange}
            className="w-full p-2 border rounded text-gray-900"
          >
            <option value="constant">Constant Value</option>
            <option value="sine">Sine Wave</option>
          </select>
        </div>

        {sourceType === 'constant' && (
          <div className="mt-3">
            <label className="block text-sm font-semibold text-gray-900 mb-1">Value</label>
            <div className="flex">
              <input
                type="number"
                value={value}
                onChange={handleValueChange}
                className="flex-grow p-2 border rounded-l text-gray-900"
                step="0.1"
              />
              <input
                type="text"
                value={unit}
                onChange={handleUnitChange}
                className="w-20 p-2 border border-l-0 rounded-r text-gray-900"
                placeholder="Unit"
              />
            </div>
          </div>
        )}

        {sourceType === 'sine' && (
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Amplitude</label>
              <div className="flex">
                <input
                  type="number"
                  value={amplitude}
                  onChange={handleAmplitudeChange}
                  className="flex-grow p-2 border rounded-l text-gray-900"
                  step="0.1"
                />
                <input
                  type="text"
                  value={unit}
                  onChange={handleUnitChange}
                  className="w-20 p-2 border border-l-0 rounded-r text-gray-900"
                  placeholder="Unit"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Frequency (Hz)</label>
              <input
                type="number"
                value={frequency}
                onChange={handleFrequencyChange}
                className="w-full p-2 border rounded text-gray-900"
                step="0.1"
                min="0.001"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Phase (radians)</label>
              <input
                type="number"
                value={phase}
                onChange={handlePhaseChange}
                className="w-full p-2 border rounded text-gray-900"
                step="0.1"
              />
              <p className="text-sm text-gray-700 mt-1">0 = cosine, π/2 = sine</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">DC Offset</label>
              <input
                type="number"
                value={offset}
                onChange={handleOffsetChange}
                className="w-full p-2 border rounded text-gray-900"
                step="0.1"
              />
            </div>
            
            <div className="p-3 bg-gray-100 rounded">
              <div className="text-sm font-semibold text-gray-900 mb-2">Signal Preview</div>
              <div className="h-20 bg-white border rounded p-2">
                <div className="h-full flex items-center justify-center text-sm text-gray-700 font-medium">
                  y(t) = {amplitude} × sin(2π × {frequency} × t + {phase}) + {offset}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">Block Info</h3>
        <p className="text-sm text-gray-700 font-medium">
          The Source block generates internal signals for your model. It can provide constant 
          values or time-varying signals like sine waves. Use this for reference signals, 
          test inputs, or any internally generated values.
        </p>
      </div>
    </div>
  );
};

export default SourceNodeProperties;