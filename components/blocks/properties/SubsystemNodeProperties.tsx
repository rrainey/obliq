'use client';

import { useState, useEffect } from 'react';

interface SubsystemNodeData {
  label: string;
  description?: string;
  sheetId?: string;
}

interface SubsystemNodePropertiesProps {
  data: SubsystemNodeData;
  onChange: (data: Partial<SubsystemNodeData>) => void;
}

const SubsystemNodeProperties: React.FC<SubsystemNodePropertiesProps> = ({ data, onChange }) => {
  const [label, setLabel] = useState(data.label || 'Subsystem');
  const [description, setDescription] = useState(data.description || '');

  // Update local state when props change
  useEffect(() => {
    setLabel(data.label || 'Subsystem');
    setDescription(data.description || '');
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
        <h3 className="font-medium mb-2">Subsystem Configuration</h3>
        
        <button
          type="button"
          className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Open Subsystem Editor
        </button>
        
        <p className="text-sm text-gray-600 mt-2">
          Edit the internal structure of this subsystem by opening the subsystem editor.
        </p>
      </div>

      <div className="pt-2 border-t border-gray-200">
        <h3 className="font-medium mb-2">Block Info</h3>
        <p className="text-sm text-gray-600">
          The Subsystem block allows you to create hierarchical models by encapsulating
          a group of blocks into a reusable component with defined inputs and outputs.
        </p>
      </div>
    </div>
  );
};

export default SubsystemNodeProperties;