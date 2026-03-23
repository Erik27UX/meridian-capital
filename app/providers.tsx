'use client';
import { PortfolioProvider } from '@/contexts/PortfolioContext';
import { FavouritesProvider } from '@/contexts/FavouritesContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PortfolioProvider>
      <FavouritesProvider>
        {children}
      </FavouritesProvider>
    </PortfolioProvider>
  );
}
