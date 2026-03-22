import { HistoricalDataPoint, ProjectionResult } from '@/types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function calculateProjection(
  amount: number,
  historicalData: HistoricalDataPoint[],
  timeframeDays: number
): ProjectionResult {
  if (!historicalData.length || amount <= 0) {
    return { projectedValue: amount, gain: 0, gainPercent: 0 };
  }

  const relevantData = historicalData.slice(-Math.min(timeframeDays, historicalData.length));
  if (relevantData.length < 2) {
    return { projectedValue: amount, gain: 0, gainPercent: 0 };
  }

  const startPrice = relevantData[0].close;
  const endPrice = relevantData[relevantData.length - 1].close;
  const historicalReturn = (endPrice - startPrice) / startPrice;

  const projectedValue = amount * (1 + historicalReturn);
  const gain = projectedValue - amount;

  return {
    projectedValue,
    gain,
    gainPercent: historicalReturn * 100,
  };
}

export function calculateBestCase(
  amount: number,
  historicalData: HistoricalDataPoint[],
  timeframeDays: number
): ProjectionResult {
  if (!historicalData.length || amount <= 0) {
    return { projectedValue: amount, gain: 0, gainPercent: 0 };
  }

  let maxReturn = 0;
  for (let i = 0; i < historicalData.length - timeframeDays; i++) {
    const startPrice = historicalData[i].close;
    const endIdx = Math.min(i + timeframeDays, historicalData.length - 1);
    const endPrice = historicalData[endIdx].close;
    const ret = (endPrice - startPrice) / startPrice;
    if (ret > maxReturn) maxReturn = ret;
  }

  if (maxReturn === 0) maxReturn = 0.05;

  const projectedValue = amount * (1 + maxReturn);
  return {
    projectedValue,
    gain: projectedValue - amount,
    gainPercent: maxReturn * 100,
  };
}

export function calculateWorstCase(
  amount: number,
  historicalData: HistoricalDataPoint[],
  timeframeDays: number
): ProjectionResult {
  if (!historicalData.length || amount <= 0) {
    return { projectedValue: amount, gain: 0, gainPercent: 0 };
  }

  let maxDrawdown = 0;
  for (let i = 0; i < historicalData.length - timeframeDays; i++) {
    const startPrice = historicalData[i].close;
    const endIdx = Math.min(i + timeframeDays, historicalData.length - 1);
    const endPrice = historicalData[endIdx].close;
    const ret = (endPrice - startPrice) / startPrice;
    if (ret < maxDrawdown) maxDrawdown = ret;
  }

  if (maxDrawdown === 0) maxDrawdown = -0.08;

  const projectedValue = amount * (1 + maxDrawdown);
  return {
    projectedValue,
    gain: projectedValue - amount,
    gainPercent: maxDrawdown * 100,
  };
}

export function timeframeToDays(tf: string): number {
  switch (tf) {
    case '1D': return 1;
    case '1W': return 7;
    case '1M': return 30;
    case '3M': return 90;
    case '1Y': return 365;
    default: return 30;
  }
}
