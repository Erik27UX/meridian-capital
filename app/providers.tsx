'use client';
import { PortfolioProvider } from '@/contexts/PortfolioContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <PortfolioProvider>{children}</PortfolioProvider>;
}
