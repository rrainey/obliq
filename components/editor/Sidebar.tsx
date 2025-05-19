'use client';

import { useState, useMemo } from 'react';
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

// Flatten all blocks for search
const allBlocks = blockCategories.flatMap(category => 
  category.items.map(block => ({
    ...block,
    category: category.name
  }))
);

export default function Sidebar() {
  // State for search and category expansion
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Toggle category collapse/expand
  const toggleCategory = (categoryName: string) => {
    if (activeCategory === categoryName) {
      setActiveCategory(null);
    } else {
      setActiveCategory(categoryName);
    }
  };

  // Filter blocks based on search term
  const filteredBlocks = useMemo(() => {
    if (!searchTerm.trim()) return null; // No search term, use categories

    return allBlocks.filter(block => 
      block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Track the block being dragged
  const onDragStart = (event: React.DragEvent, blockType: string) => {
    // Set the block type as drag data
    event.dataTransfer.setData('application/reactflow', blockType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Render a block item (used in both search results and category lists)
  const renderBlockItem = (block: typeof allBlocks[0]) => (
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
  );

  return (
    <aside className="w-64 bg-gray-100 p-4 border-r overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Blocks</h2>
      
      {/* Search box */}
      <div className="mb-4">
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Search blocks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Search results */}
      {filteredBlocks && (
        <div className="mb-4">
          <h3 className="font-medium text-sm text-gray-600 mb-2">Search Results</h3>
          {filteredBlocks.length > 0 ? (
            <div className="space-y-2">
              {filteredBlocks.map(block => renderBlockItem(block))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No blocks found</p>
          )}
        </div>
      )}
      
      {/* Categorized blocks (shown when not searching) */}
      {!filteredBlocks && (
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
                  {category.items.map(block => renderBlockItem({...block, category: category.name}))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}