'use client';
import { Signal } from '@/types';

const config: Record<Signal, { label: string; icon: string; className: string }> = {
  'strong-buy': { label: 'Strong Buy', icon: '🟢', className: 'bg-[#00E676]/15 text-[#00E676] border-[#00E676]/25' },
  'buy': { label: 'Buy', icon: '🔵', className: 'bg-[#448AFF]/15 text-[#448AFF] border-[#448AFF]/25' },
  'hold': { label: 'Hold', icon: '🟡', className: 'bg-[#FFB300]/15 text-[#FFB300] border-[#FFB300]/25' },
  'sell': { label: 'Sell', icon: '🔴', className: 'bg-[#FF5252]/15 text-[#FF5252] border-[#FF5252]/25' },
};

export default function VibeBadge({ signal }: { signal: Signal }) {
  const c = config[signal];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${c.className}`}>
      {c.icon} {c.label}
    </span>
  );
}
