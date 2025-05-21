// lib/models/modelSchema.ts

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
  name?: string;
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

export interface SumBlockData extends BlockData {
  inputCount: number;
  operationType?: 'sum' | 'difference';
  showInputLabels?: boolean;
}

export interface MultiplyBlockData extends BlockData {
  inputCount: number;
  operationType?: 'multiply' | 'divide';
  showInputLabels?: boolean;
}

export interface InputPortBlockData extends BlockData {
  value: number;
  name?: string;
  unit?: string;
  inputType?: 'constant' | 'signal' | 'variable';
  variableName?: string;
  signalShape?: 'constant' | 'sine' | 'square' | 'ramp';
  signalPeriod?: number;
  signalAmplitude?: number;
  signalOffset?: number;
}

export interface OutputPortBlockData extends BlockData {
  name?: string;
  unit?: string;
  value?: number | null;
  connected?: boolean;
  exportEnabled?: boolean;
  exportFormat?: 'none' | 'csv' | 'json';
  exportFilename?: string;
  history?: Array<{ time: number, value: number }>;
  historyMaxLength?: number;
}

export interface DisplayBlockData extends BlockData {
  value?: number | string | null;
  connected?: boolean;
  unit?: string;
  displayMode?: 'value' | 'gauge' | 'indicator';
  min?: number;
  max?: number;
  precision?: number;
  showUnit?: boolean;
}

export interface LoggerBlockData extends BlockData {
  logs: Array<{ time: number; value: number | string }>;
  connected?: boolean;
  maxEntries?: number;
  recording?: boolean;
  unit?: string;
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

// Function to validate a model schema
export const validateModel = (model: Model): boolean => {
  // Check if model has basic required properties
  if (!model.id || !model.name || !model.sheets || !model.mainSheetId) {
    return false;
  }
  
  // Check if mainSheetId references an existing sheet
  if (!model.sheets.some(sheet => sheet.id === model.mainSheetId)) {
    return false;
  }
  
  // Validate each sheet
  for (const sheet of model.sheets) {
    // Check if sheet has basic required properties
    if (!sheet.id || !sheet.name) {
      return false;
    }
    
    // Validate each connection references existing blocks and handles
    for (const connection of sheet.connections) {
      const sourceBlock = sheet.blocks.find(b => b.id === connection.sourceNodeId);
      const targetBlock = sheet.blocks.find(b => b.id === connection.targetNodeId);
      
      if (!sourceBlock || !targetBlock) {
        return false;
      }
      
      // Could add more validation here for handle IDs, etc.
    }
    
    // Validate subsystem references
    for (const block of sheet.blocks) {
      if (block.type === 'subsystem' && block.data.sheetId) {
        // Ensure the subsystem sheet exists
        if (!model.sheets.some(s => s.id === block.data.sheetId)) {
          return false;
        }
      }
    }
  }
  
  return true;
};

// Function to update a block in a model
export const updateBlockInModel = (
  model: Model, 
  sheetId: string, 
  blockId: string, 
  updates: Partial<Block>
): Model => {
  const newModel = { ...model };
  
  const sheetIndex = newModel.sheets.findIndex(s => s.id === sheetId);
  if (sheetIndex === -1) return model;
  
  const sheet = newModel.sheets[sheetIndex];
  const blockIndex = sheet.blocks.findIndex(b => b.id === blockId);
  if (blockIndex === -1) return model;
  
  // Update the block
  sheet.blocks[blockIndex] = {
    ...sheet.blocks[blockIndex],
    ...updates,
    data: {
      ...sheet.blocks[blockIndex].data,
      ...(updates.data || {})
    }
  };
  
  // Update the sheet
  newModel.sheets[sheetIndex] = sheet;
  newModel.updatedAt = new Date().toISOString();
  
  return newModel;
};