import { HistoricalDataPoint, NewsArticle, ProjectionResult, EnhancedProjection, Stock, Timeframe } from '@/types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

// ─── Basic helpers ────────────────────────────────────────────────────────────

function getDailyReturns(data: HistoricalDataPoint[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < data.length; i++) {
    returns.push((data[i].close - data[i - 1].close) / data[i - 1].close);
  }
  return returns;
}

function avg(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = avg(arr);
  return Math.sqrt(arr.reduce((sum, x) => sum + (x - m) ** 2, 0) / arr.length);
}

// ─── Individual factor calculations ──────────────────────────────────────────

function calcRSI(data: HistoricalDataPoint[], period = 14): number {
  const returns = getDailyReturns(data);
  const recent = returns.slice(-period);
  if (recent.length < 2) return 50;
  const gains = recent.map(r => Math.max(r, 0));
  const losses = recent.map(r => Math.max(-r, 0));
  const avgGain = avg(gains);
  const avgLoss = avg(losses);
  if (avgLoss === 0) return 100;
  return 100 - 100 / (1 + avgGain / avgLoss);
}

function calcZScore(data: HistoricalDataPoint[]): number {
  const prices = data.map(d => d.close);
  const m = avg(prices);
  const s = stdDev(prices);
  if (s === 0) return 0;
  return (prices[prices.length - 1] - m) / s;
}

function calcVolumeConfirmation(data: HistoricalDataPoint[]): number {
  if (data.length < 10) return 0;
  const recent5 = data.slice(-5);
  const hist60 = data.slice(-60);
  const recentVol = avg(recent5.map(d => d.volume));
  const histVol = avg(hist60.map(d => d.volume));
  if (histVol === 0) return 0;
  const volRatio = recentVol / histVol;
  const priceReturn = (recent5[recent5.length - 1].close - recent5[0].close) / recent5[0].close;
  if (Math.abs(volRatio - 1) < 0.15) return 0;
  if (priceReturn > 0 && volRatio > 1.15) return Math.min(volRatio - 1, 1);
  if (priceReturn < 0 && volRatio > 1.15) return -Math.min(volRatio - 1, 1);
  return 0;
}

function calcVolatilityRegime(data: HistoricalDataPoint[]): number {
  const returns = getDailyReturns(data);
  if (returns.length < 20) return 1;
  const recentVol = stdDev(returns.slice(-5));
  const histVol = stdDev(returns.slice(-60));
  return histVol === 0 ? 1 : recentVol / histVol;
}

function parsePubAgeHours(publishedAt: string): number {
  const match = publishedAt.match(/(\d+)\s+(hour|day|week)/i);
  if (!match) return 1;
  const num = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  if (unit === 'hour') return num;
  if (unit === 'day') return num * 24;
  if (unit === 'week') return num * 168;
  return 24;
}

function calcNewsSentiment(
  news: NewsArticle[],
  timeframe: Timeframe
): { score: number; adjustmentPct: number } {
  // How much news can shift the estimate per timeframe (diminishes over longer horizons)
  const strength: Record<Timeframe, number> = {
    '1D': 0.10, '1W': 0.07, '1M': 0.04, '3M': 0.02, '1Y': 0.01, 'YTD': 0.02,
  };
  if (!news.length) return { score: 0, adjustmentPct: 0 };

  let weightedSum = 0;
  let totalWeight = 0;

  for (const article of news) {
    const hoursAgo = parsePubAgeHours(article.publishedAt);
    // Inverse time decay: halves every 24 hours
    const recency = 1 / (1 + hoursAgo / 24);
    const sentiment = article.sentiment === 'bullish' ? 1 : article.sentiment === 'bearish' ? -1 : 0;
    const weight = article.relevance * recency;
    weightedSum += sentiment * weight;
    totalWeight += weight;
  }

  const score = totalWeight > 0 ? weightedSum / totalWeight : 0;
  return { score, adjustmentPct: score * (strength[timeframe] ?? 0.04) * 100 };
}

// ─── Enhanced multi-factor projection ────────────────────────────────────────

export function calculateEnhancedProjection(
  amount: number,
  data: HistoricalDataPoint[],
  news: NewsArticle[],
  stock: Stock,
  aiProbability: number,
  timeframe: Timeframe
): EnhancedProjection {
  const days = timeframeToDays(timeframe);

  const zero = (v = amount): ProjectionResult => ({
    projectedValue: v, gain: v - amount, gainPercent: ((v - amount) / amount) * 100,
  });

  if (!data.length || amount <= 0) {
    return {
      expected: zero(), bull: zero(), bear: zero(),
      probabilityScore: 50, confidenceLabel: 'Weak',
      factors: { cagrSignal: 0, rsiValue: 50, rsiSignal: 0, volumeSignal: 0, momentumSignal: 0, newsSentimentScore: 0, newsSentimentSignal: 0, zScore: 0, zScoreSignal: 0, volRegime: 1, aiProbability, aiSignal: 0 },
      bullishCount: 0, bearishCount: 0, neutralCount: 7, newsAdjustmentPct: 0,
    };
  }

  const returns = getDailyReturns(data);
  const logReturns = returns.map(r => Math.log(1 + r));
  const μ = avg(logReturns);
  const σ = stdDev(logReturns);

  // ── 1. CAGR / GBM base ───────────────────────────────────────────────────
  const baseMultiplier = Math.exp(μ * days);
  const bullMultiplier = Math.exp((μ + 1.5 * σ) * days);
  const bearMultiplier = Math.exp((μ - 1.5 * σ) * days);
  const cagrReturn = baseMultiplier - 1;
  const cagrSignal: number = cagrReturn > 0.001 ? 1 : cagrReturn < -0.001 ? -1 : 0;

  // ── 2. RSI ───────────────────────────────────────────────────────────────
  const rsiValue = calcRSI(data);
  const rsiSignal: number = rsiValue < 35 ? 1 : rsiValue > 65 ? -1 : 0;

  // ── 3. Z-Score ───────────────────────────────────────────────────────────
  const zScore = calcZScore(data);
  const zScoreSignal: number = zScore < -1.5 ? 1 : zScore > 1.5 ? -1 : 0;

  // ── 4. Volume confirmation ───────────────────────────────────────────────
  const volConf = calcVolumeConfirmation(data);
  const volumeSignal: number = volConf > 0.1 ? 1 : volConf < -0.1 ? -1 : 0;

  // ── 5. Volatility regime ─────────────────────────────────────────────────
  const volRegime = calcVolatilityRegime(data);

  // ── 6. Cross-timeframe momentum consistency ──────────────────────────────
  const tfPeriods: Timeframe[] = ['1D', '1W', '1M', '3M', '1Y'];
  const momentumSigns = tfPeriods.map(p => {
    const v = stock.changesByPeriod?.[p] ?? 0;
    return v > 0 ? 1 : v < 0 ? -1 : 0;
  });
  const momentumScore = avg(momentumSigns);
  const momentumSignal: number = momentumScore > 0.2 ? 1 : momentumScore < -0.2 ? -1 : 0;

  // ── 7. News sentiment with time decay ────────────────────────────────────
  const { score: newsSentimentScore, adjustmentPct: newsAdjustmentPct } = calcNewsSentiment(news, timeframe);
  const newsSentimentSignal: number = newsSentimentScore > 0.15 ? 1 : newsSentimentScore < -0.15 ? -1 : 0;

  // ── 8. AI probability signal ─────────────────────────────────────────────
  const aiSignal: number = aiProbability > 65 ? 1 : aiProbability < 40 ? -1 : 0;

  // ── Composite adjustments to expected value ──────────────────────────────
  const newsAdj      = newsAdjustmentPct / 100;
  const rsiAdj       = rsiSignal * 0.02;
  const zAdj         = zScoreSignal * 0.015;
  const volConfAdj   = volConf * 0.015;
  const momentumAdj  = momentumScore * 0.02;

  const totalAdj = 1 + newsAdj + rsiAdj + zAdj + volConfAdj + momentumAdj;
  const expectedValue = amount * baseMultiplier * totalAdj;

  // Vol regime widens/narrows the bull/bear spread
  const regimeScale = Math.max(0.6, Math.min(2.2, volRegime));
  const bullValue = amount + (amount * (bullMultiplier - 1) * regimeScale);
  const bearValue = amount + (amount * (bearMultiplier - 1) * regimeScale);

  // ── Probability score ────────────────────────────────────────────────────
  const allSignals = [cagrSignal, rsiSignal, volumeSignal, momentumSignal, newsSentimentSignal, zScoreSignal, aiSignal];
  const baseDir = cagrSignal === 0 ? 1 : cagrSignal;
  const nonZero = allSignals.filter(s => s !== 0);
  const agreeing = nonZero.filter(s => s === baseDir).length;
  const rawProb = nonZero.length > 0 ? agreeing / nonZero.length : 0.5;
  // High volatility regime dampens confidence
  const volDampener = 1 / (1 + Math.max(0, volRegime - 1) * 0.3);
  const probabilityScore = Math.round(Math.min(99, Math.max(1, rawProb * volDampener * 100)));

  const confidenceLabel =
    probabilityScore >= 72 ? 'Strong' :
    probabilityScore >= 55 ? 'Moderate' :
    probabilityScore >= 38 ? 'Weak' : 'Conflicted';

  const bullishCount = allSignals.filter(s => s > 0).length;
  const bearishCount = allSignals.filter(s => s < 0).length;
  const neutralCount = allSignals.filter(s => s === 0).length;

  return {
    expected: zero(expectedValue),
    bull: zero(bullValue),
    bear: zero(bearValue),
    probabilityScore,
    confidenceLabel,
    factors: {
      cagrSignal, rsiValue, rsiSignal,
      volumeSignal, momentumSignal,
      newsSentimentScore, newsSentimentSignal,
      zScore, zScoreSignal,
      volRegime, aiProbability, aiSignal,
    },
    bullishCount,
    bearishCount,
    neutralCount,
    newsAdjustmentPct,
  };
}

// ─── Legacy functions (used by InvestmentCalculator) ─────────────────────────

export function calculateProjection(
  amount: number,
  historicalData: HistoricalDataPoint[],
  timeframeDays: number
): ProjectionResult {
  if (!historicalData.length || amount <= 0) return { projectedValue: amount, gain: 0, gainPercent: 0 };
  const relevant = historicalData.slice(-Math.min(timeframeDays, historicalData.length));
  if (relevant.length < 2) return { projectedValue: amount, gain: 0, gainPercent: 0 };
  const ret = (relevant[relevant.length - 1].close - relevant[0].close) / relevant[0].close;
  const projectedValue = amount * (1 + ret);
  return { projectedValue, gain: projectedValue - amount, gainPercent: ret * 100 };
}

export function calculateBestCase(
  amount: number,
  historicalData: HistoricalDataPoint[],
  timeframeDays: number
): ProjectionResult {
  if (!historicalData.length || amount <= 0) return { projectedValue: amount, gain: 0, gainPercent: 0 };
  let maxReturn = 0;
  for (let i = 0; i < historicalData.length - timeframeDays; i++) {
    const ret = (historicalData[Math.min(i + timeframeDays, historicalData.length - 1)].close - historicalData[i].close) / historicalData[i].close;
    if (ret > maxReturn) maxReturn = ret;
  }
  if (maxReturn === 0) maxReturn = 0.05;
  const projectedValue = amount * (1 + maxReturn);
  return { projectedValue, gain: projectedValue - amount, gainPercent: maxReturn * 100 };
}

export function calculateWorstCase(
  amount: number,
  historicalData: HistoricalDataPoint[],
  timeframeDays: number
): ProjectionResult {
  if (!historicalData.length || amount <= 0) return { projectedValue: amount, gain: 0, gainPercent: 0 };
  let maxDrawdown = 0;
  for (let i = 0; i < historicalData.length - timeframeDays; i++) {
    const ret = (historicalData[Math.min(i + timeframeDays, historicalData.length - 1)].close - historicalData[i].close) / historicalData[i].close;
    if (ret < maxDrawdown) maxDrawdown = ret;
  }
  if (maxDrawdown === 0) maxDrawdown = -0.08;
  const projectedValue = amount * (1 + maxDrawdown);
  return { projectedValue, gain: projectedValue - amount, gainPercent: maxDrawdown * 100 };
}

export function timeframeToDays(tf: string): number {
  switch (tf) {
    case '1D': return 1;
    case '1W': return 7;
    case '1M': return 30;
    case '3M': return 90;
    case '1Y': return 365;
    case 'YTD': {
      const now = new Date();
      const jan1 = new Date(now.getFullYear(), 0, 1);
      return Math.ceil((now.getTime() - jan1.getTime()) / (1000 * 60 * 60 * 24));
    }
    default: return 30;
  }
}
