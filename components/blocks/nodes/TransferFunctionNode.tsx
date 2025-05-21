'use client';

import { memo, useState, useEffect } from 'react';
import { Position, NodeProps, Handle } from 'reactflow';

export interface TransferFunctionNodeData {
  label: string;
  description?: string;
  numerator: string;
  denominator: string;
  state?: number[];  // Internal state for simulation
  connected?: boolean;
  value?: number | null;
  showEquation?: boolean;
}

const TransferFunctionNode = ({ 
  data, 
  selected, 
  id, 
  isConnectable
}: NodeProps<TransferFunctionNodeData>) => {
  const [numerator, setNumerator] = useState(data.numerator || '1');
  const [denominator, setDenominator] = useState(data.denominator || '1,1');
  const connected = data.connected || false;
  const showEquation = data.showEquation !== false;
  
  // Add animation state for value changes
  const [isHighlighted, setIsHighlighted] = useState(false);
  
  // Animate value changes
  useEffect(() => {
    if (data.value !== undefined && data.value !== null) {
      setIsHighlighted(true);
      const timeout = setTimeout(() => {
        setIsHighlighted(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [data.value]);

  // Update state when props change
  useEffect(() => {
    setNumerator(data.numerator || '1');
    setDenominator(data.denominator || '1,1');
  }, [data.numerator, data.denominator]);

  // Parse numerator and denominator into arrays
  const numeratorCoeffs = numerator.split(',').map(Number);
  const denominatorCoeffs = denominator.split(',').map(Number);
  
  // Format the transfer function equation
  const formatEquation = () => {
    const formatPolynomial = (coeffs: number[]) => {
      if (coeffs.length === 0) return '0';
      if (coeffs.length === 1) return coeffs[0].toString();
      
      return coeffs.map((coeff, index) => {
        const power = coeffs.length - 1 - index;
        if (power === 0) return coeff.toString();
        if (power === 1) return `${coeff}s`;
        return `${coeff}s^${power}`;
      }).join(' + ');
    };
    
    return `G(s) = (${formatPolynomial(numeratorCoeffs)}) / (${formatPolynomial(denominatorCoeffs)})`;
  };

  return (
    <div className={`px-4 py-4 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : connected ? 'border-green-400' : 'border-gray-300'
    } min-w-[180px] transition-all duration-200 ${isHighlighted ? 'ring-2 ring-yellow-300' : ''}`}>
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        className={`w-3 h-3 ${connected ? 'bg-green-500' : 'bg-gray-500'}`}
        isConnectable={isConnectable}
      />

      {/* Block header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{data.label}</span>
        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Transfer Fn</span>
      </div>
      
      {/* Transfer function equation */}
      {showEquation && (
        <div className="p-2 bg-gray-100 rounded mb-2 text-center">
          <div className="text-xs font-mono">{formatEquation()}</div>
        </div>
      )}
      
      {/* Current value (if in simulation) */}
      {data.value !== undefined && data.value !== null && (
        <div className={`p-2 bg-gray-100 rounded text-center mb-2 transition-colors duration-300 ${
          isHighlighted ? 'bg-yellow-100' : 'bg-gray-100'
        }`}>
          <div className="text-sm font-mono">
            Output: {typeof data.value === 'number' ? data.value.toFixed(4) : data.value}
          </div>
        </div>
      )}
      
      {/* Connection status */}
      <div className="text-xs text-center">
        {connected ? (
          <span className="text-green-600">● Connected</span>
        ) : (
          <span className="text-gray-500">○ Not connected</span>
        )}
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className={`w-3 h-3 bg-blue-500`}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default memo(TransferFunctionNode);