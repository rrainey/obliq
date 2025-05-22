// lib/context/SubsystemNavigationContext.tsx
'use client';

import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { Sheet } from '@/lib/models/modelSchema';

// Navigation breadcrumb item
export interface NavigationItem {
  id: string;
  name: string;
  sheet: Sheet;
  subsystemBlockId?: string; // ID of the subsystem block that contains this sheet
}

interface SubsystemNavigationContextType {
  // Current navigation state
  navigationStack: NavigationItem[];
  currentSheet: Sheet | null;
  
  // Navigation actions
  navigateToMainSheet: (mainSheet: Sheet) => void;
  navigateToSubsystem: (subsystemBlockId: string, sheet: Sheet, subsystemName: string) => void;
  navigateBack: () => void;
  navigateToBreadcrumb: (index: number) => void;
  
  // Current sheet info
  isInSubsystem: boolean;
  currentDepth: number;
}

const SubsystemNavigationContext = createContext<SubsystemNavigationContextType | null>(null);

export const useSubsystemNavigation = () => {
  const context = useContext(SubsystemNavigationContext);
  if (!context) {
    throw new Error('useSubsystemNavigation must be used within a SubsystemNavigationProvider');
  }
  return context;
};

interface SubsystemNavigationProviderProps {
  children: ReactNode;
  initialSheet: Sheet;
}

export const SubsystemNavigationProvider: React.FC<SubsystemNavigationProviderProps> = ({
  children,
  initialSheet
}) => {
  const [navigationStack, setNavigationStack] = useState<NavigationItem[]>([
    {
      id: 'main',
      name: '*main*',
      sheet: initialSheet
    }
  ]);

  // Navigate to main sheet (reset to root)
  const navigateToMainSheet = useCallback((mainSheet: Sheet) => {
    setNavigationStack([
      {
        id: 'main',
        name: '*main*',
        sheet: mainSheet
      }
    ]);
  }, []);

  // Navigate into a subsystem
  const navigateToSubsystem = useCallback((subsystemBlockId: string, sheet: Sheet, subsystemName: string) => {
    setNavigationStack(prev => [
      ...prev,
      {
        id: `subsystem-${subsystemBlockId}`,
        name: subsystemName,
        sheet: sheet,
        subsystemBlockId: subsystemBlockId
      }
    ]);
  }, []);

  // Navigate back one level
  const navigateBack = useCallback(() => {
    setNavigationStack(prev => {
      if (prev.length > 1) {
        return prev.slice(0, -1);
      }
      return prev; // Can't go back from main sheet
    });
  }, []);

  // Navigate to a specific breadcrumb level
  const navigateToBreadcrumb = useCallback((index: number) => {
    setNavigationStack(prev => {
      if (index >= 0 && index < prev.length) {
        return prev.slice(0, index + 1);
      }
      return prev;
    });
  }, []);

  // Computed values
  const currentSheet = navigationStack[navigationStack.length - 1]?.sheet || null;
  const isInSubsystem = navigationStack.length > 1;
  const currentDepth = navigationStack.length - 1;

  const contextValue: SubsystemNavigationContextType = {
    navigationStack,
    currentSheet,
    navigateToMainSheet,
    navigateToSubsystem,
    navigateBack,
    navigateToBreadcrumb,
    isInSubsystem,
    currentDepth
  };

  return (
    <SubsystemNavigationContext.Provider value={contextValue}>
      {children}
    </SubsystemNavigationContext.Provider>
  );
};