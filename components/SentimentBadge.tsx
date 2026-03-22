'use client';

const config = {
  bullish: { label: 'Bullish', icon: '🟢', className: 'bg-[#00E676]/10 text-[#00E676]' },
  bearish: { label: 'Bearish', icon: '🔴', className: 'bg-[#FF5252]/10 text-[#FF5252]' },
  neutral: { label: 'Neutral', icon: '🔵', className: 'bg-[#448AFF]/10 text-[#448AFF]' },
};

export default function SentimentBadge({ sentiment }: { sentiment: 'bullish' | 'bearish' | 'neutral' }) {
  const c = config[sentiment];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${c.className}`}>
      {c.icon} {c.label}
    </span>
  );
}
