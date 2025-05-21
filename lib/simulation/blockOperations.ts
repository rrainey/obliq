import { 
  SumBlockData, 
  MultiplyBlockData,
  InputPortBlockData,
  OutputPortBlockData,
  DisplayBlockData,
  LoggerBlockData,
  TransferFunctionBlockData
} from '../models/modelSchema';

// Simulation function for Sum block
export const simulateSum = (data: SumBlockData, inputs: number[]): number => {
  // Check if we have enough inputs
  if (inputs.length < 1) {
    return 0; // Default to 0 if no inputs
  }
  
  // For difference operation
  if (data.operationType === 'difference') {
    if (inputs.length === 1) {
      return inputs[0]; // Just the first input if that's all we have
    }
    
    // First input minus the sum of the rest
    const firstInput = inputs[0];
    const restSum = inputs.slice(1).reduce((sum, val) => sum + val, 0);
    return firstInput - restSum;
  }
  
  // For sum operation (default)
  return inputs.reduce((sum, val) => sum + val, 0);
};

// Simulation function for Multiply block
export const simulateMultiply = (data: MultiplyBlockData, inputs: number[]): number => {
  // Check if we have enough inputs
  if (inputs.length < 1) {
    return 0; // Default to 0 if no inputs
  }
  
  // For divide operation
  if (data.operationType === 'divide') {
    if (inputs.length === 1) {
      return inputs[0]; // Just the first input if that's all we have
    }
    
    // First input divided by the product of the rest
    const firstInput = inputs[0];
    const restProduct = inputs.slice(1).reduce((product, val) => product * val, 1);
    
    // Prevent division by zero
    if (restProduct === 0) {
      return 0; // or could return Infinity but that might cause issues
    }
    
    return firstInput / restProduct;
  }
  
  // For multiply operation (default)
  return inputs.reduce((product, val) => product * val, 1);
};

// Simulation function for Input Port block
export const simulateInputPort = (data: InputPortBlockData, time: number): number => {
  // Handle different input types
  switch (data.inputType) {
    case 'constant':
      // Just return the constant value
      return data.value;
    
    case 'signal':
      // Generate a signal based on the configuration
      return generateSignal(data, time);
    
    case 'variable':
      // In a real implementation, this would read from an external source
      // For now, just return the value as a fallback
      return data.value;
    
    default:
      return data.value;
  }
};

// Helper function to generate signals for the Input Port block
const generateSignal = (data: InputPortBlockData, time: number): number => {
  const amplitude = data.signalAmplitude || 1;
  const period = data.signalPeriod || 1;
  const offset = data.signalOffset || 0;
  
  switch (data.signalShape) {
    case 'sine':
      // Generate a sine wave
      return amplitude * Math.sin(2 * Math.PI * time / period) + offset;
    
    case 'square':
      // Generate a square wave
      return ((time % period) / period < 0.5 ? amplitude : -amplitude) + offset;
    
    case 'ramp':
      // Generate a ramp wave
      return amplitude * ((time % period) / period) + offset;
    
    case 'constant':
    default:
      // Just return the offset
      return offset;
  }
};

export const simulateOutputPort = (
  data: OutputPortBlockData, 
  input: number, 
  time: number
): OutputPortBlockData => {
  // Create updated data object
  const updatedData: OutputPortBlockData = {
    ...data,
    value: input
  };
  
  // If history tracking is enabled (for data export)
  if (data.exportEnabled) {
    // Initialize history array if it doesn't exist
    const history = data.history || [];
    
    // Add the new data point
    const newPoint = { time, value: input };
    const newHistory = [...history, newPoint];
    
    // Limit history size if needed
    const maxLength = data.historyMaxLength || 1000;
    if (newHistory.length > maxLength) {
      updatedData.history = newHistory.slice(-maxLength);
    } else {
      updatedData.history = newHistory;
    }
  }
  
  return updatedData;
};

// We'll implement more block simulation functions later