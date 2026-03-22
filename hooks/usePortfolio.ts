'use client';
import { useState, useEffect, useCallback } from 'react';
import { Investment } from '@/types';
import { getInvestments, saveInvestment, removeInvestment as removeFromStorage } from '@/lib/storage';

export function usePortfolio() {
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

  const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0);
  const currentValue = investments.reduce((sum, i) => sum + i.shares * i.currentPrice, 0);
  const totalGain = currentValue - totalInvested;
  const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  return { investments, addInvestment, removeInvestment, totalInvested, currentValue, totalGain, totalGainPercent };
}
