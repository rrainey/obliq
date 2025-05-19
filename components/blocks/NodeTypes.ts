// components/blocks/NodeTypes.ts
import React from 'react';
import SumNode from './nodes/SumNode';
import MultiplyNode from './nodes/MultiplyNode';
import InputPortNode from './nodes/InputPortNode';
import OutputPortNode from './nodes/OutputPortNode';
import DisplayNode from './nodes/DisplayNode';
import LoggerNode from './nodes/LoggerNode';
import TransferFunctionNode from './nodes/TransferFunctionNode';
import SubsystemNode from './nodes/SubsystemNode';

// Define the node types interface
interface NodeTypesMap {
  [key: string]: React.ComponentType<any>;
}

// Function to create a nodeTypes object with the onNodeDataChange function
export const getNodeTypes = (onNodeDataChange: (nodeId: string, data: any) => void): NodeTypesMap => {
  return {
    sum: (props: any) => React.createElement(SumNode, { ...props, onNodeDataChange }),
    multiply: (props: any) => React.createElement(MultiplyNode, { ...props, onNodeDataChange }),
    inputPort: (props: any) => React.createElement(InputPortNode, { ...props, onNodeDataChange }),
    outputPort: (props: any) => React.createElement(OutputPortNode, { ...props, onNodeDataChange }),
    display: (props: any) => React.createElement(DisplayNode, { ...props, onNodeDataChange }),
    logger: (props: any) => React.createElement(LoggerNode, { ...props, onNodeDataChange }),
    transferFunction: (props: any) => React.createElement(TransferFunctionNode, { ...props, onNodeDataChange }),
    subsystem: SubsystemNode,
  };
};