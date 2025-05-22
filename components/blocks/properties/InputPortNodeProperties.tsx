// components/blocks/properties/InputPortNodeProperties.tsx - Refactored
'use client';

import { useState, useEffect } from 'react';

interface InputPortBlockData {
  label: string;
  description?: string;
  name: string;
  unit?: string;
  defaultValue?: number;
}

interface InputPortNodePropertiesProps {
  data: InputPortBlockData;
  onChange: (data: Partial<InputPortBlockData>) => void;
}

const InputPortNodeProperties: React.FC<InputPortNodePropertiesProps> = ({ data, onChange }) => {
  const [label, setLabel] = useState(data.label || 'Input');
  const [description, setDescription] = useState(data.description || '');
  const [name, setName] = useState(data.name || '');
  const [unit, setUnit] = useState(data.unit || '');
  const [defaultValue, setDefaultValue] = useState(data.defaultValue || 0);

  // Update local state when props change
  useEffect(() => {
    setLabel(data.label || 'Input');
    setDescription(data.description || '');
    setName(data.name || '');
    setUnit(data.unit || '');
    setDefaultValue(data.defaultValue || 0);
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

  // Handle default value change
  const handleDefaultValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    setDefaultValue(newValue);
    onChange({ defaultValue: newValue });
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
        <h3 className="font-semibold text-gray-900 mb-2">Input Port Settings</h3>
        
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Input Name</label>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            className="w-full p-2 border rounded text-gray-900"
            placeholder="e.g., velocity, temperature"
            required
          />
          <p className="text-sm text-gray-700 mt-1 font-medium">
            Name used for external interface and generated code
          </p>
        </div>

        <div className="mt-3">
          <label className="block text-sm font-semibold text-gray-900 mb-1">Unit</label>
          <input
            type="text"
            value={unit}
            onChange={handleUnitChange}
            className="w-full p-2 border rounded text-gray-900"
            placeholder="e.g., m/s, °C, V"
          />
        </div>

        <div className="mt-3">
          <label className="block text-sm font-semibold text-gray-900 mb-1">Default Value</label>
          <input
            type="number"
            value={defaultValue}
            onChange={handleDefaultValueChange}
            className="w-full p-2 border rounded text-gray-900"
            step="0.1"
          />
          <p className="text-sm text-gray-700 mt-1 font-medium">
            Value used when no external input is connected
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">Block Info</h3>
        <p className="text-sm text-gray-700 font-medium">
          The Input Port block defines an external input to your model or subsystem. 
          On the main sheet, this represents a signal coming from outside the model. 
          Inside a subsystem, this creates an input connector on the subsystem block.
        </p>
      </div>
    </div>
  );
};

export default InputPortNodeProperties;