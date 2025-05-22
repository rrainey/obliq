// components/blocks/properties/SubsystemNodeProperties.tsx - Enhanced
'use client';

import { useState, useEffect } from 'react';
import { Sheet, analyzeSubsystemHandles, createId } from '@/lib/models/modelSchema';

interface SubsystemBlockData {
  label: string;
  description?: string;
  sheet?: Sheet;
  inputHandles?: Array<{ id: string; name: string; unit?: string }>;
  outputHandles?: Array<{ id: string; name: string; unit?: string }>;
}

interface SubsystemNodePropertiesProps {
  data: SubsystemBlockData;
  onChange: (data: Partial<SubsystemBlockData>) => void;
  onOpenSubsystem?: (sheet?: Sheet) => void;
}

const SubsystemNodeProperties: React.FC<SubsystemNodePropertiesProps> = ({ 
  data, 
  onChange, 
  onOpenSubsystem 
}) => {
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

  // Handle opening subsystem editor
  const handleOpenSubsystem = () => {
    if (onOpenSubsystem) {
      onOpenSubsystem(data.sheet);
    }
  };

  // Handle creating new subsystem
  const handleCreateSubsystem = () => {
    const inputBlockId = `inputPort-${createId()}`;
    const outputBlockId = `outputPort-${createId()}`;
    const connectionId = `edge-${createId()}`;
    
    const newSheet: Sheet = {
      id: `sheet-${createId()}`,
      name: `${label} Internal`,
      blocks: [
        {
          id: inputBlockId,
          type: 'inputPort',
          position: { x: 100, y: 200 },
          data: {
            label: 'Input',
            description: 'Subsystem input',
            name: 'input',
            unit: '',
            defaultValue: 0
          }
        },
        {
          id: outputBlockId,
          type: 'outputPort',
          position: { x: 400, y: 200 },
          data: {
            label: 'Output',
            description: 'Subsystem output',
            name: 'output',
            unit: '',
            value: null,
            connected: false
          }
        }
      ],
      connections: [
        {
          id: connectionId,
          sourceNodeId: inputBlockId,
          sourceHandleId: 'out',
          targetNodeId: outputBlockId,
          targetHandleId: 'in'
        }
      ]
    };
    
    onChange({ sheet: newSheet });
    
    if (onOpenSubsystem) {
      onOpenSubsystem(newSheet);
    }
  };

  // Analyze current subsystem structure
  const subsystemInfo = data.sheet ? analyzeSubsystemHandles(data.sheet) : null;

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
        <h3 className="font-semibold text-gray-900 mb-2">Subsystem Configuration</h3>
        
        {data.sheet ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleOpenSubsystem}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium"
            >
              Open Subsystem Editor
            </button>
            
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium text-gray-900 mb-2">Subsystem Status</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <div>• Blocks: {data.sheet.blocks.length}</div>
                <div>• Connections: {data.sheet.connections.length}</div>
                {subsystemInfo && (
                  <>
                    <div>• Input ports: {subsystemInfo.inputHandles.length}</div>
                    <div>• Output ports: {subsystemInfo.outputHandles.length}</div>
                  </>
                )}
              </div>
            </div>

            {subsystemInfo && (
              <div className="space-y-2">
                {subsystemInfo.inputHandles.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 text-sm">Input Ports:</h5>
                    <div className="text-xs text-gray-700 ml-2">
                      {subsystemInfo.inputHandles.map((handle, i) => (
                        <div key={i}>• {handle.name}{handle.unit ? ` [${handle.unit}]` : ''}</div>
                      ))}
                    </div>
                  </div>
                )}
                
                {subsystemInfo.outputHandles.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 text-sm">Output Ports:</h5>
                    <div className="text-xs text-gray-700 ml-2">
                      {subsystemInfo.outputHandles.map((handle, i) => (
                        <div key={i}>• {handle.name}{handle.unit ? ` [${handle.unit}]` : ''}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleCreateSubsystem}
              className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 font-medium"
            >
              Create New Subsystem
            </button>
            
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
              <div className="text-sm text-yellow-800">
                This subsystem is empty. Create a new subsystem to start adding blocks and defining the interface.
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">Block Info</h3>
        <p className="text-sm text-gray-700 font-medium">
          Subsystem blocks allow you to create hierarchical models by encapsulating
          groups of blocks into reusable components. The subsystem's interface is
          automatically determined by the Input and Output Port blocks inside it.
        </p>
        
        <div className="mt-2 text-xs text-gray-600">
          <div>• Add Input Port blocks inside to create input connectors</div>
          <div>• Add Output Port blocks inside to create output connectors</div>
          <div>• Double-click the subsystem block to edit its contents</div>
        </div>
      </div>
    </div>
  );
};

export default SubsystemNodeProperties;