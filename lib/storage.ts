import { Investment } from '@/types';

const STORAGE_KEY = 'stockpulse_investments';

export function getInvestments(): Investment[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveInvestment(investment: Investment): void {
  const investments = getInvestments();
  investments.push(investment);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(investments));
}

export function removeInvestment(id: string): void {
  const investments = getInvestments().filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(investments));
}

export function updateInvestmentPrice(id: string, currentPrice: number): void {
  const investments = getInvestments().map(i =>
    i.id === id ? { ...i, currentPrice } : i
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(investments));
}

export function updateInvestment(investment: Investment): void {
  const investments = getInvestments().map(i =>
    i.id === investment.id ? investment : i
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(investments));
}
