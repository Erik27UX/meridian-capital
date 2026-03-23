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

// ─── Favourites ──────────────────────────────────────────────────────────────

const FAVOURITES_KEY = 'stockpulse_favourites';

export interface FavouriteStock {
  ticker: string;
  name: string;
  addedAt: string;
}

export function getFavourites(): FavouriteStock[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(FAVOURITES_KEY);
  return data ? JSON.parse(data) : [];
}

export function addFavourite(fav: FavouriteStock): void {
  const favs = getFavourites();
  if (favs.some(f => f.ticker === fav.ticker)) return;
  favs.push(fav);
  localStorage.setItem(FAVOURITES_KEY, JSON.stringify(favs));
}

export function removeFavourite(ticker: string): void {
  const favs = getFavourites().filter(f => f.ticker !== ticker);
  localStorage.setItem(FAVOURITES_KEY, JSON.stringify(favs));
}

export function isFavourite(ticker: string): boolean {
  return getFavourites().some(f => f.ticker === ticker);
}
