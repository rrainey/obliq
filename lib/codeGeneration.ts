// lib/codeGeneration.ts
import { Model, Block, Connection, Sheet } from '@/lib/models/modelSchema';

// Structure for generated code files
export interface GeneratedCodeFiles {
  'model.h': string;
  'model.c': string;
  'main.c': string;
  'platformio.ini': string;
}

// Structure for tracking signals and variables
interface SignalInfo {
  blockId: string;
  handleId: string;
  variableName: string;
  dataType: string;
}

// Structure for block state variables (for Transfer Functions, etc.)
interface BlockStateInfo {
  blockId: string;
  stateVariables: string[];
  initCode: string[];
  updateCode: string[];
}

/**
 * Main function to generate C code from a model
 */
export function generateCCodeFromModel(model: Model): GeneratedCodeFiles {
  // Use the first sheet for now (main sheet)
  const mainSheet = model.sheets[0];
  
  if (!mainSheet) {
    throw new Error('Model must have at least one sheet');
  }

  // Analyze the model to determine execution order and signal names
  const executionOrder = topologicalSort(mainSheet.blocks, mainSheet.connections);
  const signals = analyzeSignals(mainSheet.blocks, mainSheet.connections);
  const blockStates = analyzeBlockStates(mainSheet.blocks);

  // Generate each file
  const headerFile = generateHeaderFile(signals, blockStates);
  const sourceFile = generateSourceFile(executionOrder, signals, blockStates, mainSheet.connections);
  const mainFile = generateMainFile();
  const platformioIni = generatePlatformIOConfig();

  return {
    'model.h': headerFile,
    'model.c': sourceFile,
    'main.c': mainFile,
    'platformio.ini': platformioIni
  };
}

/**
 * Topological sort for execution order (simplified version of simulation engine logic)
 */
function topologicalSort(blocks: Block[], connections: Connection[]): Block[] {
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
    if (temp.has(blockId)) return false; // Cycle detected
    if (visited.has(blockId)) return true;
    
    temp.add(blockId);
    
    const neighbors = adjacencyList.get(blockId) || [];
    for (const neighbor of neighbors) {
      if (!visit(neighbor)) return false;
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
        console.warn('Topological sort failed, using original order');
        return blocks;
      }
    }
  }
  
  return order;
}

/**
 * Analyze signals to create variable names and types
 */
function analyzeSignals(blocks: Block[], connections: Connection[]): SignalInfo[] {
  const signals: SignalInfo[] = [];
  const usedNames = new Set<string>();
  
  // Create signals for each block output
  blocks.forEach(block => {
    if (block.type === 'display' || block.type === 'logger') {
      // These blocks don't have outputs
      return;
    }
    
    // Generate a unique variable name
    let baseName = '';
    if (block.type === 'inputPort') {
      const data = block.data as any;
      baseName = data.name ? sanitizeVariableName(data.name) : 'input';
    } else {
      baseName = block.type;
    }
    
    let variableName = baseName;
    let counter = 1;
    while (usedNames.has(variableName)) {
      variableName = `${baseName}_${counter}`;
      counter++;
    }
    usedNames.add(variableName);
    
    signals.push({
      blockId: block.id,
      handleId: 'out',
      variableName: variableName,
      dataType: 'double'
    });
  });
  
  return signals;
}

/**
 * Analyze blocks that need state variables (like Transfer Functions)
 * Note: We're using static variables within function scope instead of global state
 */
function analyzeBlockStates(blocks: Block[]): BlockStateInfo[] {
  const blockStates: BlockStateInfo[] = [];
  
  // For now, we're not using global state variables since we implement
  // Transfer Functions with static variables inside the function scope.
  // This keeps the state encapsulated and avoids global variable conflicts.
  
  return blockStates;
}

/**
 * Sanitize variable names for C compatibility
 */
function sanitizeVariableName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/^[0-9]/, '_$&')
    .toLowerCase();
}

/**
 * Generate header file (.h)
 */
function generateHeaderFile(signals: SignalInfo[], blockStates: BlockStateInfo[]): string {
  const lines: string[] = [];
  
  lines.push('// model.h - Generated from Obliq Visual Model');
  lines.push('#ifndef MODEL_H');
  lines.push('#define MODEL_H');
  lines.push('');
  lines.push('#include <math.h>');
  lines.push('#include <string.h>');
  lines.push('');
  lines.push('// Function prototypes');
  lines.push('void model_init(void);');
  lines.push('void model_step(void);');
  lines.push('');
  lines.push('// Signal variables (extern declarations)');
  
  signals.forEach(signal => {
    lines.push(`extern ${signal.dataType} ${signal.variableName};`);
  });
  
  lines.push('');
  lines.push('// Block state variables (extern declarations)');
  blockStates.forEach(state => {
    state.stateVariables.forEach(varDecl => {
      lines.push(`extern double ${varDecl};`);
    });
  });
  
  lines.push('');
  lines.push('#endif // MODEL_H');
  
  return lines.join('\n');
}

/**
 * Generate source file (.c) with actual block implementations
 */
function generateSourceFile(
  executionOrder: Block[], 
  signals: SignalInfo[], 
  blockStates: BlockStateInfo[],
  connections: Connection[]
): string {
  const lines: string[] = [];
  
  lines.push('// model.c - Generated from Obliq Visual Model');
  lines.push('#include "model.h"');
  lines.push('');
  lines.push('// Signal variables');
  
  signals.forEach(signal => {
    lines.push(`${signal.dataType} ${signal.variableName} = 0.0;`);
  });
  
  lines.push('');
  lines.push('// Block state variables');
  blockStates.forEach(state => {
    state.stateVariables.forEach(varDecl => {
      lines.push(`double ${varDecl};`);
    });
  });
  
  lines.push('');
  lines.push('// Initialize model');
  lines.push('void model_init(void) {');
  
  blockStates.forEach(state => {
    state.initCode.forEach(code => {
      lines.push(`    ${code}`);
    });
  });
  
  lines.push('}');
  lines.push('');
  lines.push('// Execute one simulation step');
  lines.push('void model_step(void) {');
  
  // Generate code for each block in execution order
  executionOrder.forEach((block, index) => {
    lines.push(`    // Block ${index + 1}: ${block.type} (${block.id})`);
    
    const blockCode = generateBlockCode(block, signals, connections);
    blockCode.forEach(codeLine => {
      lines.push(`    ${codeLine}`);
    });
    
    lines.push('');
  });
  
  lines.push('}');
  
  return lines.join('\n');
}

/**
 * Generate C code for a specific block
 */
function generateBlockCode(block: Block, signals: SignalInfo[], connections: Connection[]): string[] {
  const lines: string[] = [];
  
  // Find the output signal variable name for this block
  const outputSignal = signals.find(s => s.blockId === block.id);
  const outputVar = outputSignal ? outputSignal.variableName : `block_${block.id.replace(/[^a-zA-Z0-9]/g, '_')}_out`;
  
  switch (block.type) {
    case 'inputPort':
      lines.push(...generateInputPortCode(block, outputVar));
      break;
      
    case 'sum':
      lines.push(...generateSumBlockCode(block, outputVar, signals, connections));
      break;
      
    case 'multiply':
      lines.push(...generateMultiplyBlockCode(block, outputVar, signals, connections));
      break;
      
    case 'transferFunction':
      lines.push(...generateTransferFunctionCode(block, outputVar, signals, connections));
      break;
      
    case 'display':
      lines.push(...generateDisplayCode(block, signals, connections));
      break;
      
    case 'outputPort':
      lines.push(...generateOutputPortCode(block, signals, connections));
      break;
      
    case 'logger':
      lines.push(...generateLoggerCode(block, signals, connections));
      break;
      
    default:
      lines.push(`// Unsupported block type: ${block.type}`);
  }
  
  return lines;
}

/**
 * Generate code for Input Port blocks
 */
function generateInputPortCode(block: Block, outputVar: string): string[] {
  const data = block.data as any;
  const lines: string[] = [];
  
  if (data.inputType === 'constant') {
    lines.push(`${outputVar} = ${data.value || 0.0}; // Constant value`);
  } else if (data.inputType === 'variable') {
    const varName = data.variableName || 'external_input';
    lines.push(`// ${outputVar} = ${varName}; // External variable (user must define)`);
    lines.push(`${outputVar} = 0.0; // Default value for ${varName}`);
  } else if (data.inputType === 'signal') {
    // For signal generation, we'd need to track time - for now, use constant
    lines.push(`// Signal generation for ${data.signalShape || 'constant'} - simplified to constant`);
    lines.push(`${outputVar} = ${data.signalOffset || 0.0}; // Signal offset`);
  } else {
    lines.push(`${outputVar} = 0.0; // Default input value`);
  }
  
  return lines;
}

/**
 * Generate code for Sum blocks
 */
function generateSumBlockCode(block: Block, outputVar: string, signals: SignalInfo[], connections: Connection[]): string[] {
  const data = block.data as any;
  const lines: string[] = [];
  const inputCount = data.inputCount || 2;
  const operationType = data.operationType || 'sum';
  
  // Find input connections to this block
  const inputConnections = connections.filter(conn => conn.targetNodeId === block.id);
  
  if (operationType === 'sum') {
    lines.push(`${outputVar} = 0.0; // Initialize sum`);
    
    // Add each connected input
    for (let i = 1; i <= inputCount; i++) {
      const connection = inputConnections.find(conn => conn.targetHandleId === `in${i}`);
      if (connection) {
        const inputSignal = signals.find(s => s.blockId === connection.sourceNodeId);
        const inputVar = inputSignal ? inputSignal.variableName : '0.0';
        lines.push(`${outputVar} += ${inputVar}; // Add input ${i}`);
      } else {
        lines.push(`// Input ${i} not connected, contributes 0.0`);
      }
    }
  } else if (operationType === 'difference') {
    // First input minus all others
    const firstConnection = inputConnections.find(conn => conn.targetHandleId === 'in1');
    if (firstConnection) {
      const firstSignal = signals.find(s => s.blockId === firstConnection.sourceNodeId);
      const firstVar = firstSignal ? firstSignal.variableName : '0.0';
      lines.push(`${outputVar} = ${firstVar}; // Start with first input`);
    } else {
      lines.push(`${outputVar} = 0.0; // First input not connected`);
    }
    
    // Subtract other inputs
    for (let i = 2; i <= inputCount; i++) {
      const connection = inputConnections.find(conn => conn.targetHandleId === `in${i}`);
      if (connection) {
        const inputSignal = signals.find(s => s.blockId === connection.sourceNodeId);
        const inputVar = inputSignal ? inputSignal.variableName : '0.0';
        lines.push(`${outputVar} -= ${inputVar}; // Subtract input ${i}`);
      } else {
        lines.push(`// Input ${i} not connected, subtracts 0.0`);
      }
    }
  }
  
  return lines;
}

/**
 * Generate code for Multiply blocks
 */
function generateMultiplyBlockCode(block: Block, outputVar: string, signals: SignalInfo[], connections: Connection[]): string[] {
  const data = block.data as any;
  const lines: string[] = [];
  const inputCount = data.inputCount || 2;
  const operationType = data.operationType || 'multiply';
  
  // Find input connections to this block
  const inputConnections = connections.filter(conn => conn.targetNodeId === block.id);
  
  if (operationType === 'multiply') {
    lines.push(`${outputVar} = 1.0; // Initialize product`);
    
    // Multiply each connected input
    for (let i = 1; i <= inputCount; i++) {
      const connection = inputConnections.find(conn => conn.targetHandleId === `in${i}`);
      if (connection) {
        const inputSignal = signals.find(s => s.blockId === connection.sourceNodeId);
        const inputVar = inputSignal ? inputSignal.variableName : '1.0';
        lines.push(`${outputVar} *= ${inputVar}; // Multiply by input ${i}`);
      } else {
        lines.push(`// Input ${i} not connected, multiplies by 1.0`);
      }
    }
  } else if (operationType === 'divide') {
    // First input divided by all others
    const firstConnection = inputConnections.find(conn => conn.targetHandleId === 'in1');
    if (firstConnection) {
      const firstSignal = signals.find(s => s.blockId === firstConnection.sourceNodeId);
      const firstVar = firstSignal ? firstSignal.variableName : '1.0';
      lines.push(`${outputVar} = ${firstVar}; // Start with first input`);
    } else {
      lines.push(`${outputVar} = 1.0; // First input not connected`);
    }
    
    // Divide by other inputs (with zero protection)
    for (let i = 2; i <= inputCount; i++) {
      const connection = inputConnections.find(conn => conn.targetHandleId === `in${i}`);
      if (connection) {
        const inputSignal = signals.find(s => s.blockId === connection.sourceNodeId);
        const inputVar = inputSignal ? inputSignal.variableName : '1.0';
        lines.push(`if (${inputVar} != 0.0) ${outputVar} /= ${inputVar}; // Divide by input ${i} (with zero check)`);
      } else {
        lines.push(`// Input ${i} not connected, divides by 1.0`);
      }
    }
  }
  
  return lines;
}

/**
 * Generate code for Transfer Function blocks
 */
function generateTransferFunctionCode(block: Block, outputVar: string, signals: SignalInfo[], connections: Connection[]): string[] {
  const data = block.data as any;
  const lines: string[] = [];
  
  // Get numerator and denominator coefficients
  const numeratorStr = data.numerator || '1';
  const denominatorStr = data.denominator || '1,1';
  
  // Parse coefficients into arrays
  const numerator = numeratorStr.split(',').map((s: string) => parseFloat(s.trim()) || 0);
  const denominator = denominatorStr.split(',').map((s: string) => parseFloat(s.trim()) || 0);
  
  // Find input connection
  const inputConnection = connections.find(conn => conn.targetNodeId === block.id);
  const inputSignal = inputConnection ? signals.find(s => s.blockId === inputConnection.sourceNodeId) : null;
  const inputVar = inputSignal ? inputSignal.variableName : '0.0';
  
  // Generate unique state variable names
  const baseName = `tf_${block.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
  
  // Determine system order (denominator length - 1)
  const order = Math.max(0, denominator.length - 1);
  
  if (order === 0) {
    // Static gain (no dynamics)
    const gain = numerator[0] / (denominator[0] || 1);
    lines.push(`${outputVar} = ${gain.toFixed(6)} * ${inputVar}; // Static gain`);
  } else {
    // Dynamic system with state
    lines.push(`// Transfer Function: ${numeratorStr} / ${denominatorStr}`);
    lines.push(`{`);
    lines.push(`    static double inputs[${order}] = {0}; // Previous inputs x[n-1], x[n-2], ...`);
    lines.push(`    static double outputs[${order}] = {0}; // Previous outputs y[n-1], y[n-2], ...`);
    lines.push(`    double input_val = ${inputVar};`);
    lines.push(`    `);
    
    // Implement difference equation: y[n] = (b0*x[n] + b1*x[n-1] + ... - a1*y[n-1] - a2*y[n-2] - ...) / a0
    
    // Normalize by a0 (first denominator coefficient)
    const a0 = denominator[0] || 1;
    lines.push(`    // Compute output using difference equation`);
    lines.push(`    ${outputVar} = 0.0;`);
    
    // Add numerator terms (input contributions)
    lines.push(`    // Numerator terms (input contributions)`);
    for (let i = 0; i < numerator.length; i++) {
      const coeff = numerator[i] / a0;
      if (Math.abs(coeff) > 1e-12) { // Skip near-zero coefficients
        if (i === 0) {
          lines.push(`    ${outputVar} += ${coeff.toFixed(6)} * input_val; // b${i} * x[n]`);
        } else if (i <= order) {
          lines.push(`    ${outputVar} += ${coeff.toFixed(6)} * inputs[${i-1}]; // b${i} * x[n-${i}]`);
        }
      }
    }
    
    // Subtract denominator terms (output feedback, skip a0 since we normalized)
    if (denominator.length > 1) {
      lines.push(`    // Denominator terms (output feedback)`);
      for (let i = 1; i < denominator.length && i <= order; i++) {
        const coeff = denominator[i] / a0;
        if (Math.abs(coeff) > 1e-12) { // Skip near-zero coefficients
          lines.push(`    ${outputVar} -= ${coeff.toFixed(6)} * outputs[${i-1}]; // a${i} * y[n-${i}]`);
        }
      }
    }
    
    lines.push(`    `);
    lines.push(`    // Update state arrays (shift previous values)`);
    
    // Shift input history
    if (order > 1) {
      lines.push(`    // Shift input history`);
      for (let i = order - 1; i > 0; i--) {
        lines.push(`    inputs[${i}] = inputs[${i-1}];`);
      }
    }
    if (order > 0) {
      lines.push(`    inputs[0] = input_val;`);
    }
    
    // Shift output history
    if (order > 1) {
      lines.push(`    // Shift output history`);
      for (let i = order - 1; i > 0; i--) {
        lines.push(`    outputs[${i}] = outputs[${i-1}];`);
      }
    }
    if (order > 0) {
      lines.push(`    outputs[0] = ${outputVar};`);
    }
    
    lines.push(`}`);
  }
  
  return lines;
}

/**
 * Generate code for Display blocks (no output)
 */
function generateDisplayCode(block: Block, signals: SignalInfo[], connections: Connection[]): string[] {
  const lines: string[] = [];
  const inputConnection = connections.find(conn => conn.targetNodeId === block.id);
  
  if (inputConnection) {
    const inputSignal = signals.find(s => s.blockId === inputConnection.sourceNodeId);
    const inputVar = inputSignal ? inputSignal.variableName : '0.0';
    lines.push(`// Display: ${inputVar} (could add printf or other display logic here)`);
  } else {
    lines.push(`// Display block not connected`);
  }
  
  return lines;
}

/**
 * Generate code for Output Port blocks (no output)
 */
function generateOutputPortCode(block: Block, signals: SignalInfo[], connections: Connection[]): string[] {
  const lines: string[] = [];
  const inputConnection = connections.find(conn => conn.targetNodeId === block.id);
  const data = block.data as any;
  const portName = data.name || `output_${block.id}`;
  
  if (inputConnection) {
    const inputSignal = signals.find(s => s.blockId === inputConnection.sourceNodeId);
    const inputVar = inputSignal ? inputSignal.variableName : '0.0';
    lines.push(`// Output Port: ${portName} = ${inputVar}`);
  } else {
    lines.push(`// Output Port: ${portName} not connected`);
  }
  
  return lines;
}

/**
 * Generate code for Logger blocks (no output)
 */
function generateLoggerCode(block: Block, signals: SignalInfo[], connections: Connection[]): string[] {
  const lines: string[] = [];
  const inputConnection = connections.find(conn => conn.targetNodeId === block.id);
  
  if (inputConnection) {
    const inputSignal = signals.find(s => s.blockId === inputConnection.sourceNodeId);
    const inputVar = inputSignal ? inputSignal.variableName : '0.0';
    lines.push(`// Logger: record ${inputVar} (could add logging logic here)`);
  } else {
    lines.push(`// Logger block not connected`);
  }
  
  return lines;
}

/**
 * Generate main.c file for PlatformIO
 */
function generateMainFile(): string {
  const lines: string[] = [];
  
  lines.push('// main.c - Generated from Obliq Visual Model');
  lines.push('#include "model.h"');
  lines.push('#include <stdio.h>');
  lines.push('');
  lines.push('// For Arduino/PlatformIO');
  lines.push('#ifdef ARDUINO');
  lines.push('#include <Arduino.h>');
  lines.push('');
  lines.push('void setup() {');
  lines.push('    Serial.begin(115200);');
  lines.push('    model_init();');
  lines.push('    Serial.println("Model initialized");');
  lines.push('}');
  lines.push('');
  lines.push('void loop() {');
  lines.push('    model_step();');
  lines.push('    delay(10); // 100Hz update rate');
  lines.push('}');
  lines.push('');
  lines.push('#else');
  lines.push('// For native/testing');
  lines.push('int main() {');
  lines.push('    printf("Initializing model...\\n");');
  lines.push('    model_init();');
  lines.push('    ');
  lines.push('    printf("Running simulation...\\n");');
  lines.push('    for (int i = 0; i < 100; i++) {');
  lines.push('        model_step();');
  lines.push('    }');
  lines.push('    ');
  lines.push('    printf("Simulation complete\\n");');
  lines.push('    return 0;');
  lines.push('}');
  lines.push('#endif');
  
  return lines.join('\n');
}

/**
 * Generate platformio.ini configuration
 */
function generatePlatformIOConfig(): string {
  const lines: string[] = [];
  
  lines.push('; platformio.ini - Generated from Obliq Visual Model');
  lines.push('[env:arduino]');
  lines.push('platform = atmelavr');
  lines.push('board = uno');
  lines.push('framework = arduino');
  lines.push('');
  lines.push('[env:native]');
  lines.push('platform = native');
  lines.push('build_flags = -std=c99');
  
  return lines.join('\n');
}