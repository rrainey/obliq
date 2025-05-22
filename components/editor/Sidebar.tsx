// components/editor/Sidebar.tsx - Updated with Source node
'use client';

import { useState } from 'react';

interface BlockType {
  id: string;
  label: string;
  description: string;
  category: 'input_output' | 'math' | 'control' | 'display' | 'structure';
  color: string;
}

const blockTypes: BlockType[] = [
  // Input/Output blocks
  {
    id: 'inputPort',
    label: 'Input Port',
    description: 'External input interface',
    category: 'input_output',
    color: 'bg-green-100 border-green-400 text-green-800'
  },
  {
    id: 'source',
    label: 'Source',
    description: 'Internal signal generator',
    category: 'input_output', 
    color: 'bg-amber-100 border-amber-400 text-amber-800'
  },
  {
    id: 'outputPort',
    label: 'Output Port',
    description: 'External output interface',
    category: 'input_output',
    color: 'bg-red-100 border-red-400 text-red-800'
  },
  
  // Math blocks
  {
    id: 'sum',
    label: 'Sum',
    description: 'Add or subtract signals',
    category: 'math',
    color: 'bg-blue-100 border-blue-400 text-blue-800'
  },
  {
    id: 'multiply',
    label: 'Multiply',
    description: 'Multiply or divide signals',
    category: 'math',
    color: 'bg-blue-100 border-blue-400 text-blue-800'
  },
  
  // Control blocks
  {
    id: 'transferFunction',
    label: 'Transfer Function',
    description: 'Linear dynamic system',
    category: 'control',
    color: 'bg-purple-100 border-purple-400 text-purple-800'
  },
  
  // Display blocks
  {
    id: 'display',
    label: 'Display',
    description: 'Show signal value',
    category: 'display',
    color: 'bg-gray-100 border-gray-400 text-gray-800'
  },
  {
    id: 'logger',
    label: 'Logger',
    description: 'Record signal history',
    category: 'display',
    color: 'bg-gray-100 border-gray-400 text-gray-800'
  },
  
  // Structure blocks
  {
    id: 'subsystem',
    label: 'Subsystem',
    description: 'Hierarchical block container',
    category: 'structure',
    color: 'bg-indigo-100 border-indigo-400 text-indigo-800'
  }
];

const categoryNames = {
  input_output: 'Input/Output',
  math: 'Math Operations',
  control: 'Control Systems',
  display: 'Display & Logging',
  structure: 'Structure'
};

export default function Sidebar() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Handle drag start
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, blockType: string) => {
    event.dataTransfer.setData('application/reactflow', blockType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Group blocks by category
  const blocksByCategory = blockTypes.reduce((acc, block) => {
    if (!acc[block.category]) {
      acc[block.category] = [];
    }
    acc[block.category].push(block);
    return acc;
  }, {} as Record<string, BlockType[]>);

  const filteredBlocks = selectedCategory 
    ? blocksByCategory[selectedCategory] || []
    : blockTypes;

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-300 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-300">
        <h2 className="text-lg font-semibold text-gray-900">Block Library</h2>
        <p className="text-sm text-gray-600 mt-1">Drag blocks onto the canvas</p>
      </div>

      {/* Category filter */}
      <div className="p-3 border-b border-gray-200">
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="w-full p-2 border rounded text-gray-900 text-sm"
        >
          <option value="">All Categories</option>
          {Object.entries(categoryNames).map(([key, name]) => (
            <option key={key} value={key}>{name}</option>
          ))}
        </select>
      </div>

      {/* Block list */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {filteredBlocks.map((block) => (
            <div
              key={block.id}
              className={`p-3 border-2 border-dashed rounded cursor-move hover:shadow-md transition-shadow ${block.color}`}
              draggable
              onDragStart={(e) => handleDragStart(e, block.id)}
            >
              <div className="font-medium text-sm">{block.label}</div>
              <div className="text-xs mt-1 opacity-80">{block.description}</div>
            </div>
          ))}
        </div>
        
        {filteredBlocks.length === 0 && (
          <div className="text-center text-gray-500 mt-4">
            <p className="text-sm">No blocks in this category</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200">
        <div className="text-xs text-gray-600">
          <div>Total blocks: {blockTypes.length}</div>
          <div>Categories: {Object.keys(categoryNames).length}</div>
        </div>
      </div>
    </div>
  );
}