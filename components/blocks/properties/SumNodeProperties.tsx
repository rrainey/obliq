'use client';

import { useState, useEffect } from 'react';

interface SumNodeData {
  label: string;
  description?: string;
  inputCount: number;
}

interface SumNodePropertiesProps {
  data: SumNodeData;
  onChange: (data: Partial<SumNodeData>) => void;
}

const SumNodeProperties: React.FC<SumNodePropertiesProps> = ({ data, onChange }) => {
  const [label, setLabel] = useState(data.label || 'Sum');
  const [description, setDescription] = useState(data.description || '');
  const [inputCount, setInputCount] = useState(data.inputCount || 2);

  // Update local state when props change
  useEffect(() => {
    setLabel(data.label || 'Sum');
    setDescription(data.description || '');
    setInputCount(data.inputCount || 2);
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

  // Handle input count change
  const handleInputCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCount = parseInt(e.target.value, 10);
    if (!isNaN(newCount) && newCount >= 2) {
      setInputCount(newCount);
      onChange({ inputCount: newCount });
    }
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Inputs</label>
        <input
          type="number"
          min="2"
          value={inputCount}
          onChange={handleInputCountChange}
          className="w-full p-2 border rounded"
        />
        <p className="text-sm text-gray-500 mt-1">Minimum: 2 inputs</p>
      </div>

      <div className="pt-2 border-t border-gray-200">
        <h3 className="font-medium mb-2">Block Info</h3>
        <p className="text-sm text-gray-600">
          The Sum block adds all input values and outputs the result. Connect multiple signals to the
          inputs and the sum will be sent to the output.
        </p>
      </div>
    </div>
  );
};

export default SumNodeProperties;