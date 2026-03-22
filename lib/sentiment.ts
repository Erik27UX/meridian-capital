const BULLISH_WORDS = ['beat', 'beats', 'surge', 'surges', 'record', 'growth', 'bullish', 'upgrade', 'raised', 'exceeds', 'accelerates', 'strong', 'soars', 'breakout', 'milestone', 'expansion', 'outperform', 'buy', 'positive', 'rally', 'boom', 'profit', 'gains', 'highs', 'improve'];
const BEARISH_WORDS = ['miss', 'misses', 'decline', 'loss', 'bearish', 'downgrade', 'concern', 'warns', 'falls', 'drops', 'slump', 'risk', 'cuts', 'lowers', 'weakens', 'antitrust', 'fine', 'lawsuit', 'investigation', 'sell', 'crash', 'plunge', 'negative', 'worst', 'fear'];

export function scoreHeadline(headline: string): 'bullish' | 'bearish' | 'neutral' {
  const lower = headline.toLowerCase();
  let score = 0;

  for (const word of BULLISH_WORDS) {
    if (lower.includes(word)) score++;
  }
  for (const word of BEARISH_WORDS) {
    if (lower.includes(word)) score--;
  }

  if (score > 0) return 'bullish';
  if (score < 0) return 'bearish';
  return 'neutral';
}

export function calculateOverallSentiment(sentiments: ('bullish' | 'bearish' | 'neutral')[]): number {
  if (!sentiments.length) return 50;
  let score = 50;
  for (const s of sentiments) {
    if (s === 'bullish') score += 10;
    if (s === 'bearish') score -= 10;
  }
  return Math.max(0, Math.min(100, score));
}
