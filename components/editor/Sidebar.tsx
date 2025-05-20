'use client';

import { useState } from 'react';
import BlockIcon from '@/components/blocks/BlockIcon';

// Define block types and metadata
const blockCategories = [
  {
    name: 'Basic',
    items: [
      { id: 'sum', name: 'Sum', description: 'Add two or more inputs' },
      { id: 'multiply', name: 'Multiply', description: 'Multiply two or more inputs' },
    ],
  },
  {
    name: 'Ports',
    items: [
      { id: 'inputPort', name: 'Input Port', description: 'Define an input to the model' },
      { id: 'outputPort', name: 'Output Port', description: 'Define an output from the model' },
    ],
  },
  {
    name: 'Dynamic',
    items: [
      { id: 'transferFunction', name: 'Transfer Function', description: 'Apply a transfer function to the input' },
    ],
  },
  {
    name: 'Visualization',
    items: [
      { id: 'display', name: 'Display', description: 'Show the value of a signal' },
      { id: 'logger', name: 'Logger', description: 'Log signal values over time' },
    ],
  },
  {
    name: 'Advanced',
    items: [
      { id: 'subsystem', name: 'Subsystem', description: 'Create a hierarchical model' },
    ],
  },
];

export default function Sidebar() {
  // Track active category for collapsible sections
  const [activeCategory, setActiveCategory] = useState<string | null>(blockCategories[0].name);

  // Toggle category collapse/expand
  const toggleCategory = (categoryName: string) => {
    if (activeCategory === categoryName) {
      setActiveCategory(null);
    } else {
      setActiveCategory(categoryName);
    }
  };

  // Track the block being dragged - this is critical
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, blockType: string) => {
    console.log(`Dragging started: ${blockType}`); // Add logging
    
    // Set the block type as drag data - ensure this format matches what Canvas expects
    event.dataTransfer.setData('application/reactflow', blockType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-gray-100 p-4 border-r overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Blocks</h2>
      
      <div className="space-y-2">
        {blockCategories.map((category) => (
          <div key={category.name} className="mb-2">
            <button
              className="w-full flex items-center justify-between bg-gray-200 p-2 rounded text-left font-medium text-gray-700 hover:bg-gray-300"
              onClick={() => toggleCategory(category.name)}
            >
              <span>{category.name}</span>
              <span>{activeCategory === category.name ? '−' : '+'}</span>
            </button>
            
            {activeCategory === category.name && (
              <div className="mt-2 space-y-2">
                {category.items.map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center bg-white p-2 border border-gray-300 rounded cursor-move hover:bg-gray-50 shadow-sm"
                    draggable
                    onDragStart={(event) => onDragStart(event, block.id)}
                    title={block.description}
                  >
                    <div className="mr-3">
                      <BlockIcon type={block.id} />
                    </div>
                    <div>
                      <div className="font-medium">{block.name}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[160px]">
                        {block.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}