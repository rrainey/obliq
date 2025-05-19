import { ReactNode } from 'react';

interface BlockIconProps {
  type: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function BlockIcon({ type, size = 'md' }: BlockIconProps) {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const getIcon = (): ReactNode => {
    switch (type) {
      case 'sum':
        return (
          <div className={`flex items-center justify-center font-bold ${sizeClass[size]}`}>
            +
          </div>
        );
      case 'multiply':
        return (
          <div className={`flex items-center justify-center font-bold ${sizeClass[size]}`}>
            ×
          </div>
        );
      case 'transferFunction':
        return (
          <div className={`flex items-center justify-center text-xs ${sizeClass[size]}`}>
            TF
          </div>
        );
      case 'inputPort':
        return (
          <div className={`flex items-center justify-center ${sizeClass[size]}`}>
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path fill="currentColor" d="M14,12L4,2V22L14,12M20,12L18,10V14L20,12Z" />
            </svg>
          </div>
        );
      case 'outputPort':
        return (
          <div className={`flex items-center justify-center ${sizeClass[size]}`}>
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path fill="currentColor" d="M10,12L20,2V22L10,12M4,12L6,14V10L4,12Z" />
            </svg>
          </div>
        );
      case 'display':
        return (
          <div className={`flex items-center justify-center ${sizeClass[size]}`}>
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path fill="currentColor" d="M21,16H3V4H21M21,2H3C1.89,2 1,2.89 1,4V16A2,2 0 0,0 3,18H10V20H8V22H16V20H14V18H21A2,2 0 0,0 23,16V4C23,2.89 22.1,2 21,2Z" />
            </svg>
          </div>
        );
      case 'logger':
        return (
          <div className={`flex items-center justify-center ${sizeClass[size]}`}>
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path fill="currentColor" d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M7,7H17V9H7V7M7,11H17V13H7V11M7,15H14V17H7V15Z" />
            </svg>
          </div>
        );
      case 'subsystem':
        return (
          <div className={`flex items-center justify-center ${sizeClass[size]}`}>
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path fill="currentColor" d="M17.9,17.39C17.64,16.59 16.89,16 16,16H15V13A1,1 0 0,0 14,12H8V10H10A1,1 0 0,0 11,9V7H13A2,2 0 0,0 15,5V4.59C17.93,5.77 20,8.64 20,12C20,14.08 19.2,15.97 17.9,17.39M11,19.93C7.05,19.44 4,16.08 4,12C4,11.38 4.08,10.78 4.21,10.21L9,15V16A2,2 0 0,0 11,18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className={`flex items-center justify-center ${sizeClass[size]}`}>
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path fill="currentColor" d="M17,13H13V17H11V13H7V11H11V7H13V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="flex items-center justify-center rounded-full bg-gray-200 p-1">
      {getIcon()}
    </div>
  );
}