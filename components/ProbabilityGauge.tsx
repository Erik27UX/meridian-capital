'use client';
import { motion } from 'framer-motion';

export default function ProbabilityGauge({ value }: { value: number }) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-silver">Bullish confidence</span>
        <span className="text-xs font-mono-num font-semibold text-[var(--sp-text)]">{value}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, #00E676, ${value > 70 ? '#00E676' : value > 50 ? '#FFB300' : '#FF5252'})`,
          }}
        />
      </div>
    </div>
  );
}
