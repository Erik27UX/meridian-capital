'use client';
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Investment } from '@/types';
import { getInvestments, saveInvestment, removeInvestment as removeFromStorage, updateInvestment as updateInStorage } from '@/lib/storage';

interface PortfolioContextValue {
  investments: Investment[];
  addInvestment: (inv: Investment) => void;
  removeInvestment: (id: string) => void;
  updateInvestment: (inv: Investment) => void;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [investments, setInvestments] = useState<Investment[]>([]);

  useEffect(() => {
    setInvestments(getInvestments());
  }, []);

  const addInvestment = useCallback((inv: Investment) => {
    saveInvestment(inv);
    setInvestments(getInvestments());
  }, []);

  const removeInvestment = useCallback((id: string) => {
    removeFromStorage(id);
    setInvestments(getInvestments());
  }, []);

  const updateInvestment = useCallback((inv: Investment) => {
    updateInStorage(inv);
    setInvestments(getInvestments());
  }, []);

  return (
    <PortfolioContext.Provider value={{ investments, addInvestment, removeInvestment, updateInvestment }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolioContext() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolioContext must be used within PortfolioProvider');
  return ctx;
}
