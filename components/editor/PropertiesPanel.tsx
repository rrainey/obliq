'use client';

import { useCallback, useEffect, useState } from 'react';
import { Node } from 'reactflow';
import DisplayNodeProperties from '../blocks/properties/DisplayNodeProperties';
import InputPortNodeProperties from '../blocks/properties/InputPortNodeProperties';
import OutputPortNodeProperties from '../blocks/properties/OutputPortNodeProperties';
import LoggerNodeProperties from '../blocks/properties/LoggerNodeProperties';
import SumNodeProperties from '../blocks/properties/SumNodeProperties';
import MultiplyNodeProperties from '../blocks/properties/MultiplyNodeProperties';
import TransferFunctionNodeProperties from '../blocks/properties/TransferFunctionNodeProperties';
import SubsystemNodeProperties from '../blocks/properties/SubsystemNodeProperties';

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onNodeDataChange: (nodeId: string, data: any) => void;
  onClose: () => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedNode,
  onNodeDataChange,
  onClose,
}) => {
  const [title, setTitle] = useState('Block Properties');

  // Set panel title based on node type
  useEffect(() => {
    if (selectedNode) {
      switch (selectedNode.type) {
        case 'sum':
          setTitle('Sum Block Properties');
          break;
        case 'multiply':
          setTitle('Multiply Block Properties');
          break;
        case 'inputPort':
          setTitle('Input Port Properties');
          break;
        case 'outputPort':
          setTitle('Output Port Properties');
          break;
        case 'display':
          setTitle('Display Block Properties');
          break;
        case 'logger':
          setTitle('Logger Block Properties');
          break;
        case 'transferFunction':
          setTitle('Transfer Function Properties');
          break;
        case 'subsystem':
          setTitle('Subsystem Properties');
          break;
        default:
          setTitle('Block Properties');
      }
    }
  }, [selectedNode]);

  // Handle data change
  const handleDataChange = useCallback(
    (data: any) => {
      if (selectedNode) {
        onNodeDataChange(selectedNode.id, data);
      }
    },
    [selectedNode, onNodeDataChange]
  );

  // Render the appropriate properties panel based on node type
  const renderPropertiesContent = () => {
    if (!selectedNode) {
      return <p>No block selected</p>;
    }

    switch (selectedNode.type) {
      case 'sum':
        return <SumNodeProperties data={selectedNode.data} onChange={handleDataChange} />;
      case 'multiply':
        return <MultiplyNodeProperties data={selectedNode.data} onChange={handleDataChange} />;
      case 'inputPort':
        return <InputPortNodeProperties data={selectedNode.data} onChange={handleDataChange} />;
      case 'outputPort':
        return <OutputPortNodeProperties data={selectedNode.data} onChange={handleDataChange} />;
      case 'display':
        return <DisplayNodeProperties data={selectedNode.data} onChange={handleDataChange} />;
      case 'logger':
        return <LoggerNodeProperties data={selectedNode.data} onChange={handleDataChange} />;
      case 'transferFunction':
        return <TransferFunctionNodeProperties data={selectedNode.data} onChange={handleDataChange} />;
      case 'subsystem':
        return <SubsystemNodeProperties data={selectedNode.data} onChange={handleDataChange} />;
      default:
        return <p>No properties available for this block type</p>;
    }
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-lg z-10 border-l border-gray-300 overflow-y-auto">
      <div className="flex justify-between items-center p-4 border-b border-gray-300">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
        >
          ✕
        </button>
      </div>
      <div className="p-4">{renderPropertiesContent()}</div>
    </div>
  );
};

export default PropertiesPanel;