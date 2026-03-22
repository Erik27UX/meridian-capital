import { Stock, NewsArticle, Recommendation, HistoricalDataPoint } from '@/types';

export const mockStocks: Record<string, Stock> = {
  NVDA: { ticker: 'NVDA', name: 'NVIDIA Corporation', price: 875.40, change: 12.35, changePercent: 1.43, volume: 45200000, marketCap: 2150000000000 },
  AAPL: { ticker: 'AAPL', name: 'Apple Inc', price: 178.72, change: -1.28, changePercent: -0.71, volume: 52100000, marketCap: 2780000000000 },
  TSLA: { ticker: 'TSLA', name: 'Tesla Inc', price: 248.50, change: 8.20, changePercent: 3.41, volume: 98500000, marketCap: 790000000000 },
  MSFT: { ticker: 'MSFT', name: 'Microsoft Corporation', price: 415.60, change: 3.80, changePercent: 0.92, volume: 22400000, marketCap: 3090000000000 },
  AMZN: { ticker: 'AMZN', name: 'Amazon.com Inc', price: 186.40, change: 2.15, changePercent: 1.17, volume: 38900000, marketCap: 1940000000000 },
  META: { ticker: 'META', name: 'Meta Platforms Inc', price: 502.30, change: -4.70, changePercent: -0.93, volume: 18700000, marketCap: 1280000000000 },
  GOOGL: { ticker: 'GOOGL', name: 'Alphabet Inc', price: 155.80, change: 1.45, changePercent: 0.94, volume: 25600000, marketCap: 1930000000000 },
  SPY: { ticker: 'SPY', name: 'SPDR S&P 500 ETF', price: 512.40, change: 2.80, changePercent: 0.55, volume: 72300000, marketCap: 510000000000 },
};

export const mockNews: Record<string, NewsArticle[]> = {
  NVDA: [
    { id: 'n1', headline: 'NVIDIA beats Q4 estimates with record $18.4B data center revenue', source: 'Reuters', publishedAt: '2 hours ago', url: '#', sentiment: 'bullish', summary: 'Data center revenue surged 122% YoY, driven by unprecedented AI infrastructure demand from hyperscalers. Management guided Q1 above consensus.', relevance: 0.98 },
    { id: 'n2', headline: 'Blackwell GPU architecture seeing extraordinary demand, CEO says', source: 'CNBC', publishedAt: '4 hours ago', url: '#', sentiment: 'bullish', summary: 'Jensen Huang confirmed order backlogs extending into Q3, with major cloud providers competing for allocation. Next-gen chips deliver 4x inference performance.', relevance: 0.95 },
    { id: 'n3', headline: 'Wall Street raises NVIDIA price targets after blowout earnings', source: 'Bloomberg', publishedAt: '5 hours ago', url: '#', sentiment: 'bullish', summary: '14 out of 18 covering analysts raised targets. Average new target is $1,050, implying 20% upside from current levels.', relevance: 0.90 },
    { id: 'n4', headline: 'US tightens AI chip export controls to China', source: 'Wall Street Journal', publishedAt: '1 day ago', url: '#', sentiment: 'bearish', summary: 'New restrictions could impact $5B+ in annual China revenue. NVIDIA developing compliance-specific chips but margin impact unclear.', relevance: 0.75 },
    { id: 'n5', headline: 'AI infrastructure spending expected to reach $200B by 2025', source: 'Financial Times', publishedAt: '1 day ago', url: '#', sentiment: 'bullish', summary: 'Industry analysts project GPU demand will outstrip supply through 2025, benefiting NVIDIA as the dominant supplier with 80%+ market share.', relevance: 0.85 },
  ],
  AAPL: [
    { id: 'a1', headline: 'Apple services revenue hits record $23B as iPhone sales soften', source: 'Bloomberg', publishedAt: '5 hours ago', url: '#', sentiment: 'neutral', summary: 'Services business grew 14% YoY with record margins, but iPhone unit sales declined 3% globally. Mixed quarter reflects ongoing hardware-to-services transition.', relevance: 0.95 },
    { id: 'a2', headline: 'Apple Intelligence rollout slower than expected, analysts note', source: 'The Verge', publishedAt: '8 hours ago', url: '#', sentiment: 'bearish', summary: 'AI features still limited in availability. Competitors like Samsung and Google expanding their AI capabilities faster across device ecosystem.', relevance: 0.80 },
    { id: 'a3', headline: 'Apple Vision Pro sees enterprise adoption in healthcare and design', source: 'CNBC', publishedAt: '1 day ago', url: '#', sentiment: 'bullish', summary: 'Several Fortune 500 companies deploying Vision Pro for professional workflows. Enterprise could drive spatial computing adoption.', relevance: 0.70 },
    { id: 'a4', headline: 'EU investigation into App Store practices could force changes', source: 'Reuters', publishedAt: '1 day ago', url: '#', sentiment: 'bearish', summary: 'European regulators reviewing Apple\'s compliance with Digital Markets Act. Potential fines and forced business model changes could impact services margins.', relevance: 0.75 },
    { id: 'a5', headline: 'Apple stock consolidates near $180 resistance level', source: 'MarketWatch', publishedAt: '2 days ago', url: '#', sentiment: 'neutral', summary: 'Technical analysts note sideways trading for 60+ days. Breakout above $185 or breakdown below $170 expected to set next trend direction.', relevance: 0.65 },
  ],
  TSLA: [
    { id: 't1', headline: 'Tesla FSD v13 demonstrates 5x improvement in autonomous miles', source: 'CNBC', publishedAt: '1 hour ago', url: '#', sentiment: 'bullish', summary: 'Latest Full Self-Driving update shows dramatic improvement in miles between disengagements. Fleet data from 500K vehicles accelerating learning curve.', relevance: 0.95 },
    { id: 't2', headline: 'Tesla Energy division revenue surges 67% YoY', source: 'Reuters', publishedAt: '6 hours ago', url: '#', sentiment: 'bullish', summary: 'Megapack and Powerwall demand exceeding production capacity. Energy business approaching auto segment margins with higher growth rate.', relevance: 0.88 },
    { id: 't3', headline: 'Tesla cuts Model Y prices in China amid competitive pressure', source: 'Bloomberg', publishedAt: '1 day ago', url: '#', sentiment: 'bearish', summary: 'Third price reduction in 6 months signals intensifying competition from BYD and local EV makers. Auto gross margins may compress further.', relevance: 0.82 },
    { id: 't4', headline: 'Robotaxi launch timeline moved to late 2025, Musk confirms', source: 'Wall Street Journal', publishedAt: '1 day ago', url: '#', sentiment: 'bullish', summary: 'Elon Musk provided concrete timeline for paid autonomous ride-hailing service launch. Austin, TX selected as initial market.', relevance: 0.90 },
    { id: 't5', headline: 'Short interest in Tesla rises to 4.2% of float', source: 'MarketWatch', publishedAt: '2 days ago', url: '#', sentiment: 'bearish', summary: 'Growing bearish bets reflect skepticism about near-term profitability. However, high short interest also sets up potential squeeze dynamics.', relevance: 0.60 },
  ],
  MSFT: [
    { id: 'm1', headline: 'Microsoft Azure growth reaccelerates to 31% on AI workloads', source: 'Wall Street Journal', publishedAt: '3 hours ago', url: '#', sentiment: 'bullish', summary: 'Cloud revenue growth surprised to upside after two quarters of deceleration. AI workloads now representing meaningful portion of new Azure consumption.', relevance: 0.95 },
    { id: 'm2', headline: 'Copilot for Microsoft 365 generating $1B+ annual revenue run rate', source: 'Bloomberg', publishedAt: '6 hours ago', url: '#', sentiment: 'bullish', summary: 'Enterprise AI assistant adoption exceeding expectations. Average revenue per user increasing as organizations expand seat licenses.', relevance: 0.90 },
    { id: 'm3', headline: 'Microsoft announces $75B capital expenditure plan for AI infrastructure', source: 'Reuters', publishedAt: '1 day ago', url: '#', sentiment: 'neutral', summary: 'Massive investment in data centers and GPU capacity. While bullish on AI demand, the spending level raises questions about near-term free cash flow.', relevance: 0.85 },
    { id: 'm4', headline: 'Gaming division sees 12% growth post-Activision integration', source: 'CNBC', publishedAt: '1 day ago', url: '#', sentiment: 'bullish', summary: 'Activision Blizzard titles driving Game Pass subscriptions higher. Integration synergies ahead of schedule.', relevance: 0.70 },
    { id: 'm5', headline: 'Antitrust regulators examining Microsoft-OpenAI relationship', source: 'Financial Times', publishedAt: '2 days ago', url: '#', sentiment: 'bearish', summary: 'FTC and EU reviewing governance structure of $13B OpenAI investment. Outcome could reshape the strategic partnership.', relevance: 0.72 },
  ],
  AMZN: [
    { id: 'am1', headline: 'AWS revenue growth accelerates for third consecutive quarter', source: 'Reuters', publishedAt: '4 hours ago', url: '#', sentiment: 'bullish', summary: 'Cloud division revenue grew 19% YoY, beating estimates. Enterprise migrations and AI services driving reacceleration.', relevance: 0.93 },
    { id: 'am2', headline: 'Amazon advertising business crosses $50B annual run rate', source: 'Bloomberg', publishedAt: '8 hours ago', url: '#', sentiment: 'bullish', summary: 'Third-largest digital ad platform continues rapid growth. High-margin ad revenue improving overall profitability metrics.', relevance: 0.85 },
    { id: 'am3', headline: 'Amazon expands same-day delivery to 50 new metro areas', source: 'CNBC', publishedAt: '1 day ago', url: '#', sentiment: 'bullish', summary: 'Logistics infrastructure investment paying off with faster delivery times. Customer satisfaction scores at all-time highs.', relevance: 0.70 },
    { id: 'am4', headline: 'FTC antitrust case against Amazon moves to trial phase', source: 'Wall Street Journal', publishedAt: '2 days ago', url: '#', sentiment: 'bearish', summary: 'Government alleging anti-competitive marketplace practices. Trial could take 12-18 months with potential remedies impacting seller relationships.', relevance: 0.75 },
    { id: 'am5', headline: 'Amazon Bedrock seeing rapid enterprise adoption for generative AI', source: 'TechCrunch', publishedAt: '2 days ago', url: '#', sentiment: 'bullish', summary: 'AWS generative AI platform gaining traction with enterprise customers, offering multi-model approach that differentiates from Azure.', relevance: 0.80 },
  ],
  META: [
    { id: 'me1', headline: 'Meta Reality Labs losses widen to $4.6B in quarter', source: 'Bloomberg', publishedAt: '3 hours ago', url: '#', sentiment: 'bearish', summary: 'Metaverse division continuing heavy losses despite incremental revenue gains. Market questioning timeline to profitability for XR investments.', relevance: 0.88 },
    { id: 'me2', headline: 'Instagram Reels monetization surpassing expectations', source: 'CNBC', publishedAt: '7 hours ago', url: '#', sentiment: 'bullish', summary: 'Short-form video ad revenue gap vs TikTok narrowing. Advertiser demand for Reels placements growing 30%+ quarter over quarter.', relevance: 0.90 },
    { id: 'me3', headline: 'Meta AI assistant reaches 500M monthly users', source: 'The Verge', publishedAt: '1 day ago', url: '#', sentiment: 'bullish', summary: 'Fastest-growing AI product in consumer space. Engagement metrics suggest strong retention and increasing daily usage patterns.', relevance: 0.82 },
    { id: 'me4', headline: 'EU privacy regulators fine Meta €390M for ad targeting practices', source: 'Reuters', publishedAt: '1 day ago', url: '#', sentiment: 'bearish', summary: 'Latest in series of European regulatory actions. Cumulative fines now exceed €2B, though impact on revenue remains minimal.', relevance: 0.70 },
    { id: 'me5', headline: 'Meta stock buyback program expanded by $50B', source: 'MarketWatch', publishedAt: '2 days ago', url: '#', sentiment: 'bullish', summary: 'Board authorized additional repurchases, signaling confidence in intrinsic value. Total buyback authorization now exceeds $100B.', relevance: 0.78 },
  ],
  GOOGL: [
    { id: 'g1', headline: 'Google Cloud revenue crosses $10B quarterly milestone', source: 'Reuters', publishedAt: '4 hours ago', url: '#', sentiment: 'bullish', summary: 'Cloud division now solidly profitable with margins expanding. AI services including Vertex AI driving enterprise adoption.', relevance: 0.92 },
    { id: 'g2', headline: 'Gemini AI models closing gap with OpenAI benchmarks', source: 'The Verge', publishedAt: '6 hours ago', url: '#', sentiment: 'bullish', summary: 'Latest Gemini updates show competitive or superior performance on key benchmarks. Google leveraging internal AI for Search improvements.', relevance: 0.85 },
    { id: 'g3', headline: 'DOJ antitrust ruling could force Google to divest Chrome browser', source: 'Wall Street Journal', publishedAt: '1 day ago', url: '#', sentiment: 'bearish', summary: 'Judge\'s proposed remedies include potential Chrome divestiture and changes to default search agreements. Appeal process could take years.', relevance: 0.88 },
    { id: 'g4', headline: 'YouTube premium subscribers surpass 100M globally', source: 'Bloomberg', publishedAt: '1 day ago', url: '#', sentiment: 'bullish', summary: 'Subscription revenue growing alongside advertising. YouTube now generating $35B+ annual revenue across all monetization streams.', relevance: 0.75 },
    { id: 'g5', headline: 'Waymo autonomous rides exceed 150K per week', source: 'CNBC', publishedAt: '2 days ago', url: '#', sentiment: 'bullish', summary: 'Alphabet\'s autonomous driving unit scaling rapidly in San Francisco, Phoenix, and Los Angeles. Monetization path becoming clearer.', relevance: 0.80 },
  ],
  SPY: [
    { id: 's1', headline: 'S&P 500 hits new all-time high on strong earnings season', source: 'Reuters', publishedAt: '2 hours ago', url: '#', sentiment: 'bullish', summary: '78% of reporting companies beating earnings estimates. Breadth improving as mid-cap and value stocks participating in rally.', relevance: 0.90 },
    { id: 's2', headline: 'Fed signals potential rate cut in June amid cooling inflation', source: 'Bloomberg', publishedAt: '5 hours ago', url: '#', sentiment: 'bullish', summary: 'FOMC minutes suggest growing consensus for policy easing. Lower rates historically bullish for equity valuations.', relevance: 0.95 },
    { id: 's3', headline: 'Manufacturing PMI returns to expansion territory', source: 'Wall Street Journal', publishedAt: '1 day ago', url: '#', sentiment: 'bullish', summary: 'First expansion reading in 18 months signals economic resilience. New orders component particularly strong.', relevance: 0.78 },
    { id: 's4', headline: 'US-China trade tensions escalate with new tariff threats', source: 'Financial Times', publishedAt: '1 day ago', url: '#', sentiment: 'bearish', summary: 'Renewed tariff rhetoric creating uncertainty for multinational earnings. Technology sector particularly exposed to supply chain disruptions.', relevance: 0.82 },
    { id: 's5', headline: 'Retail investor sentiment reaches highest level since 2021', source: 'MarketWatch', publishedAt: '2 days ago', url: '#', sentiment: 'neutral', summary: 'AAII bullish sentiment at elevated levels. Historically a contrarian indicator when extreme, though currently within normal range.', relevance: 0.65 },
  ],
};

export const mockRecommendations: Recommendation[] = [
  {
    stock: mockStocks.NVDA,
    signal: 'strong-buy',
    probability: 82,
    description: 'Record data center revenue driven by AI infrastructure demand. Earnings beat by 12% with guidance above consensus. 14 analyst upgrades.',
    catalysts: ['AI chip demand', 'Earnings beat', 'Blackwell architecture'],
  },
  {
    stock: mockStocks.TSLA,
    signal: 'buy',
    probability: 68,
    description: 'FSD v13 showing breakthrough autonomous driving improvements. Energy division growing 67% YoY. Robotaxi launch timeline becoming credible.',
    catalysts: ['FSD progress', 'Energy growth', 'Robotaxi timeline'],
  },
  {
    stock: mockStocks.MSFT,
    signal: 'buy',
    probability: 76,
    description: 'Azure growth reaccelerating on AI workloads. Copilot generating $1B+ revenue run rate. Operating margins expanding. Strong buyback program.',
    catalysts: ['Azure AI growth', 'Copilot revenue', 'Margin expansion'],
  },
  {
    stock: mockStocks.AMZN,
    signal: 'buy',
    probability: 74,
    description: 'AWS reaccelerating for third straight quarter. Advertising business crossed $50B run rate. Same-day delivery expansion improving customer metrics.',
    catalysts: ['AWS growth', 'Ad revenue', 'Logistics build-out'],
  },
  {
    stock: mockStocks.AAPL,
    signal: 'hold',
    probability: 55,
    description: 'Services revenue at record highs but iPhone sales softening. No major catalyst until WWDC. Consolidating in $170-185 range for 60+ days.',
    catalysts: ['Services growth', 'Apple Intelligence rollout', 'Vision Pro enterprise'],
  },
  {
    stock: mockStocks.GOOGL,
    signal: 'buy',
    probability: 71,
    description: 'Cloud revenue crossing $10B quarterly milestone. Gemini AI models competitive with GPT. YouTube surpassing 100M premium subscribers.',
    catalysts: ['Cloud profitability', 'Gemini AI', 'YouTube growth'],
  },
];

function generateHistoricalData(basePrice: number, days: number, trend: number): HistoricalDataPoint[] {
  const data: HistoricalDataPoint[] = [];
  let price = basePrice * (1 - trend * days / 365);
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dailyChange = (Math.random() - 0.48) * price * 0.03 + (trend * price / 365);
    price = Math.max(price + dailyChange, price * 0.9);
    const high = price * (1 + Math.random() * 0.02);
    const low = price * (1 - Math.random() * 0.02);
    const open = low + Math.random() * (high - low);
    const volume = Math.floor(20000000 + Math.random() * 40000000);
    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(price.toFixed(2)),
      volume,
    });
  }
  return data;
}

export const mockHistory: Record<string, HistoricalDataPoint[]> = {
  NVDA: generateHistoricalData(875.40, 365, 0.45),
  AAPL: generateHistoricalData(178.72, 365, 0.08),
  TSLA: generateHistoricalData(248.50, 365, 0.25),
  MSFT: generateHistoricalData(415.60, 365, 0.15),
  AMZN: generateHistoricalData(186.40, 365, 0.18),
  META: generateHistoricalData(502.30, 365, 0.20),
  GOOGL: generateHistoricalData(155.80, 365, 0.12),
  SPY: generateHistoricalData(512.40, 365, 0.10),
};
