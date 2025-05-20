'use client';

import { useState, useEffect } from 'react';

interface InputPortNodeData {
  label: string;
  description?: string;
  value: number;
  name?: string;
  unit?: string;
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

  // Update local state when props change
  useEffect(() => {
    setLabel(data.label || 'Input');
    setDescription(data.description || '');
    setValue(data.value || 0);
    setName(data.name || '');
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
          <input
            type="number"
            value={value}
            onChange={handleValueChange}
            className="w-full p-2 border rounded"
            step="0.1"
          />
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
      </div>

      <div className="pt-2 border-t border-gray-200">
        <h3 className="font-medium mb-2">Block Info</h3>
        <p className="text-sm text-gray-600">
          The Input Port block provides a value to the model. It can be used to define constant
          inputs or external signals. In generated code, this will become a variable with the
          specified name.
        </p>
      </div>
    </div>
  );
};

export default InputPortNodeProperties;