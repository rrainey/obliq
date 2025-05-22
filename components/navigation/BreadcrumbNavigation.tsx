// components/navigation/BreadcrumbNavigation.tsx
'use client';

import { useSubsystemNavigation } from '@/lib/context/SubsystemNavigationContext';
import { ChevronRightIcon, HomeIcon, ArrowLeftIcon } from 'lucide-react';

const BreadcrumbNavigation: React.FC = () => {
  const { 
    navigationStack, 
    navigateToBreadcrumb, 
    navigateBack, 
    isInSubsystem 
  } = useSubsystemNavigation();

  if (navigationStack.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Breadcrumb path */}
        <div className="flex items-center space-x-1 text-sm">
          <HomeIcon className="w-4 h-4 text-gray-500" />
          
          {navigationStack.map((item, index) => (
            <div key={item.id} className="flex items-center">
              {index > 0 && <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />}
              
              <button
                onClick={() => navigateToBreadcrumb(index)}
                className={`px-2 py-1 rounded transition-colors ${
                  index === navigationStack.length - 1
                    ? 'bg-blue-100 text-blue-800 font-semibold'
                    : 'text-gray-700 hover:bg-gray-200 font-medium'
                }`}
                disabled={index === navigationStack.length - 1}
              >
                {item.name}
              </button>
            </div>
          ))}
        </div>

        {/* Navigation controls */}
        <div className="flex items-center space-x-2">
          {isInSubsystem && (
            <button
              onClick={navigateBack}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm font-medium transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}
          
          <div className="text-xs text-gray-500">
            {isInSubsystem 
              ? `Subsystem level ${navigationStack.length - 1}`
              : 'Main sheet'
            }
          </div>
        </div>
      </div>
      
      {/* Current sheet info */}
      {navigationStack.length > 0 && (
        <div className="mt-1 text-xs text-gray-600">
          Current: {navigationStack[navigationStack.length - 1].sheet.name} 
          {navigationStack[navigationStack.length - 1].sheet.blocks.length > 0 && (
            <span className="ml-2">
              ({navigationStack[navigationStack.length - 1].sheet.blocks.length} blocks, {navigationStack[navigationStack.length - 1].sheet.connections.length} connections)
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BreadcrumbNavigation;