// lib/simulation/simulationEngine.ts
import { Node, Edge } from 'reactflow';
import { Block, Connection, Sheet, DisplayBlockData } from '@/lib/models/modelSchema';

// Simulation state types
export interface SimulationState {
  time: number;
  timeStep: number;
  running: boolean;
  blockValues: Map<string, any>;
  blockStates: Map<string, any>;
  logs: Map<string, Array<{ time: number; value: any }>>;
}

// Initialize simulation state
export const initializeSimulationState = (): SimulationState => {
  return {
    time: 0,
    timeStep: 0.01, // Default time step (10ms)
    running: false,
    blockValues: new Map<string, any>(),
    blockStates: new Map<string, any>(),
    logs: new Map<string, Array<{ time: number; value: any }>>(),
  };
};

// Sort blocks in topological order for simulation
export const sortBlocksTopologically = (blocks: Block[], connections: Connection[]): Block[] => {
  const visited = new Set<string>();
  const temp = new Set<string>();
  const order: Block[] = [];
  const adjacencyList = new Map<string, string[]>();
  
  // Create adjacency list
  blocks.forEach(block => {
    adjacencyList.set(block.id, []);
  });
  
  connections.forEach(connection => {
    const source = connection.sourceNodeId;
    const target = connection.targetNodeId;
    if (adjacencyList.has(source)) {
      adjacencyList.get(source)?.push(target);
    }
  });
  
  // DFS function for topological sort
  const visit = (blockId: string): boolean => {
    if (temp.has(blockId)) {
      // Cyclic dependency detected
      console.error(`Cyclic dependency detected involving block ${blockId}`);
      return false;
    }
    
    if (visited.has(blockId)) {
      return true;
    }
    
    temp.add(blockId);
    
    const neighbors = adjacencyList.get(blockId) || [];
    for (const neighbor of neighbors) {
      if (!visit(neighbor)) {
        return false;
      }
    }
    
    temp.delete(blockId);
    visited.add(blockId);
    
    const block = blocks.find(b => b.id === blockId);
    if (block) {
      order.unshift(block);
    }
    
    return true;
  };
  
  // Visit all blocks
  for (const block of blocks) {
    if (!visited.has(block.id)) {
      if (!visit(block.id)) {
        // If topological sort not possible, return original order
        console.warn('Topological sort failed, using original block order');
        return blocks;
      }
    }
  }
  
  return order;
};

// Implement Display Block Logic
export const updateDisplayBlock = (
  blockId: string,
  value: any,
  simulationState: SimulationState,
  updateNodeCallback: (nodeId: string, newData: Partial<DisplayBlockData>) => void
): void => {
  // Store value in simulation state
  simulationState.blockValues.set(blockId, value);
  
  // Update the display block with the new value and connected status
  updateNodeCallback(blockId, {
    value,
    connected: true,
  });
};

// Execute one simulation step
export const executeSimulationStep = (
  blocks: Block[],
  connections: Connection[],
  simulationState: SimulationState,
  updateNodeCallback: (nodeId: string, newData: any) => void
): void => {
  // Increase simulation time
  simulationState.time += simulationState.timeStep;
  
  // Sort blocks in topological order
  const sortedBlocks = sortBlocksTopologically(blocks, connections);
  
  // Create a map to store input values for each block
  const blockInputs = new Map<string, Map<string, any>>();
  
  // Initialize input maps for each block
  sortedBlocks.forEach(block => {
    blockInputs.set(block.id, new Map<string, any>());
  });
  
  // Process connections to determine inputs for each block
  connections.forEach(connection => {
    const sourceValue = simulationState.blockValues.get(connection.sourceNodeId);
    const sourceHandleId = connection.sourceHandleId;
    const targetNodeId = connection.targetNodeId;
    const targetHandleId = connection.targetHandleId;
    
    // If source has an output value, set it as input to the target
    if (sourceValue !== undefined) {
      const targetInputs = blockInputs.get(targetNodeId);
      if (targetInputs) {
        targetInputs.set(targetHandleId, sourceValue);
      }
    }
  });
  
  // Execute each block in order
  for (const block of sortedBlocks) {
    const inputs = blockInputs.get(block.id) || new Map<string, any>();
    let output = null;
    
    // Process different block types
    switch (block.type) {
      case 'inputPort': {
        // Input port outputs its constant value or generated signal
        const data = block.data as any;
        if (data.inputType === 'constant') {
          output = data.value || 0;
        } else if (data.inputType === 'signal') {
          // Generate signal based on shape, period, etc.
          const time = simulationState.time;
          const amplitude = data.signalAmplitude || 1;
          const period = data.signalPeriod || 1;
          const offset = data.signalOffset || 0;
          
          switch (data.signalShape) {
            case 'sine':
              output = amplitude * Math.sin(2 * Math.PI * time / period) + offset;
              break;
            case 'square':
              output = ((time % period) / period < 0.5 ? amplitude : -amplitude) + offset;
              break;
            case 'ramp':
              output = amplitude * ((time % period) / period) + offset;
              break;
            default: // constant
              output = offset;
          }
        } else if (data.inputType === 'variable') {
          // For external variables, use a default or stored value
          output = data.value || 0;
        }
        break;
      }
      
      case 'sum': {
        // Sum block adds or subtracts inputs
        const data = block.data as any;
        const operationType = data.operationType || 'sum';
        let result = 0;
        
        if (operationType === 'sum') {
          // Add all inputs
          for (let i = 1; i <= (data.inputCount || 2); i++) {
            const inputValue = inputs.get(`in${i}`) || 0;
            result += Number(inputValue);
          }
        } else if (operationType === 'difference') {
          // Subtract all other inputs from the first one
          result = inputs.get('in1') || 0;
          for (let i = 2; i <= (data.inputCount || 2); i++) {
            const inputValue = inputs.get(`in${i}`) || 0;
            result -= Number(inputValue);
          }
        }
        
        output = result;
        break;
      }
      
      case 'multiply': {
        // Multiply block multiplies or divides inputs
        const data = block.data as any;
        const operationType = data.operationType || 'multiply';
        
        if (operationType === 'multiply') {
          // Multiply all inputs
          let result = 1;
          for (let i = 1; i <= (data.inputCount || 2); i++) {
            const inputValue = inputs.get(`in${i}`);
            if (inputValue !== undefined) {
              result *= Number(inputValue);
            }
          }
          output = result;
        } else if (operationType === 'divide') {
          // Divide first input by product of others
          const dividend = inputs.get('in1');
          if (dividend !== undefined) {
            let divisor = 1;
            for (let i = 2; i <= (data.inputCount || 2); i++) {
              const inputValue = inputs.get(`in${i}`);
              if (inputValue !== undefined && inputValue !== 0) {
                divisor *= Number(inputValue);
              }
            }
            output = divisor !== 0 ? Number(dividend) / divisor : 0;
          } else {
            output = 0;
          }
        }
        break;
      }
      
      case 'display': {
        // Display block shows the value of its input
        const inputValue = inputs.get('in');
        
        // Update display block with input value
        updateDisplayBlock(block.id, inputValue, simulationState, updateNodeCallback);
        
        // Display block doesn't produce an output
        output = null;
        break;
      }
      
      case 'outputPort': {
        // Output port passes through its input
        const inputValue = inputs.get('in');
        
        // Update output port with input value
        updateNodeCallback(block.id, {
          value: inputValue,
          connected: true,
        });
        
        // Store value in history if export is enabled
        const data = block.data as any;
        if (data.exportEnabled && data.history) {
          // Create history entry if it doesn't exist
          if (!simulationState.logs.has(block.id)) {
            simulationState.logs.set(block.id, []);
          }
          
          // Add to history while respecting max length
          const history = simulationState.logs.get(block.id) || [];
          history.push({ time: simulationState.time, value: inputValue });
          
          // Trim history if needed
          const maxLength = data.historyMaxLength || 1000;
          if (history.length > maxLength) {
            history.splice(0, history.length - maxLength);
          }
          
          // Update node with new history
          updateNodeCallback(block.id, { history });
        }
        
        // Output port doesn't produce an output for other blocks
        output = null;
        break;
      }
      
      case 'logger': {
        // Logger block records the input value over time
        const inputValue = inputs.get('in');
        
        // Skip if no input value or not recording
        const data = block.data as any;
        if (inputValue === undefined || data.recording === false) {
          output = null;
          break;
        }
        
        // Create logs array if it doesn't exist
        if (!data.logs) {
          data.logs = [];
        }
        
        // Add new log entry
        const newLog = {
          time: simulationState.time,
          value: inputValue
        };
        
        // Add to logs (respecting max entries)
        const maxEntries = data.maxEntries || 100;
        data.logs.push(newLog);
        if (data.logs.length > maxEntries) {
          data.logs.splice(0, data.logs.length - maxEntries);
        }
        
        // Update logger block with new logs
        updateNodeCallback(block.id, {
          logs: data.logs,
          connected: true
        });
        
        // Logger doesn't produce an output
        output = null;
        break;
      }
      
      case 'transferFunction': {
        // Transfer function block implements a difference equation
        const inputValue = inputs.get('in');
        
        // Skip if no input value
        if (inputValue === undefined) {
          output = null;
          break;
        }
        
        // Get numerator and denominator coefficients
        const data = block.data as any;
        const numeratorStr = data.numerator || '1';
        const denominatorStr = data.denominator || '1,1';
        
        // Parse coefficients into arrays
        const numerator = numeratorStr.split(',').map(Number);
        const denominator = denominatorStr.split(',').map(Number);
        
        // Get or initialize state arrays
        if (!simulationState.blockStates.has(block.id)) {
          // Initialize state for transfer function
          // For an nth order system, we need n previous inputs and n previous outputs
          const order = Math.max(0, denominator.length - 1);
          
          simulationState.blockStates.set(block.id, {
            // Previous inputs (x[n-1], x[n-2], etc.)
            inputs: Array(order).fill(0),
            // Previous outputs (y[n-1], y[n-2], etc.)
            outputs: Array(order).fill(0)
          });
        }
        
        const state = simulationState.blockStates.get(block.id);
        
        // Implement the difference equation
        // y[n] = (b0*x[n] + b1*x[n-1] + ... + bm*x[n-m] - a1*y[n-1] - ... - an*y[n-n]) / a0
        // where b = numerator coefficients, a = denominator coefficients
        
        // First, normalize denominator so a0 = 1
        const a0 = denominator[0] || 1;
        const normalizedDenominator = denominator.map(coeff => coeff / a0);
        const normalizedNumerator = numerator.map(coeff => coeff / a0);
        
        // Calculate new output
        let outputValue = 0;
        
        // Add input contributions (numerator terms)
        outputValue += Number(inputValue) * (normalizedNumerator[0] || 0);
        for (let i = 1; i < normalizedNumerator.length; i++) {
          if (i <= state.inputs.length) {
            outputValue += state.inputs[i-1] * (normalizedNumerator[i] || 0);
          }
        }
        
        // Subtract previous output contributions (denominator terms, except a0 which we normalized to 1)
        for (let i = 1; i < normalizedDenominator.length; i++) {
          if (i <= state.outputs.length) {
            outputValue -= state.outputs[i-1] * (normalizedDenominator[i] || 0);
          }
        }
        
        // Update state (shift previous values and add new ones)
        // Shift inputs
        if (state.inputs.length > 0) {
          state.inputs.unshift(Number(inputValue));
          state.inputs.pop();
        }
        
        // Shift outputs
        if (state.outputs.length > 0) {
          state.outputs.unshift(outputValue);
          state.outputs.pop();
        }
        
        // Store updated state
        simulationState.blockStates.set(block.id, state);
        
        // Update transfer function block with current output value for display
        updateNodeCallback(block.id, {
          value: outputValue,
          connected: true
        });
        
        output = outputValue;
        break;
      }
      
      case 'subsystem': {
        // TODO: implement subsystem processing
        output = null;
        break;
      }
      
      default:
        // For unhandled block types, pass through the first input
        output = inputs.get('in');
    }
    
    // Store block output in simulation state
    if (output !== null) {
      simulationState.blockValues.set(block.id, output);
    }
  }
};

// Run simulation continuously
export const runSimulation = (
  blocks: Block[],
  connections: Connection[],
  simulationState: SimulationState,
  updateNodeCallback: (nodeId: string, newData: any) => void
): void => {
  // Set simulation to running
  simulationState.running = true;
  
  // Define function for animation frame
  const step = () => {
    if (!simulationState.running) {
      return;
    }
    
    // Execute one simulation step
    executeSimulationStep(blocks, connections, simulationState, updateNodeCallback);
    
    // Schedule next step
    requestAnimationFrame(step);
  };
  
  // Start simulation loop
  step();
};

// Stop simulation
export const stopSimulation = (simulationState: SimulationState): void => {
  simulationState.running = false;
};

// Reset simulation
export const resetSimulation = (simulationState: SimulationState): void => {
  simulationState.time = 0;
  simulationState.blockValues.clear();
  simulationState.blockStates.clear();
  simulationState.logs.clear();
};