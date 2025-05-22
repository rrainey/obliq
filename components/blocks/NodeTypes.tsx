// components/blocks/NodeTypes.ts - Updated with Source node
import SumNode from './nodes/SumNode';
import MultiplyNode from './nodes/MultiplyNode';
import InputPortNode from './nodes/InputPortNode';
import SourceNode from './nodes/SourceNode';
import OutputPortNode from './nodes/OutputPortNode';
import DisplayNode from './nodes/DisplayNode';
import LoggerNode from './nodes/LoggerNode';
import TransferFunctionNode from './nodes/TransferFunctionNode';
import SubsystemNode from './nodes/SubsystemNode';

// Define the node types interface
interface NodeTypesMap {
  [key: string]: React.ComponentType<any>;
}

// Function to create a nodeTypes object
export const getNodeTypes = (
  onNodeDataChange: (nodeId: string, data: any) => void,
  onSubsystemDoubleClick?: (nodeId: string, sheet?: any) => void
): NodeTypesMap => {
  
  // Create a wrapped SubsystemNode that includes the double-click handler
  const WrappedSubsystemNode = (props: any) => (
    <SubsystemNode {...props} onDoubleClick={onSubsystemDoubleClick} />
  );

  return {
    sum: SumNode,
    multiply: MultiplyNode,
    inputPort: InputPortNode,
    source: SourceNode,
    outputPort: OutputPortNode,
    display: DisplayNode,
    logger: LoggerNode,
    transferFunction: TransferFunctionNode,
    subsystem: WrappedSubsystemNode,
  };
};