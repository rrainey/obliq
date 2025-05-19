// Base types for nodes and connections
export type NodeId = string;
export type HandleId = string;
export type PortType = 'input' | 'output';

// Position type for coordinates
export interface Position {
  x: number;
  y: number;
}

// Basic handle/port interface
export interface Port {
  id: HandleId;
  type: PortType;
  nodeId: NodeId;
}

// Base block interface
export interface Block {
  id: NodeId;
  type: string;
  position: Position;
  data: BlockData;
}

// Connection between blocks
export interface Connection {
  id: string;
  sourceNodeId: NodeId;
  sourceHandleId: HandleId;
  targetNodeId: NodeId;
  targetHandleId: HandleId;
}

// Block data interface with common properties
export interface BlockData {
  label: string;
  description?: string;
  [key: string]: any; // Allow for type-specific properties
}

// Specific block data interfaces
export interface SumBlockData extends BlockData {
  // No additional properties needed for basic Sum block
}

export interface MultiplyBlockData extends BlockData {
  // No additional properties needed for basic Multiply block
}

export interface InputPortBlockData extends BlockData {
  value: number;
}

export interface OutputPortBlockData extends BlockData {
  // No additional properties needed for basic Output Port block
}

export interface DisplayBlockData extends BlockData {
  value?: number | string;
}

export interface LoggerBlockData extends BlockData {
  logs?: Array<{ time: number; value: number | string }>;
}

export interface TransferFunctionBlockData extends BlockData {
  numerator: string; // Comma-separated coefficients
  denominator: string; // Comma-separated coefficients
}

export interface SubsystemBlockData extends BlockData {
  sheetId?: string; // Reference to the subsystem's sheet
}

// Sheet represents a canvas with blocks and connections
export interface Sheet {
  id: string;
  name: string;
  blocks: Block[];
  connections: Connection[];
  parentId?: string; // For subsystem sheets, reference to parent sheet
}

// Model is the top-level container for all sheets
export interface Model {
  id: string;
  name: string;
  description?: string;
  userId?: string;
  sheets: Sheet[];
  mainSheetId: string; // Reference to the top-level sheet
  createdAt?: string;
  updatedAt?: string;
}

// Helper function to create a unique ID
export const createId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Helper function to create a new empty model
export const createEmptyModel = (name: string = 'Untitled Model'): Model => {
  const mainSheetId = createId();
  
  return {
    id: createId(),
    name,
    sheets: [
      {
        id: mainSheetId,
        name: 'Main',
        blocks: [],
        connections: []
      }
    ],
    mainSheetId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Conversion functions between React Flow and our model format

// Convert from our model format to React Flow nodes
export const toReactFlowNodes = (sheet: Sheet) => {
  return sheet.blocks.map(block => ({
    id: block.id,
    type: block.type,
    position: block.position,
    data: { ...block.data }
  }));
};

// Convert from our model format to React Flow edges
export const toReactFlowEdges = (sheet: Sheet) => {
  return sheet.connections.map(connection => ({
    id: connection.id,
    source: connection.sourceNodeId,
    sourceHandle: connection.sourceHandleId,
    target: connection.targetNodeId,
    targetHandle: connection.targetHandleId,
    type: 'smoothstep'
  }));
};

// Convert from React Flow nodes to our model format
export const fromReactFlowNodes = (rfNodes: any[]): Block[] => {
  return rfNodes.map(node => ({
    id: node.id,
    type: node.type,
    position: { x: node.position.x, y: node.position.y },
    data: { ...node.data }
  }));
};

// Convert from React Flow edges to our model format
export const fromReactFlowEdges = (rfEdges: any[]): Connection[] => {
  return rfEdges.map(edge => ({
    id: edge.id,
    sourceNodeId: edge.source,
    sourceHandleId: edge.sourceHandle || 'default',
    targetNodeId: edge.target,
    targetHandleId: edge.targetHandle || 'default'
  }));
};