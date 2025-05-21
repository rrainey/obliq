'use client';

import { useState } from 'react';

interface SimulationControlsProps {
  isRunning: boolean;
  currentTime: number;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onStep: () => void;
  onSetTimeStep: (step: number) => void;
}

export default function SimulationControls({
  isRunning,
  currentTime,
  onStart,
  onStop,
  onReset,
  onStep,
  onSetTimeStep,
}: SimulationControlsProps) {
  const [timeStep, setTimeStep] = useState(0.01); // Default 10ms

  // Handle time step change
  const handleTimeStepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStep = parseFloat(e.target.value);
    if (!isNaN(newStep) && newStep > 0) {
      setTimeStep(newStep);
      onSetTimeStep(newStep);
    }
  };

  return (
    <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-md border border-gray-300">
      {/* Simulation status */}
      <div className="flex items-center bg-white px-3 py-1 rounded border border-gray-300">
        <span className="text-gray-700 mr-2">Time:</span>
        <span className="font-mono text-sm">{currentTime.toFixed(2)}s</span>
      </div>

      {/* Run/stop button */}
      {isRunning ? (
        <button
          onClick={onStop}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <rect x="6" y="6" width="8" height="8" />
          </svg>
          Stop
        </button>
      ) : (
        <button
          onClick={onStart}
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4.5a.5.5 0 01.5.5v10a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5V5a.5.5 0 01.5-.5h1zm3 0a.5.5 0 01.5.5v10a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5V5a.5.5 0 01.5-.5h1z"
              clipRule="evenodd"
            />
          </svg>
          Run
        </button>
      )}

      {/* Step button */}
      <button
        onClick={onStep}
        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center"
        disabled={isRunning}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
            clipRule="evenodd"
          />
        </svg>
        Step
      </button>

      {/* Reset button */}
      <button
        onClick={onReset}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
            clipRule="evenodd"
          />
        </svg>
        Reset
      </button>

      {/* Time step input */}
      <div className="flex items-center bg-white px-3 py-1 rounded border border-gray-300">
        <span className="text-gray-700 mr-2">Step:</span>
        <input
          type="number"
          min="0.001"
          max="1"
          step="0.001"
          value={timeStep}
          onChange={handleTimeStepChange}
          className="w-16 px-1 py-0.5 border rounded text-center"
        />
        <span className="text-gray-700 ml-1">s</span>
      </div>
    </div>
  );
}