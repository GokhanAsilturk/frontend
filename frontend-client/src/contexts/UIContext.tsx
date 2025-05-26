import React, { createContext, useContext, ReactNode, useMemo } from 'react';

export interface UIContextType {
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

interface UIProviderProps {
  children: ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    // Basit bir console log implementasyonu
    // Gerçek implementasyonda toast notification kullanabilirsiniz
    console.log(`[${type.toUpperCase()}]: ${message}`);
  };

  const value = useMemo(() => ({
    showNotification
  }), []);

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

export const useNotification = (): UIContextType => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a UIProvider');
  }
  return context;
};