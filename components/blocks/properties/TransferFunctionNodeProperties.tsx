'use client';

import { useState, useEffect } from 'react';

interface TransferFunctionNodeData {
  label: string;
  description?: string;
  numerator: string;
  denominator: string;
}

interface TransferFunctionNodePropertiesProps {
  data: TransferFunctionNodeData;
  onChange: (data: Partial<TransferFunctionNodeData>) => void;
}

const TransferFunctionNodeProperties: React.FC<TransferFunctionNodePropertiesProps> = ({ data, onChange }) => {
  const [label, setLabel] = useState(data.label || 'Transfer Function');
  const [description, setDescription] = useState(data.description || '');
  const [numerator, setNumerator] = useState(data.numerator || '1');
  const [denominator, setDenominator] = useState(data.denominator || '1,1');

  // Update local state when props change
  useEffect(() => {
    setLabel(data.label || 'Transfer Function');
    setDescription(data.description || '');
    setNumerator(data.numerator || '1');
    setDenominator(data.denominator || '1,1');
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

  // Handle numerator change
  const handleNumeratorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumerator = e.target.value;
    setNumerator(newNumerator);
    onChange({ numerator: newNumerator });
  };

  // Handle denominator change
  const handleDenominatorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDenominator = e.target.value;
    setDenominator(newDenominator);
    onChange({ denominator: newDenominator });
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
        <h3 className="font-medium mb-2">Transfer Function Configuration</h3>
        
        <div className="p-4 bg-gray-100 rounded">
          <div className="flex justify-center items-center">
            <div className="text-center px-6">
              <div className="border-b-2 border-black mb-1">
                <input
                  type="text"
                  value={numerator}
                  onChange={handleNumeratorChange}
                  className="w-full p-1 text-center border rounded mb-1"
                  placeholder="e.g., 1"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={denominator}
                  onChange={handleDenominatorChange}
                  className="w-full p-1 text-center border rounded mt-1"
                  placeholder="e.g., 1,1"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-3">
          <p className="text-sm text-gray-600">
            <strong>Format:</strong> Enter coefficients separated by commas.
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <strong>Example:</strong> For transfer function (s + 2) / (s² + 3s + 2), enter "1,2" for numerator and "1,3,2" for denominator.
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-200">
        <h3 className="font-medium mb-2">Block Info</h3>
        <p className="text-sm text-gray-600">
          The Transfer Function block implements a discrete-time transfer function.
          It can represent dynamic systems like filters, controllers, and physical processes.
        </p>
      </div>
    </div>
  );
};

export default TransferFunctionNodeProperties;