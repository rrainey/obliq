'use client';

import { useState, useEffect } from 'react';

interface InputPortNodeData {
  label: string;
  description?: string;
  value: number;
  name?: string;
  unit?: string;
  inputType?: 'constant' | 'signal' | 'variable';
  variableName?: string;
  signalShape?: 'constant' | 'sine' | 'square' | 'ramp';
  signalPeriod?: number;
  signalAmplitude?: number;
  signalOffset?: number;
}

interface InputPortNodePropertiesProps {
  data: InputPortNodeData;
  onChange: (data: Partial<InputPortNodeData>) => void;
}

const InputPortNodeProperties: React.FC<InputPortNodePropertiesProps> = ({ data, onChange }) => {
  const [label, setLabel] = useState(data.label || 'Input');
  const [description, setDescription] = useState(data.description || '');
  const [value, setValue] = useState(data.value || 0);
  const [name, setName] = useState(data.name || '');
  const [unit, setUnit] = useState(data.unit || '');
  const [inputType, setInputType] = useState(data.inputType || 'constant');
  const [variableName, setVariableName] = useState(data.variableName || '');
  const [signalShape, setSignalShape] = useState(data.signalShape || 'constant');
  const [signalPeriod, setSignalPeriod] = useState(data.signalPeriod || 1);
  const [signalAmplitude, setSignalAmplitude] = useState(data.signalAmplitude || 1);
  const [signalOffset, setSignalOffset] = useState(data.signalOffset || 0);

  // Update local state when props change
  useEffect(() => {
    setLabel(data.label || 'Input');
    setDescription(data.description || '');
    setValue(data.value || 0);
    setName(data.name || '');
    setUnit(data.unit || '');
    setInputType(data.inputType || 'constant');
    setVariableName(data.variableName || '');
    setSignalShape(data.signalShape || 'constant');
    setSignalPeriod(data.signalPeriod || 1);
    setSignalAmplitude(data.signalAmplitude || 1);
    setSignalOffset(data.signalOffset || 0);
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

  // Handle input type change
  const handleInputTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as 'constant' | 'signal' | 'variable';
    setInputType(newType);
    onChange({ inputType: newType });
  };

  // Handle variable name change
  const handleVariableNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setVariableName(newName);
    onChange({ variableName: newName });
  };

  // Handle signal shape change
  const handleSignalShapeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newShape = e.target.value as 'constant' | 'sine' | 'square' | 'ramp';
    setSignalShape(newShape);
    onChange({ signalShape: newShape });
  };

  // Handle signal period change
  const handleSignalPeriodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPeriod = parseFloat(e.target.value) || 1;
    setSignalPeriod(newPeriod);
    onChange({ signalPeriod: newPeriod });
  };

  // Handle signal amplitude change
  const handleSignalAmplitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmplitude = parseFloat(e.target.value) || 1;
    setSignalAmplitude(newAmplitude);
    onChange({ signalAmplitude: newAmplitude });
  };

  // Handle signal offset change
  const handleSignalOffsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOffset = parseFloat(e.target.value) || 0;
    setSignalOffset(newOffset);
    onChange({ signalOffset: newOffset });
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
        <h3 className="font-medium mb-2">Input Settings</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Signal Name</label>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            className="w-full p-2 border rounded"
            placeholder="e.g., input_voltage"
          />
          <p className="text-sm text-gray-500 mt-1">Name used in generated code</p>
        </div>

        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Input Type</label>
          <select
            value={inputType}
            onChange={handleInputTypeChange}
            className="w-full p-2 border rounded"
          >
            <option value="constant">Constant Value</option>
            <option value="signal">Signal Generator</option>
            <option value="variable">Variable (External)</option>
          </select>
        </div>

        {inputType === 'constant' && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
            <div className="flex">
              <input
                type="number"
                value={value}
                onChange={handleValueChange}
                className="flex-grow p-2 border rounded-l"
                step="0.1"
              />
              <input
                type="text"
                value={unit}
                onChange={handleUnitChange}
                className="w-20 p-2 border border-l-0 rounded-r"
                placeholder="Unit"
              />
            </div>
          </div>
        )}

        {inputType === 'variable' && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Variable Name</label>
            <input
              type="text"
              value={variableName}
              onChange={handleVariableNameChange}
              className="w-full p-2 border rounded"
              placeholder="e.g., external_input"
            />
            <p className="text-sm text-gray-500 mt-1">Name of the external variable</p>
          </div>
        )}

        {inputType === 'signal' && (
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Signal Shape</label>
              <select
                value={signalShape}
                onChange={handleSignalShapeChange}
                className="w-full p-2 border rounded"
              >
                <option value="constant">Constant</option>
                <option value="sine">Sine Wave</option>
                <option value="square">Square Wave</option>
                <option value="ramp">Ramp</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period (seconds)</label>
              <input
                type="number"
                value={signalPeriod}
                onChange={handleSignalPeriodChange}
                className="w-full p-2 border rounded"
                step="0.1"
                min="0.1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amplitude</label>
              <input
                type="number"
                value={signalAmplitude}
                onChange={handleSignalAmplitudeChange}
                className="w-full p-2 border rounded"
                step="0.1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Offset</label>
              <input
                type="number"
                value={signalOffset}
                onChange={handleSignalOffsetChange}
                className="w-full p-2 border rounded"
                step="0.1"
              />
            </div>
            
            <div className="p-3 bg-gray-100 rounded">
              <div className="text-sm font-medium text-gray-700 mb-2">Signal Preview</div>
              <div className="h-20 bg-white border rounded p-2">
                {/* We'll just show a text description for now */}
                <div className="h-full flex items-center justify-center text-sm text-gray-500">
                  {signalShape === 'constant' && `Constant value: ${signalOffset}`}
                  {signalShape === 'sine' && `Sine wave: Amplitude ${signalAmplitude}, Period ${signalPeriod}s, Offset ${signalOffset}`}
                  {signalShape === 'square' && `Square wave: Amplitude ${signalAmplitude}, Period ${signalPeriod}s, Offset ${signalOffset}`}
                  {signalShape === 'ramp' && `Ramp: Slope ${signalAmplitude / signalPeriod}, Period ${signalPeriod}s, Offset ${signalOffset}`}
                </div>
              </div>
            </div>
          </div>
        )}

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
      </div>

      <div className="pt-2 border-t border-gray-200">
        <h3 className="font-medium mb-2">Block Info</h3>
        <p className="text-sm text-gray-600">
          The Input Port block provides a value to the model. It can be used to define constant
          inputs, generate test signals, or connect to external variables. In generated code, 
          this will become a variable with the specified name.
        </p>
      </div>
    </div>
  );
};

export default InputPortNodeProperties;