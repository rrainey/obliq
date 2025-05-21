// lib/simulation/simulationEngine.ts
import { Block, Connection, Sheet, Model } from '../models/modelSchema';
import { simulateSum, simulateMultiply, simulateInputPort } from '../simulation/blockOperations';

// Interface for simulation state
interface SimulationState {
  time: number;
  timeStep: number;
  blockOutputs: Map<string, Map<string, number>>; // Map of blockId -> (handleId -> value)
  isRunning: boolean;
  isPaused: boolean;
}

// Initialize a new simulation
export const initializeSimulation = (model: Model): SimulationState => {
  return {
    time: 0,
    timeStep: 0.01, // Default time step
    blockOutputs: new Map(),
    isRunning: false,
    isPaused: false
  };
};

// Topologically sort blocks based on dependencies
export const sortBlocks = (sheet: Sheet): Block[] => {
  const blocks = [...sheet.blocks]; // Make a copy so we don't modify the original
  const connections = sheet.connections;
  
  // Keep track of blocks that have no dependencies (can be processed immediately)
  const noIncomingEdges: Block[] = [];
  
  // Map of block ID to array of blocks that depend on it
  const dependencyGraph = new Map<string, string[]>();
  
  // Count of incoming edges for each block
  const incomingEdgeCount = new Map<string, number>();
  
  // Initialize data structures
  blocks.forEach(block => {
    incomingEdgeCount.set(block.id, 0);
    dependencyGraph.set(block.id, []);
  });
  
  // Build the dependency graph
  connections.forEach(connection => {
    const source = connection.sourceNodeId;
    const target = connection.targetNodeId;
    
    // Add target to source's dependents
    const dependents = dependencyGraph.get(source) || [];
    dependents.push(target);
    dependencyGraph.set(source, dependents);
    
    // Increment target's incoming edge count
    const count = incomingEdgeCount.get(target) || 0;
    incomingEdgeCount.set(target, count + 1);
  });
  
  // Start with blocks that have no dependencies
  blocks.forEach(block => {
    if ((incomingEdgeCount.get(block.id) || 0) === 0) {
      noIncomingEdges.push(block);
    }
  });
  
  // Sorted results
  const sorted: Block[] = [];
  
  // Process blocks with no dependencies
  while (noIncomingEdges.length > 0) {
    // Take a block with no dependencies
    const block = noIncomingEdges.pop()!;
    sorted.push(block);
    
    // For each block that depends on this one
    const dependents = dependencyGraph.get(block.id) || [];
    for (const dependent of dependents) {
      // Reduce its incoming edge count
      const count = incomingEdgeCount.get(dependent) || 0;
      incomingEdgeCount.set(dependent, count - 1);
      
      // If it has no more dependencies, add it to the queue
      if (count - 1 === 0) {
        const dependentBlock = blocks.find(b => b.id === dependent);
        if (dependentBlock) {
          noIncomingEdges.push(dependentBlock);
        }
      }
    }
  }
  
  // If sorted doesn't contain all blocks, there is a cycle
  if (sorted.length !== blocks.length) {
    // For simplicity, just return blocks in original order
    // In a more complete implementation, we might want to handle cycles or raise an error
    return blocks;
  }
  
  return sorted;
};

// Process a single block in the simulation
export const processBlock = (
  block: Block, 
  inputs: Map<string, number>, 
  state: SimulationState
): [Map<string, number>, Block] => {
  // Map to store output values from this block
  const outputs = new Map<string, number>();
  // Default to not updating the block
  let updatedBlock = block;
  
  // Process different block types
  switch (block.type) {
    case 'sum': {
      // Get input values as array
      const inputValues: number[] = [];
      for (let i = 1; i <= (block.data.inputCount || 2); i++) {
        inputValues.push(inputs.get(`in${i}`) || 0);
      }
      
      // Compute output and store it
      const output = simulateSum(block.data, inputValues);
      outputs.set('out', output);
      break;
    }
    
    case 'multiply': {
      // Get input values as array
      const inputValues: number[] = [];
      for (let i = 1; i <= (block.data.inputCount || 2); i++) {
        inputValues.push(inputs.get(`in${i}`) || 0);
      }
      
      // Compute output and store it
      const output = simulateMultiply(block.data, inputValues);
      outputs.set('out', output);
      break;
    }
    
    case 'inputPort': {
      // Input ports generate their own values based on configuration
      const output = simulateInputPort(block.data as InputPortBlockData, state.time);
      outputs.set('out', output);
      break;
    }
    
    case 'outputPort': {
      // Output ports just pass through their input
      const input = inputs.get('in') || 0;
      outputs.set('out', input); // Also provide an output in case something connects to it
      
      // Update the block data to store the value and history
      const updatedData = simulateOutputPort(
        block.data as OutputPortBlockData, 
        input, 
        state.time
      );
      
      // Create an updated block with the new data
      updatedBlock = {
        ...block,
        data: updatedData
      };
      break;
    }
    
    // We'll add cases for other block types as we implement them
    
    default:
      // For unknown block types, just pass the first input to output
      outputs.set('out', inputs.get('in1') || 0);
  }
  
  return [outputs, updatedBlock];
};

// Step the simulation forward by one time step
export const stepSimulation = (sheet: Sheet, state: SimulationState): [SimulationState, Sheet] => {
  // Create a new state for this step
  const newState: SimulationState = {
    ...state,
    time: state.time + state.timeStep,
    blockOutputs: new Map(state.blockOutputs)
  };
  
  // Create a copy of the sheet that we'll update
  const newSheet: Sheet = {
    ...sheet,
    blocks: [...sheet.blocks],
    connections: [...sheet.connections]
  };
  
  // Sort blocks in topological order
  const sortedBlocks = sortBlocks(sheet);
  
  // Process each block in order
  for (let i = 0; i < sortedBlocks.length; i++) {
    const block = sortedBlocks[i];
    
    // Get inputs for this block from the connected blocks
    const blockInputs = new Map<string, number>();
    
    // Find connections where this block is a target
    const incomingConnections = sheet.connections.filter(
      conn => conn.targetNodeId === block.id
    );
    
    // Get values from source blocks
    for (const conn of incomingConnections) {
      const sourceBlockOutputs = newState.blockOutputs.get(conn.sourceNodeId);
      if (sourceBlockOutputs) {
        const value = sourceBlockOutputs.get(conn.sourceHandleId);
        if (value !== undefined) {
          blockInputs.set(conn.targetHandleId, value);
        }
      }
    }
    
    // Process the block with its inputs
    const [blockOutputs, updatedBlock] = processBlock(block, blockInputs, newState);
    
    // Store the block's outputs in the simulation state
    newState.blockOutputs.set(block.id, blockOutputs);
    
    // If the block was updated, replace it in the sheet
    if (updatedBlock !== block) {
      const blockIndex = newSheet.blocks.findIndex(b => b.id === block.id);
      if (blockIndex !== -1) {
        newSheet.blocks[blockIndex] = updatedBlock;
      }
    }
  }
  
  return [newState, newSheet];
};

// Run the simulation for a specified number of steps
export const runSimulation = (
  model: Model, 
  numSteps: number = 100, 
  timeStep: number = 0.01
): [SimulationState, Model] => {
  // Get the main sheet
  const mainSheetIndex = model.sheets.findIndex(sheet => sheet.id === model.mainSheetId);
  if (mainSheetIndex === -1) {
    throw new Error('Main sheet not found');
  }
  
  // Initialize the simulation
  let state = initializeSimulation(model);
  state.timeStep = timeStep;
  
  // Make a copy of the model
  let updatedModel = { ...model, sheets: [...model.sheets] };
  let currentSheet = { ...updatedModel.sheets[mainSheetIndex] };
  
  // Run the specified number of steps
  for (let i = 0; i < numSteps; i++) {
    const [newState, newSheet] = stepSimulation(currentSheet, state);
    state = newState;
    currentSheet = newSheet;
  }
  
  // Update the sheet in the model
  updatedModel.sheets[mainSheetIndex] = currentSheet;
  
  return [state, updatedModel];
};