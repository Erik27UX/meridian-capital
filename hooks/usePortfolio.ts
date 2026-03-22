'use client';
import { usePortfolioContext } from '@/contexts/PortfolioContext';

export function usePortfolio() {
  const { investments, addInvestment, removeInvestment, updateInvestment } = usePortfolioContext();

  const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0);
  const currentValue = investments.reduce((sum, i) => sum + i.shares * i.currentPrice, 0);
  const totalGain = currentValue - totalInvested;
  const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  return { investments, addInvestment, removeInvestment, updateInvestment, totalInvested, currentValue, totalGain, totalGainPercent };
}
