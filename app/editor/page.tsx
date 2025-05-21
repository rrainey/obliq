'use client';

import { useState, useCallback } from 'react';
import ProtectedRoute from '@/lib/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';
import LogoutButton from '@/lib/auth/LogoutButton';
import Toolbar from '@/components/editor/Toolbar';
import Canvas from '@/components/editor/Canvas';
import Sidebar from '@/components/editor/Sidebar';
import { ReactFlowProvider } from 'reactflow';

export default function EditorPage() {
  return (
    <ProtectedRoute>
      <EditorContent />
    </ProtectedRoute>
  );
}

function EditorContent() {
  const { user } = useAuth();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showProperties, setShowProperties] = useState(false);
  
  // Simulation state
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  
  // Handle properties button click
  const handleShowProperties = useCallback(() => {
    if (selectedNodeId) {
      setShowProperties(true);
    }
  }, [selectedNodeId]);
  
  // Update selected node
  const handleNodeSelect = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    
    // Auto-hide properties panel when deselecting a node
    if (!nodeId) {
      setShowProperties(false);
    }
  }, []);
  
  // Close properties panel
  const handleCloseProperties = useCallback(() => {
    setShowProperties(false);
  }, []);
  
  // Simulation handlers - these will be connected to Canvas later
  const handleStartSimulation = useCallback(() => {
    setIsSimulationRunning(true);
    // Actual simulation start will be handled by Canvas
  }, []);
  
  const handleStopSimulation = useCallback(() => {
    setIsSimulationRunning(false);
    // Actual simulation stop will be handled by Canvas
  }, []);
  
  const handleResetSimulation = useCallback(() => {
    setSimulationTime(0);
    // Actual simulation reset will be handled by Canvas
  }, []);
  
  const handleStepSimulation = useCallback(() => {
    // Step simulation will be handled by Canvas
  }, []);
  
  const handleSetTimeStep = useCallback((step: number) => {
    // Set time step will be handled by Canvas
  }, []);
  
  // Update simulation time - this will be called from Canvas
  const handleUpdateSimulationTime = useCallback((time: number) => {
    setSimulationTime(time);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">obliq Editor</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Logged in as {user?.email}</span>
            <Link
              href="/"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline text-sm"
            >
              Dashboard
            </Link>
            <LogoutButton className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline text-sm" />
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <Toolbar 
        selectedNodeId={selectedNodeId} 
        onShowProperties={handleShowProperties}
        isSimulationRunning={isSimulationRunning}
        simulationTime={simulationTime}
        onStartSimulation={handleStartSimulation}
        onStopSimulation={handleStopSimulation}
        onResetSimulation={handleResetSimulation}
        onStepSimulation={handleStepSimulation}
        onSetTimeStep={handleSetTimeStep}
      />

      {/* Main content */}
      <main className="flex-grow flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Canvas */}
        <ReactFlowProvider>
          <Canvas 
            onNodeSelect={handleNodeSelect}
            showProperties={showProperties}
            onCloseProperties={handleCloseProperties}
            isSimulationRunning={isSimulationRunning}
            simulationTime={simulationTime}
            onSimulationStart={handleStartSimulation}
            onSimulationStop={handleStopSimulation}
            onSimulationReset={handleResetSimulation}
            onUpdateSimulationTime={handleUpdateSimulationTime}
          />
        </ReactFlowProvider>
      </main>

      {/* Status bar */}
      <footer className="bg-gray-100 border-t border-gray-300 p-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <div>Status: Ready</div>
          <div>Simulation: {isSimulationRunning ? 'Running' : 'Idle'}</div>
        </div>
      </footer>
    </div>
  );
}