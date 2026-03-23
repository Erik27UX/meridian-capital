'use client';
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  FavouriteStock,
  getFavourites,
  addFavourite as addToStorage,
  removeFavourite as removeFromStorage,
} from '@/lib/storage';

interface FavouritesContextValue {
  favourites: FavouriteStock[];
  addFavourite: (ticker: string, name: string) => void;
  removeFavourite: (ticker: string) => void;
  isFavourite: (ticker: string) => boolean;
}

const FavouritesContext = createContext<FavouritesContextValue | null>(null);

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const [favourites, setFavourites] = useState<FavouriteStock[]>([]);

  useEffect(() => {
    setFavourites(getFavourites());
  }, []);

  const addFavourite = useCallback((ticker: string, name: string) => {
    addToStorage({ ticker, name, addedAt: new Date().toISOString() });
    setFavourites(getFavourites());
  }, []);

  const removeFavourite = useCallback((ticker: string) => {
    removeFromStorage(ticker);
    setFavourites(getFavourites());
  }, []);

  const isFavourite = useCallback(
    (ticker: string) => favourites.some(f => f.ticker === ticker),
    [favourites]
  );

  return (
    <FavouritesContext.Provider value={{ favourites, addFavourite, removeFavourite, isFavourite }}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const ctx = useContext(FavouritesContext);
  if (!ctx) throw new Error('useFavourites must be used within FavouritesProvider');
  return ctx;
}
