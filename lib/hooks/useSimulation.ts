import { useState, useCallback, useEffect, useRef } from 'react';
import { Block, Connection } from '@/lib/models/modelSchema';
import {
  SimulationState,
  initializeSimulationState,
  executeSimulationStep,
  runSimulation,
  stopSimulation,
  resetSimulation
} from '@/lib/simulation/simulationEngine';

// Define hook return type
interface UseSimulationReturn {
  isRunning: boolean;
  currentTime: number;
  startSimulation: () => void;
  stopSimulation: () => void;
  resetSimulation: () => void;
  stepSimulation: () => void;
  setTimeStep: (step: number) => void;
}

/**
 * Hook to manage simulation state and control
 */
export const useSimulation = (
  blocks: Block[],
  connections: Connection[],
  updateNodeCallback: (nodeId: string, newData: any) => void
): UseSimulationReturn => {
  // Create a ref for simulation state to avoid re-renders
  const simulationStateRef = useRef<SimulationState>(initializeSimulationState());
  
  // Track simulation running state for UI updates
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Animation frame request ID for cleanup
  const requestRef = useRef<number | null>(null);
  
  // Update the running state when simulation state changes
  useEffect(() => {
    setIsRunning(simulationStateRef.current.running);
  }, [simulationStateRef.current.running]);
  
  // Function to run one simulation step
  const stepSimulation = useCallback(() => {
    executeSimulationStep(
      blocks,
      connections,
      simulationStateRef.current,
      updateNodeCallback
    );
    setCurrentTime(simulationStateRef.current.time);
  }, [blocks, connections, updateNodeCallback]);
  
  // Function to start continuous simulation
  const startSimulation = useCallback(() => {
    // Don't start if already running
    if (simulationStateRef.current.running) return;
    
    // Set running state
    simulationStateRef.current.running = true;
    setIsRunning(true);
    
    // Define animation frame callback
    const animate = () => {
      executeSimulationStep(
        blocks,
        connections,
        simulationStateRef.current,
        updateNodeCallback
      );
      
      setCurrentTime(simulationStateRef.current.time);
      
      // Continue animation loop if still running
      if (simulationStateRef.current.running) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };
    
    // Start animation loop
    requestRef.current = requestAnimationFrame(animate);
  }, [blocks, connections, updateNodeCallback]);
  
  // Function to stop simulation
  const pauseSimulation = useCallback(() => {
    simulationStateRef.current.running = false;
    setIsRunning(false);
    
    // Cancel animation frame if it exists
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
  }, []);
  
  // Function to reset simulation state
  const doResetSimulation = useCallback(() => {
    // Stop any running simulation first
    pauseSimulation();
    
    // Reset state
    resetSimulation(simulationStateRef.current);
    setCurrentTime(simulationStateRef.current.time);
    
    // Update all display blocks to show no value
    blocks.forEach(block => {
      if (block.type === 'display') {
        updateNodeCallback(block.id, { value: null, connected: false });
      } else if (block.type === 'outputPort') {
        updateNodeCallback(block.id, { value: null, connected: false, history: [] });
      } else if (block.type === 'logger') {
        updateNodeCallback(block.id, { logs: [], connected: false });
      }
    });
  }, [blocks, pauseSimulation, updateNodeCallback]);
  
  // Function to set the simulation time step
  const setTimeStep = useCallback((step: number) => {
    simulationStateRef.current.timeStep = step;
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);
  
  return {
    isRunning,
    currentTime,
    startSimulation,
    stopSimulation: pauseSimulation,
    resetSimulation: doResetSimulation,
    stepSimulation,
    setTimeStep
  };
};