'use client';
import { useState, useEffect } from 'react';
import { Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, ComposedChart } from 'recharts';
import { getStockHistory } from '@/lib/api';
import { HistoricalDataPoint } from '@/types';

export default function StockChart({ ticker, entryPrice }: { ticker: string; entryPrice?: number }) {
  const [period, setPeriod] = useState('1M');
  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getStockHistory(ticker, period)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [ticker, period]);

  const isUp = data.length >= 2 && data[data.length - 1].close >= data[0].close;
  const color = isUp ? '#00E676' : '#FF5252';

  if (loading) {
    return (
      <div className="glass rounded-xl p-4">
        <div className="flex gap-2 mb-4">
          {['1D','1W','1M','3M','1Y'].map(t => (
            <div key={t} className="h-8 w-12 bg-white/5 rounded-md animate-shimmer" />
          ))}
        </div>
        <div className="h-[300px] bg-white/5 rounded-lg animate-shimmer" />
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex gap-2 mb-4">
        {['1D','1W','1M','3M','1Y'].map(t => (
          <button
            key={t}
            onClick={() => setPeriod(t)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              period === t
                ? 'bg-[var(--sp-blue)]/15 text-[var(--sp-blue)] border border-[var(--sp-blue)]/30'
                : 'bg-white/5 text-silver hover:bg-white/10'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={v => { const d = new Date(v); return `${d.getMonth()+1}/${d.getDate()}`; }}
            stroke="#333"
            tick={{ fill: '#6B6E7E', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={['auto', 'auto']}
            stroke="#333"
            tick={{ fill: '#6B6E7E', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `$${v}`}
            width={60}
          />
          <Tooltip
            contentStyle={{
              background: '#111118',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelFormatter={v => new Date(v).toLocaleDateString()}
            formatter={(value, name) => {
              const v = Number(value);
              if (name === 'volume') return [v.toLocaleString(), 'Volume'];
              return [`$${v.toFixed(2)}`, String(name).charAt(0).toUpperCase() + String(name).slice(1)];
            }}
          />
          <Area type="monotone" dataKey="close" stroke={color} strokeWidth={2} fill="url(#chartGrad)" />
          <Bar dataKey="volume" fill="rgba(255,255,255,0.06)" yAxisId="volume" barSize={2} />
          <YAxis yAxisId="volume" orientation="right" hide />
          {entryPrice && (
            <Area
              type="monotone"
              dataKey={() => entryPrice}
              stroke="#448AFF"
              strokeDasharray="5 5"
              strokeWidth={1}
              fill="none"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
