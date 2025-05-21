// components/blocks/properties/SumNodeProperties.tsx
'use client';

import { useState, useEffect } from 'react';

interface SumNodeData {
  label: string;
  description?: string;
  inputCount: number;
  // New properties
  operationType?: 'sum' | 'difference'; // Allow choosing between sum and difference
  showInputLabels?: boolean;
}

interface SumNodePropertiesProps {
  data: SumNodeData;
  onChange: (data: Partial<SumNodeData>) => void;
}

const SumNodeProperties: React.FC<SumNodePropertiesProps> = ({ data, onChange }) => {
  const [label, setLabel] = useState(data.label || 'Sum');
  const [description, setDescription] = useState(data.description || '');
  const [inputCount, setInputCount] = useState(data.inputCount || 2);
  const [operationType, setOperationType] = useState(data.operationType || 'sum');
  const [showInputLabels, setShowInputLabels] = useState(data.showInputLabels ?? true);

  // Update local state when props change
  useEffect(() => {
    setLabel(data.label || 'Sum');
    setDescription(data.description || '');
    setInputCount(data.inputCount || 2);
    setOperationType(data.operationType || 'sum');
    setShowInputLabels(data.showInputLabels ?? true);
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

  // Handle operation type change
  const handleOperationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as 'sum' | 'difference';
    setOperationType(newType);
    onChange({ operationType: newType });
  };

  // Handle show input labels change
  const handleShowInputLabelsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setShowInputLabels(newValue);
    onChange({ showInputLabels: newValue });
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
        <h3 className="font-medium mb-2">Operation Settings</h3>
        
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

        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Operation Type</label>
          <select
            value={operationType}
            onChange={handleOperationTypeChange}
            className="w-full p-2 border rounded"
          >
            <option value="sum">Sum (Add all inputs)</option>
            <option value="difference">Difference (Subtract from first input)</option>
          </select>
          {operationType === 'difference' && (
            <p className="text-sm text-gray-500 mt-1">
              Output = First input - (Sum of all other inputs)
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center">
          <input
            type="checkbox"
            id="showInputLabels"
            checked={showInputLabels}
            onChange={handleShowInputLabelsChange}
            className="mr-2"
          />
          <label htmlFor="showInputLabels" className="text-sm font-medium text-gray-700">
            Show Input Labels
          </label>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-200">
        <h3 className="font-medium mb-2">Operation Preview</h3>
        <div className="p-3 bg-gray-100 rounded">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="font-mono bg-white p-2 rounded border">
                {operationType === 'sum' 
                  ? `output = in1 + in2 ${inputCount > 2 ? '+ ...' : ''}`
                  : `output = in1 - in2 ${inputCount > 2 ? '- ...' : ''}`
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-200">
        <h3 className="font-medium mb-2">Block Info</h3>
        <p className="text-sm text-gray-600">
          {operationType === 'sum'
            ? `The Sum block adds all ${inputCount} input values and outputs the result.`
            : `The Difference block subtracts the sum of inputs 2 to ${inputCount} from the first input.`
          }
        </p>
      </div>
    </div>
  );
};

export default SumNodeProperties;