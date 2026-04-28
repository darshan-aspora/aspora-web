"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import {
  Bookmark,
  Brain,
  Check,
  X,
  ArrowUpDown,
  ChevronRight,
  BarChart3,
  Maximize2,
  GitCompareArrows,
  GraduationCap,
  Newspaper,
  CalendarDays,
  CalendarCheck,
  MessageCircle,
  Phone,
  Mail,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollableTableWidget } from "@/components/scrollable-table-widget";
import { WidgetHeader } from "@/components/widget-header";
import { motion, AnimatePresence } from "framer-motion";
import { CompactInlineStrip } from "@/components/market-status-compact";
import {
  marketStates,
  getBrowserTz,
} from "@/components/market-status-widget-v2";
import { QuickAccessV5B } from "@/components/quick-access-v3";
import {
  Video1BSpotlight,
  Funds2DWarmHandoff,
  Learn3DFriendVoice,
} from "@/components/hero-widget-v2";
import {
  type CapSize,
  type MoverType,
  oneYearChange,
  fmtPct1Y,
  fmtVol,
  oneMonthVol,
  monthlyAvgVol,
  MEGA_CONSENSUS,
  capOrder,
  capLabels,
  getStocksForCap,
  moverTabs,
} from "@/app/explore/_data/movers";
import { RangeBar, ConsensusBadge } from "@/app/explore/components/movers-atoms";
import { useWatchlist } from "@/components/watchlist-context";
/* ------------------------------------------------------------------ */
/*  Top Movers — Cardless (sticky col, single scroll container)        */
/* ------------------------------------------------------------------ */

function TopMoversCardless() {
  const router = useRouter();
  const { bookmarkedSymbols, toggleBookmark } = useWatchlist();
  const [moverType, setMoverType] = useState<MoverType>("gainers");
  const [capSize, setCapSize] = useState<CapSize>("mega");

  const stocks = getStocksForCap(moverType, capSize).slice(0, 6);

  const cycleCapSize = () =>
    setCapSize((p) => capOrder[(capOrder.indexOf(p) + 1) % capOrder.length]);

  const tabDescriptions: Record<MoverType, { title: string; body: React.ReactNode }> = {
    gainers: {
      title: "Green doesn't always mean go",
      body: (
        <div className="text-left rounded-2xl border border-border/60 overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Spot real momentum</p><p className="text-[14px] text-muted-foreground mt-0.5">Scroll right to check if revenue and profit growth back the move</p></div></div>
            <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Find breakouts with conviction</p><p className="text-[14px] text-muted-foreground mt-0.5">Strong analyst consensus + rising price = something worth watching</p></div></div>
          </div>
          <div className="border-t border-border/60" />
          <div className="p-5 space-y-4">
            <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Spikes on no news</p><p className="text-[14px] text-muted-foreground mt-0.5">If there&apos;s no catalyst, the move probably won&apos;t last</p></div></div>
            <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">High PE, negative profit growth</p><p className="text-[14px] text-muted-foreground mt-0.5">The hype may not hold. Check the numbers before chasing</p></div></div>
          </div>
        </div>
      ),
    },
    losers: {
      title: "One bad day isn't the full story",
      body: (
        <div className="text-left rounded-2xl border border-border/60 overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Find overreactions</p><p className="text-[14px] text-muted-foreground mt-0.5">Quality stocks get punished short-term all the time. Look for intact fundamentals</p></div></div>
            <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Spot dips worth buying</p><p className="text-[14px] text-muted-foreground mt-0.5">If revenue growth is strong and analysts still say buy, the dip may be your entry</p></div></div>
          </div>
          <div className="border-t border-border/60" />
          <div className="p-5 space-y-4">
            <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Declining fundamentals</p><p className="text-[14px] text-muted-foreground mt-0.5">Falling revenue + falling profit = not a dip, it&apos;s a slide</p></div></div>
            <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Sell ratings + 52W lows</p><p className="text-[14px] text-muted-foreground mt-0.5">When analysts agree it&apos;s going lower, the market might be right</p></div></div>
          </div>
        </div>
      ),
    },
    "most-active": {
      title: "Volume is the market whispering",
      body: (
        <div className="text-left rounded-2xl border border-border/60 overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Catch early signals</p><p className="text-[14px] text-muted-foreground mt-0.5">Earnings, sector shifts, or breaking news. Volume shows up before headlines do</p></div></div>
            <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Read market attention</p><p className="text-[14px] text-muted-foreground mt-0.5">See what the broader market is focused on right now, not last week</p></div></div>
          </div>
          <div className="border-t border-border/60" />
          <div className="p-5 space-y-4">
            <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Volume with flat price</p><p className="text-[14px] text-muted-foreground mt-0.5">Lots of trades but no movement? Could be big players quietly exiting</p></div></div>
            <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Meme-driven spikes</p><p className="text-[14px] text-muted-foreground mt-0.5">Fun to watch, risky to chase. These rarely hold</p></div></div>
          </div>
        </div>
      ),
    },
    "near-52w-high": {
      title: "Peaking, or just getting started?",
      body: (
        <div className="text-left rounded-2xl border border-border/60 overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Confirm real strength</p><p className="text-[14px] text-muted-foreground mt-0.5">Rising price + growing revenue + buy ratings = genuine breakout</p></div></div>
            <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Check the 1Y range</p><p className="text-[14px] text-muted-foreground mt-0.5">A stock near its high with a wide range has more story to tell</p></div></div>
          </div>
          <div className="border-t border-border/60" />
          <div className="p-5 space-y-4">
            <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Sky-high PE, slowing growth</p><p className="text-[14px] text-muted-foreground mt-0.5">When the music stops, expensive stocks fall hardest</p></div></div>
            <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">50%+ run with no earnings</p><p className="text-[14px] text-muted-foreground mt-0.5">Momentum alone doesn&apos;t pay dividends. Make sure there&apos;s substance</p></div></div>
          </div>
        </div>
      ),
    },
    "near-52w-low": {
      title: "Hidden gem or falling knife?",
      body: (
        <div className="text-left rounded-2xl border border-border/60 overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Hunt for undervalued stocks</p><p className="text-[14px] text-muted-foreground mt-0.5">If revenue growth is intact and analysts say buy, the price may not reflect reality yet</p></div></div>
            <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Find contrarian plays</p><p className="text-[14px] text-muted-foreground mt-0.5">The best entries often feel uncomfortable. That&apos;s why most people miss them</p></div></div>
          </div>
          <div className="border-t border-border/60" />
          <div className="p-5 space-y-4">
            <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Negative growth across the board</p><p className="text-[14px] text-muted-foreground mt-0.5">Cheap for a reason. If revenue and profits are both shrinking, stay cautious</p></div></div>
            <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">All sell ratings, no coverage</p><p className="text-[14px] text-muted-foreground mt-0.5">When even analysts won&apos;t touch it, there&apos;s usually a good reason</p></div></div>
          </div>
        </div>
      ),
    },
  };

  const showConsensus = capSize === "mega";

  const columns = [
    { header: "Stock", align: "left" as const },
    { header: "Price", align: "right" as const },
    { header: "1Y", align: "right" as const, minWidth: 80 },
    ...(showConsensus ? [{ header: "Consensus", align: "center" as const, minWidth: 120 }] : []),
    { header: "PE", align: "right" as const, minWidth: 48 },
    { header: "M.Cap", align: "right" as const, minWidth: 68 },
    { header: "Rev Gr.", align: "right" as const, minWidth: 74 },
    { header: "Profit Gr.", align: "right" as const, minWidth: 80 },
    { header: "1M Volume", align: "right" as const, minWidth: 80 },
    { header: "Monthly Avg Vol", align: "right" as const, minWidth: 110 },
    { header: "1Y Range", align: "center" as const, minWidth: 136 },
    { header: "Watchlist", align: "center" as const, minWidth: 80 },
  ];

  const rows = stocks.map((stock) => {
    const chgColor = stock.changePercent >= 0 ? "text-emerald-500" : "text-red-500";
    const oneY = oneYearChange(stock.symbol);
    return [
      <div key="name" className="flex items-center gap-2.5">
        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-muted-foreground/25" />
        <p className="min-w-0 text-[14px] font-semibold leading-tight text-foreground line-clamp-2">{stock.name}</p>
      </div>,
      <div key="price" className="flex flex-col items-end">
        <span className="whitespace-nowrap tabular-nums text-[14px] text-foreground">{stock.price.toFixed(1)}</span>
        <span className={cn("whitespace-nowrap tabular-nums text-[12px] font-semibold", chgColor)}>{stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(1)}%</span>
      </div>,
      <span key="1y" className={cn("whitespace-nowrap tabular-nums text-[14px] font-semibold", oneY >= 0 ? "text-emerald-500" : "text-red-500")}>{fmtPct1Y(stock.symbol)}</span>,
      ...(showConsensus ? [
        <div key="consensus" className="flex justify-center">
          <ConsensusBadge {...(MEGA_CONSENSUS[stock.symbol] ?? { buy: 10, hold: 10, sell: 5 })} />
        </div>,
      ] : []),
      <span key="pe" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{stock.pe != null ? Math.round(stock.pe) : "—"}</span>,
      <span key="mcap" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{stock.marketCap.replace("$", "")}</span>,
      <span key="rev" className={cn("whitespace-nowrap tabular-nums text-[14px] font-medium", stock.revGrowth >= 0 ? "text-emerald-500" : "text-red-500")}>{stock.revGrowth >= 0 ? "+" : ""}{Math.round(stock.revGrowth)}%</span>,
      <span key="profit" className={cn("whitespace-nowrap tabular-nums text-[14px] font-medium", stock.profitGrowth >= 0 ? "text-emerald-500" : "text-red-500")}>{stock.profitGrowth >= 0 ? "+" : ""}{Math.round(stock.profitGrowth)}%</span>,
      <span key="mvol" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{fmtVol(oneMonthVol(stock.symbol))}</span>,
      <span key="mavol" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{fmtVol(monthlyAvgVol(stock.symbol))}</span>,
      <RangeBar key="range" low={stock.low52w} high={stock.high52w} current={stock.price} />,
      <div key="watch" className="flex justify-center">
        <button onClick={() => toggleBookmark(stock.symbol)} className="transition-transform active:scale-90">
          <Bookmark size={20} strokeWidth={1.8} className={cn("transition-colors", bookmarkedSymbols.has(stock.symbol) ? "fill-foreground text-foreground" : "text-muted-foreground/50")} />
        </button>
      </div>,
    ];
  });

  return (
    <ScrollableTableWidget
      title="What's Moving"
      description="Today&apos;s biggest moves, sliced by direction and size. Green doesn&apos;t always mean go. Context tells you why."
      flipper={{
        label: capLabels[capSize],
        icon: <ArrowUpDown size={13} className="flex-shrink-0 text-muted-foreground" />,
        onFlip: cycleCapSize,
      }}
      tabs={moverTabs}
      activeTab={moverType}
      onTabChange={(id) => setMoverType(id as MoverType)}
      tabDescription={tabDescriptions[moverType]}
      pillLayoutId="mover-tab-pill"
      columns={columns}
      rows={rows}
      animationKey={`${moverType}-${capSize}`}
      onRowClick={(i) => router.push(`/stocks/${stocks[i].symbol}`)}
      footer={{
        label: "View All",
        onPress: () => {
          const caps = capSize === "all" ? "mega,large,midcap,small" : capSize;
          router.push(`/explore/whats-moving?type=${moverType}&cap=${caps}`);
        },
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Smart Collections — data                                           */
/* ------------------------------------------------------------------ */

interface Collection {
  name: string;
  description: string;
  return1y: number;
  return3y: number;
  return5y: number;
  stocks: number;
  etfs?: number;
  logos: string[];
  minAmount: number;
  customisable?: boolean;
  weighting: "Equal" | "Market Cap" | "Custom";
  type: "Stocks" | "ETFs" | "Mixed";
}

const smartCollections: Collection[] = [
  {
    name: "Tech Giants",
    description: "High-growth silicon leaders dominating the global digital infrastructure and AI sector.",
    return1y: 4.2, return3y: 18.7, return5y: 32.4,
    stocks: 15, logos: ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA"],
    minAmount: 1234, customisable: true, weighting: "Market Cap", type: "Stocks",
  },
  {
    name: "AI & Robotics",
    description: "Top AI, automation & chip companies driving the next wave of computing.",
    return1y: 12.8, return3y: 42.1, return5y: 68.3,
    stocks: 10, logos: ["NVDA", "AMD", "PLTR", "GOOGL", "MSFT"],
    minAmount: 500, weighting: "Equal", type: "Stocks",
  },
  {
    name: "Clean Energy",
    description: "Solar, wind & EV ecosystem shaping the future of sustainable infrastructure.",
    return1y: -2.4, return3y: 8.9, return5y: 24.1,
    stocks: 12, logos: ["TSLA", "ENPH", "FSLR", "NEE", "PLUG"],
    minAmount: 750, customisable: true, weighting: "Equal", type: "Stocks",
  },
  {
    name: "Global ETF Pack",
    description: "Broad exposure across US, Europe, and emerging markets through top ETFs.",
    return1y: 8.1, return3y: 12.4, return5y: 22.8,
    stocks: 0, etfs: 8, logos: ["SPY", "QQQ", "VWO", "EFA", "AGG"],
    minAmount: 250, weighting: "Custom", type: "ETFs",
  },
  {
    name: "ETF Starter Kit",
    description: "The 5 ETFs every new investor should know. Simple, diversified, low cost.",
    return1y: 9.4, return3y: 14.2, return5y: 19.6,
    stocks: 0, etfs: 5, logos: ["VOO", "VTI", "QQQ", "BND", "VEA"],
    minAmount: 100, weighting: "Equal", type: "ETFs",
  },
  {
    name: "Nano Cap Winners",
    description: "Small companies with outsized returns. High risk, high reward micro-cap picks.",
    return1y: 34.2, return3y: 52.8, return5y: 78.1,
    stocks: 12, logos: ["SMCI", "IONQ", "RKLB", "JOBY", "DNA"],
    minAmount: 200, weighting: "Equal", type: "Stocks",
  },
  {
    name: "Dividend Machines",
    description: "Stocks that pay you to hold them. 25+ years of consecutive dividend increases.",
    return1y: 6.8, return3y: 10.2, return5y: 14.5,
    stocks: 10, logos: ["JNJ", "KO", "PG", "PEP", "MMM"],
    minAmount: 500, customisable: true, weighting: "Market Cap", type: "Stocks",
  },
  {
    name: "Healthcare Innovation",
    description: "Biotech, medtech and digital health companies reshaping how we treat disease.",
    return1y: 3.2, return3y: 15.8, return5y: 28.4,
    stocks: 7, etfs: 3, logos: ["LLY", "UNH", "ISRG", "DXCM", "MRNA"],
    minAmount: 600, weighting: "Equal", type: "Mixed",
  },
  {
    name: "Cybersecurity",
    description: "The companies protecting the digital world. Every breach makes this sector more essential.",
    return1y: 11.4, return3y: 28.6, return5y: 45.2,
    stocks: 8, logos: ["CRWD", "PANW", "ZS", "FTNT", "NET"],
    minAmount: 400, weighting: "Custom", type: "Stocks",
  },
  {
    name: "FAANG+",
    description: "The original tech titans plus the next generation. The stocks that move the market.",
    return1y: 5.8, return3y: 20.4, return5y: 35.6,
    stocks: 8, logos: ["META", "AAPL", "AMZN", "NFLX", "GOOGL"],
    minAmount: 800, customisable: true, weighting: "Market Cap", type: "Stocks",
  },
];

/* ------------------------------------------------------------------ */
/*  Smart Collections — card                                           */
/* ------------------------------------------------------------------ */

function CollectionCardAlt({ c }: { c: Collection }) {
  return (
    <button className="w-full rounded-2xl border border-border/60 p-5 text-left active:scale-[0.98] transition-transform">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] font-bold text-foreground leading-tight">{c.name}</h3>
          <p className="text-[14px] text-muted-foreground">
            {c.type === "Stocks" && `${c.stocks} Stocks`}
            {c.type === "ETFs" && `${c.etfs} ETFs`}
            {c.type === "Mixed" && `${c.stocks} Stocks · ${c.etfs} ETFs`}
          </p>
        </div>
        {/* Overlapping logo stack */}
        <div className="flex shrink-0">
          {c.logos.slice(0, 4).map((_, i) => (
            <div
              key={i}
              className="h-7 w-7 rounded-full bg-zinc-300 dark:bg-zinc-600 border-2 border-background"
              style={{ marginLeft: i === 0 ? 0 : -8, zIndex: 5 - i }}
            />
          ))}
        </div>
      </div>
      <p className="text-[14px] text-muted-foreground leading-relaxed mb-3">{c.description}</p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[12px] text-muted-foreground/50">Allocation</p>
          <p className="text-[14px] font-medium text-foreground">{c.weighting === "Equal" ? "Equi Weighted" : c.weighting === "Market Cap" ? "Market Cap Weighted" : "Custom Weights"}</p>
        </div>
        <div className="text-right">
          <p className="text-[12px] text-muted-foreground/50">Minimum</p>
          <p className="text-[14px] font-medium text-foreground tabular-nums">${c.minAmount.toLocaleString()}</p>
        </div>
      </div>
    </button>
  );
}


/* ------------------------------------------------------------------ */
/*  Collections Widget                                                 */
/* ------------------------------------------------------------------ */

type CollectionTab = "all" | "invested" | "saved" | "tech" | "etf" | "nano" | "income" | "esg" | "growth" | "sector";
const collectionTabs: { id: CollectionTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "invested", label: "Invested" },
  { id: "saved", label: "Saved" },
  { id: "tech", label: "Tech & AI" },
  { id: "etf", label: "ETFs" },
  { id: "nano", label: "Nano Caps" },
  { id: "income", label: "Income" },
  { id: "esg", label: "Clean Energy" },
  { id: "growth", label: "Growth" },
  { id: "sector", label: "Sector Bets" },
];

const collectionsByTab: Record<CollectionTab, Collection[]> = {
  all: [
    smartCollections.find((c) => c.name === "Tech Giants")!,
    smartCollections.find((c) => c.name === "Global ETF Pack")!,
    smartCollections.find((c) => c.name === "Healthcare Innovation")!,
    ...smartCollections.filter((c) => !["Tech Giants", "Global ETF Pack", "Healthcare Innovation"].includes(c.name)),
  ],
  invested: smartCollections.filter((c) => c.name === "Tech Giants" || c.name === "AI & Robotics"),
  saved: smartCollections.filter((c) => c.name === "Clean Energy" || c.name === "Dividend Machines" || c.name === "FAANG+"),
  tech: smartCollections.filter((c) => ["Tech Giants", "AI & Robotics", "Cybersecurity", "FAANG+"].includes(c.name)),
  etf: smartCollections.filter((c) => c.name.includes("ETF")),
  nano: smartCollections.filter((c) => c.name === "Nano Cap Winners"),
  income: smartCollections.filter((c) => c.name === "Dividend Machines"),
  esg: smartCollections.filter((c) => c.name === "Clean Energy"),
  growth: smartCollections.filter((c) => ["AI & Robotics", "Nano Cap Winners", "Cybersecurity"].includes(c.name)),
  sector: smartCollections.filter((c) => ["Healthcare Innovation", "Cybersecurity", "Clean Energy"].includes(c.name)),
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const collectionDescriptions: Record<CollectionTab, { title: string; body: React.ReactNode }> = {
  invested: {
    title: "Your active collections",
    body: (
      <div className="text-left rounded-2xl border border-border/60 overflow-hidden">
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Track what you own</p><p className="text-[14px] text-muted-foreground mt-0.5">These are the collections you&apos;ve put money into. Monitor performance all in one place</p></div></div>
        </div>
        <div className="border-t border-border/60" />
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Don&apos;t set and forget forever</p><p className="text-[14px] text-muted-foreground mt-0.5">Check in periodically. A collection that made sense 6 months ago might need a rethink</p></div></div>
        </div>
      </div>
    ),
  },
  saved: {
    title: "Your bookmarked collections",
    body: (
      <div className="text-left rounded-2xl border border-border/60 overflow-hidden">
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Your research shortlist</p><p className="text-[14px] text-muted-foreground mt-0.5">Collections you&apos;ve saved for later. Take your time, do the research, invest when ready</p></div></div>
        </div>
        <div className="border-t border-border/60" />
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Saving isn&apos;t investing</p><p className="text-[14px] text-muted-foreground mt-0.5">A saved collection doesn&apos;t earn you returns. When you&apos;re ready, tap invest</p></div></div>
        </div>
      </div>
    ),
  },
  etf: {
    title: "The easy button for diversification",
    body: (
      <div className="text-left rounded-2xl border border-border/60 overflow-hidden">
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Instant global exposure</p><p className="text-[14px] text-muted-foreground mt-0.5">ETF collections bundle multiple funds covering US, Europe, and emerging markets in one tap</p></div></div>
          <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Lower costs than individual stocks</p><p className="text-[14px] text-muted-foreground mt-0.5">ETFs already have built-in diversification. A collection of ETFs takes it even further</p></div></div>
        </div>
        <div className="border-t border-border/60" />
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Overlap can sneak in</p><p className="text-[14px] text-muted-foreground mt-0.5">Two different ETFs might hold the same stocks. Check the underlying holdings to avoid doubling up</p></div></div>
        </div>
      </div>
    ),
  },
  nano: {
    title: "Small bets, big swings",
    body: (
      <div className="text-left rounded-2xl border border-border/60 overflow-hidden">
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Outsized return potential</p><p className="text-[14px] text-muted-foreground mt-0.5">Nano and micro-cap stocks can multiply fast when they hit. The winners here can be massive</p></div></div>
        </div>
        <div className="border-t border-border/60" />
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">High risk, seriously</p><p className="text-[14px] text-muted-foreground mt-0.5">These are volatile, thinly traded, and can lose 50%+ fast. Only invest money you can afford to lose entirely</p></div></div>
          <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Liquidity can be a problem</p><p className="text-[14px] text-muted-foreground mt-0.5">Small stocks sometimes have wide bid-ask spreads. Getting out at the price you want isn&apos;t always possible</p></div></div>
        </div>
      </div>
    ),
  },
  all: {
    title: "What are Collections?",
    body: (
      <div className="text-left rounded-2xl border border-border/60 overflow-hidden">
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">One tap, multiple stocks</p><p className="text-[14px] text-muted-foreground mt-0.5">A collection is a pre-built basket of stocks. You invest once and get instant diversification across a theme</p></div></div>
          <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Cheaper than buying individually</p><p className="text-[14px] text-muted-foreground mt-0.5">One order instead of 10-15 separate trades. Lower fees, less hassle, same exposure</p></div></div>
        </div>
        <div className="border-t border-border/60" />
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">This is not financial advice</p><p className="text-[14px] text-muted-foreground mt-0.5">Collections are tools, not recommendations. Past returns don&apos;t guarantee future performance</p></div></div>
          <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Check what&apos;s inside before investing</p><p className="text-[14px] text-muted-foreground mt-0.5">Tap any collection to see which stocks are included, their weights, and how they&apos;ve performed</p></div></div>
        </div>
      </div>
    ),
  },
  tech: {
    title: "Tech is eating the world",
    body: (
      <div className="text-left rounded-2xl border border-border/60 overflow-hidden">
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">High growth potential</p><p className="text-[14px] text-muted-foreground mt-0.5">Tech and AI companies are driving the biggest value creation in the market right now</p></div></div>
          <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Spread across the stack</p><p className="text-[14px] text-muted-foreground mt-0.5">From chips to cloud to applications. Not just one company, the whole ecosystem</p></div></div>
        </div>
        <div className="border-t border-border/60" />
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Valuations can be stretched</p><p className="text-[14px] text-muted-foreground mt-0.5">Tech stocks often trade at high PE ratios. When sentiment shifts, corrections can be sharp</p></div></div>
          <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Concentrated in a few names</p><p className="text-[14px] text-muted-foreground mt-0.5">The biggest tech stocks dominate these collections. If they stumble, the whole basket feels it</p></div></div>
        </div>
      </div>
    ),
  },
  income: {
    title: "Built for steady income",
    body: (
      <div className="text-left rounded-2xl border border-border/60 overflow-hidden">
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Reliable dividend payers</p><p className="text-[14px] text-muted-foreground mt-0.5">Companies with long track records of paying and growing dividends</p></div></div>
        </div>
        <div className="border-t border-border/60" />
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Lower growth potential</p><p className="text-[14px] text-muted-foreground mt-0.5">Income stocks tend to be mature companies. The trade-off for stability is slower price appreciation</p></div></div>
        </div>
      </div>
    ),
  },
  esg: {
    title: "Invest in what matters",
    body: (
      <div className="text-left rounded-2xl border border-border/60 overflow-hidden">
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Align your portfolio with your values</p><p className="text-[14px] text-muted-foreground mt-0.5">Clean energy, solar, wind, and EV companies shaping a sustainable future</p></div></div>
        </div>
        <div className="border-t border-border/60" />
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Policy-dependent sector</p><p className="text-[14px] text-muted-foreground mt-0.5">Clean energy stocks are sensitive to government subsidies and regulation changes</p></div></div>
        </div>
      </div>
    ),
  },
  growth: {
    title: "Betting on the future",
    body: (
      <div className="text-left rounded-2xl border border-border/60 overflow-hidden">
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Highest upside potential</p><p className="text-[14px] text-muted-foreground mt-0.5">Companies growing revenue and earnings faster than the market. The next big winners live here</p></div></div>
        </div>
        <div className="border-t border-border/60" />
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Higher volatility</p><p className="text-[14px] text-muted-foreground mt-0.5">Growth stocks swing harder in both directions. Be ready for drawdowns along the way</p></div></div>
        </div>
      </div>
    ),
  },
  sector: {
    title: "Pick a lane",
    body: (
      <div className="text-left rounded-2xl border border-border/60 overflow-hidden">
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Targeted sector exposure</p><p className="text-[14px] text-muted-foreground mt-0.5">Bet on a specific part of the economy. Healthcare, finance, industrials, your pick</p></div></div>
        </div>
        <div className="border-t border-border/60" />
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">No diversification across sectors</p><p className="text-[14px] text-muted-foreground mt-0.5">By design, these are concentrated. If the sector turns, everything in the basket turns with it</p></div></div>
        </div>
      </div>
    ),
  },
};

function RecurringBasketsWidget() {
  const [activeTab, setActiveTab] = useState<CollectionTab>("all");
  const [expanded, setExpanded] = useState(false);
  const collections = collectionsByTab[activeTab];
  const visible = expanded ? collections : collections.slice(0, 3);
  const hasMore = collections.length > 3;

  return (
    <WidgetHeader
      title="Collections"
      description="One tap, a basket of stocks. Built around a theme, priced cheaper than buying each one yourself."
      tabs={collectionTabs}
      activeTab={activeTab}
      onTabChange={(id) => { setActiveTab(id as CollectionTab); setExpanded(false); }}
      pillLayoutId="collection-tab-pill"
    >
      <div className="space-y-2.5">
        {visible.length > 0 ? (
          visible.map((c) => <CollectionCardAlt key={c.name} c={c} />)
        ) : (
          <div className="rounded-2xl border border-border/60 py-10 text-center">
            <p className="text-[14px] text-muted-foreground">Coming soon</p>
          </div>
        )}
      </div>

      {hasMore && !expanded && (
        <Link
          href="/explore/popular-stocks"
          className="mt-2.5 flex w-full items-center justify-center gap-1 py-3 text-[14px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          View All
          <ChevronRight size={16} />
        </Link>
      )}
    </WidgetHeader>
  );
}

/* ------------------------------------------------------------------ */
/*  Stocks by Analyst Ratings — types & data                           */
/* ------------------------------------------------------------------ */

type RatingTab = "strong-buy" | "buy" | "hold" | "sell";

const ratingTabs: { id: RatingTab; label: string }[] = [
  { id: "strong-buy", label: "Strong Buy" },
  { id: "buy", label: "Buy" },
  { id: "hold", label: "Hold" },
  { id: "sell", label: "Sell" },
];

interface RatedStock {
  symbol: string;
  name: string;
  price: number;
  targetPrice: number;
  upside: number;
  analystCount: number;
  buy: number;
  hold: number;
  sell: number;
  avgVolume: string;
  marketCap: string;
  sector: string;
  color: string;
}

const ratedStocks: Record<RatingTab, RatedStock[]> = {
  "strong-buy": [
    { symbol: "NVDA", name: "NVIDIA", price: 892.45, targetPrice: 1050.0, upside: 17.7, analystCount: 42, buy: 38, hold: 3, sell: 1, avgVolume: "52M", marketCap: "$2.2T", sector: "Tech", color: "#76B900" },
    { symbol: "AMZN", name: "Amazon", price: 186.42, targetPrice: 225.0, upside: 20.7, analystCount: 48, buy: 44, hold: 3, sell: 1, avgVolume: "46M", marketCap: "$1.9T", sector: "Consumer", color: "#FF9900" },
    { symbol: "META", name: "Meta Platforms", price: 523.80, targetPrice: 610.0, upside: 16.5, analystCount: 40, buy: 36, hold: 3, sell: 1, avgVolume: "28M", marketCap: "$1.3T", sector: "Tech", color: "#0668E1" },
    { symbol: "LLY", name: "Eli Lilly", price: 782.35, targetPrice: 920.0, upside: 17.6, analystCount: 28, buy: 25, hold: 2, sell: 1, avgVolume: "3.2M", marketCap: "$742B", sector: "Health", color: "#D42B2B" },
    { symbol: "AVGO", name: "Broadcom", price: 1320.60, targetPrice: 1580.0, upside: 19.6, analystCount: 30, buy: 27, hold: 2, sell: 1, avgVolume: "5.1M", marketCap: "$614B", sector: "Tech", color: "#CC0000" },
  ],
  buy: [
    { symbol: "MSFT", name: "Microsoft", price: 428.15, targetPrice: 480.0, upside: 12.1, analystCount: 44, buy: 35, hold: 8, sell: 1, avgVolume: "22M", marketCap: "$3.2T", sector: "Tech", color: "#00A4EF" },
    { symbol: "AAPL", name: "Apple", price: 198.36, targetPrice: 220.0, upside: 10.9, analystCount: 40, buy: 30, hold: 8, sell: 2, avgVolume: "39M", marketCap: "$3.0T", sector: "Tech", color: "#555555" },
    { symbol: "GOOGL", name: "Alphabet", price: 152.67, targetPrice: 175.0, upside: 14.6, analystCount: 42, buy: 33, hold: 7, sell: 2, avgVolume: "33M", marketCap: "$1.9T", sector: "Tech", color: "#4285F4" },
    { symbol: "V", name: "Visa", price: 285.60, targetPrice: 320.0, upside: 12.1, analystCount: 34, buy: 28, hold: 5, sell: 1, avgVolume: "7.1M", marketCap: "$588B", sector: "Finance", color: "#1A1F71" },
    { symbol: "UNH", name: "UnitedHealth", price: 524.30, targetPrice: 590.0, upside: 12.5, analystCount: 28, buy: 22, hold: 5, sell: 1, avgVolume: "4.3M", marketCap: "$484B", sector: "Health", color: "#002677" },
  ],
  hold: [
    { symbol: "KO", name: "Coca-Cola", price: 62.45, targetPrice: 64.0, upside: 2.5, analystCount: 24, buy: 8, hold: 14, sell: 2, avgVolume: "12M", marketCap: "$270B", sector: "Consumer", color: "#F40000" },
    { symbol: "PEP", name: "PepsiCo", price: 172.30, targetPrice: 178.0, upside: 3.3, analystCount: 22, buy: 7, hold: 13, sell: 2, avgVolume: "5.6M", marketCap: "$237B", sector: "Consumer", color: "#004B93" },
    { symbol: "PG", name: "Procter & Gamble", price: 168.90, targetPrice: 172.0, upside: 1.8, analystCount: 22, buy: 6, hold: 14, sell: 2, avgVolume: "6.8M", marketCap: "$398B", sector: "Consumer", color: "#003DA5" },
    { symbol: "VZ", name: "Verizon", price: 42.15, targetPrice: 44.0, upside: 4.4, analystCount: 26, buy: 6, hold: 18, sell: 2, avgVolume: "15M", marketCap: "$177B", sector: "Telecom", color: "#CD040B" },
    { symbol: "IBM", name: "IBM", price: 188.72, targetPrice: 192.0, upside: 1.7, analystCount: 20, buy: 5, hold: 12, sell: 3, avgVolume: "4.2M", marketCap: "$172B", sector: "Tech", color: "#054ADA" },
  ],
  sell: [
    { symbol: "TSLA", name: "Tesla", price: 178.24, targetPrice: 152.0, upside: -14.7, analystCount: 40, buy: 12, hold: 14, sell: 14, avgVolume: "112M", marketCap: "$568B", sector: "Auto", color: "#CC0000" },
    { symbol: "SNAP", name: "Snap Inc", price: 11.24, targetPrice: 9.50, upside: -15.5, analystCount: 32, buy: 4, hold: 14, sell: 14, avgVolume: "45M", marketCap: "$18B", sector: "Tech", color: "#EAAB00" },
    { symbol: "RIVN", name: "Rivian", price: 15.63, targetPrice: 12.0, upside: -23.2, analystCount: 24, buy: 3, hold: 8, sell: 13, avgVolume: "39M", marketCap: "$16B", sector: "Auto", color: "#2D6A4F" },
    { symbol: "NKLA", name: "Nikola", price: 0.87, targetPrice: 0.50, upside: -42.5, analystCount: 8, buy: 0, hold: 2, sell: 6, avgVolume: "32M", marketCap: "$418M", sector: "Auto", color: "#2563EB" },
    { symbol: "BYND", name: "Beyond Meat", price: 7.82, targetPrice: 5.50, upside: -29.7, analystCount: 14, buy: 1, hold: 4, sell: 9, avgVolume: "4.8M", marketCap: "$501M", sector: "Consumer", color: "#00A14B" },
  ],
};

/* ------------------------------------------------------------------ */
/*  Stocks by Analyst Ratings Widget                                   */
/* ------------------------------------------------------------------ */

function AnalystRatingsWidget() {
  const router = useRouter();
  const [ratingTab, setRatingTab] = useState<RatingTab>("strong-buy");
  const [capSize, setCapSize] = useState<CapSize>("mega");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const cycleCapSize = () =>
    setCapSize((p) => capOrder[(capOrder.indexOf(p) + 1) % capOrder.length]);

  const stocks = ratedStocks[ratingTab];

  const toggleBookmark = (sym: string) =>
    setBookmarks((p) => {
      const n = new Set(p);
      if (n.has(sym)) n.delete(sym); else n.add(sym);
      return n;
    });

  const ratingDescriptions: Record<RatingTab, { title: string; body: React.ReactNode }> = {
    "strong-buy": {
      title: "Wall Street's top picks",
      body: (
        <div className="text-left rounded-2xl border border-border/60 overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Near-unanimous analyst conviction</p><p className="text-[14px] text-muted-foreground mt-0.5">Most analysts covering these stocks are saying buy. That level of agreement is rare</p></div></div>
            <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Compare upside to target price</p><p className="text-[14px] text-muted-foreground mt-0.5">The gap between current price and target tells you how much room analysts see</p></div></div>
          </div>
          <div className="border-t border-border/60" />
          <div className="p-5 space-y-4">
            <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Analysts can be wrong together</p><p className="text-[14px] text-muted-foreground mt-0.5">Consensus doesn&apos;t mean certainty. Always check if the fundamentals support the rating</p></div></div>
            <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Don&apos;t ignore valuation</p><p className="text-[14px] text-muted-foreground mt-0.5">A stock can be a &quot;strong buy&quot; and still expensive. The target price matters more than the label</p></div></div>
          </div>
        </div>
      ),
    },
    buy: {
      title: "Analysts are bullish, with caveats",
      body: (
        <div className="text-left rounded-2xl border border-border/60 overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Solid picks with broad support</p><p className="text-[14px] text-muted-foreground mt-0.5">These stocks have more buy ratings than hold or sell. The street likes them</p></div></div>
            <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Look at the consensus bar</p><p className="text-[14px] text-muted-foreground mt-0.5">A mostly green bar means most analysts agree. A mixed bar means opinions are split</p></div></div>
          </div>
          <div className="border-t border-border/60" />
          <div className="p-5 space-y-4">
            <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Small upside can mean limited room</p><p className="text-[14px] text-muted-foreground mt-0.5">If the target price is close to current price, the easy gains may already be priced in</p></div></div>
            <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Ratings lag behind reality</p><p className="text-[14px] text-muted-foreground mt-0.5">Analyst updates can take weeks. A lot can change between their report and today</p></div></div>
          </div>
        </div>
      ),
    },
    hold: {
      title: "The market's grey zone",
      body: (
        <div className="text-left rounded-2xl border border-border/60 overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Good if you already own them</p><p className="text-[14px] text-muted-foreground mt-0.5">Hold means analysts don&apos;t see a reason to sell. Steady names for stable portfolios</p></div></div>
            <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Dividend candidates</p><p className="text-[14px] text-muted-foreground mt-0.5">Many hold-rated stocks are mature companies paying reliable dividends</p></div></div>
          </div>
          <div className="border-t border-border/60" />
          <div className="p-5 space-y-4">
            <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Limited upside expected</p><p className="text-[14px] text-muted-foreground mt-0.5">The target price is usually close to current price. Don&apos;t expect big moves</p></div></div>
            <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Hold can be a polite sell</p><p className="text-[14px] text-muted-foreground mt-0.5">Some analysts avoid sell ratings. A hold from a usually bullish analyst is a red flag</p></div></div>
          </div>
        </div>
      ),
    },
    sell: {
      title: "Analysts are waving red flags",
      body: (
        <div className="text-left rounded-2xl border border-border/60 overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Know what to avoid</p><p className="text-[14px] text-muted-foreground mt-0.5">Seeing sell ratings helps you steer clear. Not every cheap stock is a bargain</p></div></div>
            <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Contrarian research</p><p className="text-[14px] text-muted-foreground mt-0.5">If you disagree with the consensus, this is where you start building your thesis</p></div></div>
          </div>
          <div className="border-t border-border/60" />
          <div className="p-5 space-y-4">
            <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Target prices are below current price</p><p className="text-[14px] text-muted-foreground mt-0.5">Analysts expect these stocks to go down. That&apos;s a strong signal to be cautious</p></div></div>
            <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Catching a falling knife hurts</p><p className="text-[14px] text-muted-foreground mt-0.5">Just because a stock has dropped doesn&apos;t mean it&apos;s done dropping. Check the consensus bar</p></div></div>
          </div>
        </div>
      ),
    },
  };

  const columns = [
    { header: "Stock", align: "left" as const },
    { header: "Upside", align: "right" as const },
    { header: "Consensus", align: "center" as const, minWidth: 120 },
    { header: "Price ($)", align: "right" as const, minWidth: 80 },
    { header: "Target", align: "right" as const, minWidth: 80 },
    { header: "1Y", align: "right" as const, minWidth: 80 },
    { header: "Avg Vol", align: "right" as const, minWidth: 68 },
    { header: "1M Volume", align: "right" as const, minWidth: 80 },
    { header: "Monthly Avg Vol", align: "right" as const, minWidth: 110 },
    { header: "Mkt Cap", align: "right" as const, minWidth: 72 },
    { header: "Sector", align: "right" as const, minWidth: 64 },
    { header: "Watchlist", align: "center" as const, minWidth: 80 },
  ];

  const rows = stocks.map((stock) => [
    <div key="name" className="flex items-center gap-2.5">
      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-muted-foreground/25" />
      <p className="min-w-0 text-[14px] font-semibold leading-tight text-foreground line-clamp-2">{stock.name}</p>
    </div>,
    <span key="upside" className={cn("whitespace-nowrap tabular-nums text-[14px] font-semibold", stock.upside >= 0 ? "text-gain" : "text-loss")}>{stock.upside >= 0 ? "+" : ""}{stock.upside.toFixed(1)}%</span>,
    <div key="consensus" className="flex justify-center"><ConsensusBadge buy={stock.buy} hold={stock.hold} sell={stock.sell} /></div>,
    <span key="price" className="whitespace-nowrap tabular-nums text-[14px] text-foreground">{stock.price.toFixed(2)}</span>,
    <span key="target" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{stock.targetPrice.toFixed(2)}</span>,
    <span key="1y" className={cn("whitespace-nowrap tabular-nums text-[14px] font-semibold", oneYearChange(stock.symbol) >= 0 ? "text-emerald-500" : "text-red-500")}>{fmtPct1Y(stock.symbol)}</span>,
    <span key="vol" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{stock.avgVolume}</span>,
    <span key="mvol" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{fmtVol(oneMonthVol(stock.symbol))}</span>,
    <span key="mavol" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{fmtVol(monthlyAvgVol(stock.symbol))}</span>,
    <span key="mcap" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{stock.marketCap}</span>,
    <span key="sector" className="whitespace-nowrap text-[14px] text-muted-foreground">{stock.sector}</span>,
    <div key="watch" className="flex justify-center">
      <button onClick={() => toggleBookmark(stock.symbol)} className="transition-transform active:scale-90">
        <Bookmark size={20} strokeWidth={1.8} className={cn("transition-colors", bookmarks.has(stock.symbol) ? "fill-foreground text-foreground" : "text-muted-foreground/50")} />
      </button>
    </div>,
  ]);

  return (
    <ScrollableTableWidget
      title="Analyst Ratings"
      description="What Wall Street pros think. Useful as a second opinion, never the final word on anything."
      flipper={{
        label: capLabels[capSize],
        icon: <ArrowUpDown size={13} className="flex-shrink-0 text-muted-foreground" />,
        onFlip: cycleCapSize,
      }}
      tabs={ratingTabs}
      activeTab={ratingTab}
      onTabChange={(id) => setRatingTab(id as RatingTab)}
      tabDescription={ratingDescriptions[ratingTab]}
      pillLayoutId="rating-tab-pill"
      columns={columns}
      rows={rows}
      scrollableMinWidth={620}
      animationKey={`${ratingTab}-${capSize}`}
      onRowClick={(i) => router.push(`/stocks/${stocks[i].symbol}`)}
      footer={{ label: "View All", href: `/explore/analyst-ratings?tab=${ratingTab}` }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Level Up Widget moved to components/level-up-widget.tsx */


/*  Market Heatmap — data                                              */
/* ------------------------------------------------------------------ */

type HeatmapIndex = "sp500" | "nasdaq100";

const heatmapStocks: Record<HeatmapIndex, { symbol: string; weight: number; change: number }[]> = {
  sp500: [
    { symbol: "AAPL", weight: 7.1, change: 1.2 },
    { symbol: "MSFT", weight: 6.8, change: -0.4 },
    { symbol: "NVDA", weight: 6.2, change: 2.8 },
    { symbol: "AMZN", weight: 3.8, change: 0.9 },
    { symbol: "GOOGL", weight: 3.6, change: -1.1 },
    { symbol: "META", weight: 2.8, change: 1.5 },
    { symbol: "TSLA", weight: 2.1, change: -2.3 },
    { symbol: "BRK.B", weight: 1.9, change: 0.3 },
    { symbol: "AVGO", weight: 1.7, change: 1.8 },
    { symbol: "LLY", weight: 1.6, change: -0.7 },
    { symbol: "JPM", weight: 1.4, change: 0.5 },
    { symbol: "V", weight: 1.3, change: 0.2 },
    { symbol: "UNH", weight: 1.2, change: -0.9 },
    { symbol: "MA", weight: 1.1, change: 0.4 },
    { symbol: "XOM", weight: 1.0, change: -1.5 },
    { symbol: "HD", weight: 0.9, change: 0.6 },
    { symbol: "PG", weight: 0.9, change: 0.1 },
    { symbol: "COST", weight: 0.8, change: 0.8 },
    { symbol: "JNJ", weight: 0.8, change: -0.3 },
    { symbol: "ABBV", weight: 0.7, change: 1.1 },
    { symbol: "CRM", weight: 0.7, change: -1.8 },
    { symbol: "BAC", weight: 0.6, change: 0.7 },
    { symbol: "NFLX", weight: 0.6, change: 2.1 },
    { symbol: "AMD", weight: 0.6, change: 3.2 },
    { symbol: "KO", weight: 0.5, change: -0.2 },
  ],
  nasdaq100: [
    { symbol: "AAPL", weight: 11.2, change: 1.2 },
    { symbol: "MSFT", weight: 10.5, change: -0.4 },
    { symbol: "NVDA", weight: 9.8, change: 2.8 },
    { symbol: "AMZN", weight: 5.8, change: 0.9 },
    { symbol: "META", weight: 4.8, change: 1.5 },
    { symbol: "GOOGL", weight: 4.2, change: -1.1 },
    { symbol: "AVGO", weight: 3.5, change: 1.8 },
    { symbol: "TSLA", weight: 3.2, change: -2.3 },
    { symbol: "COST", weight: 2.4, change: 0.8 },
    { symbol: "NFLX", weight: 2.1, change: 2.1 },
    { symbol: "AMD", weight: 1.9, change: 3.2 },
    { symbol: "ADBE", weight: 1.7, change: -0.6 },
    { symbol: "CRM", weight: 1.5, change: -1.8 },
    { symbol: "QCOM", weight: 1.4, change: 1.3 },
    { symbol: "INTC", weight: 1.2, change: -2.7 },
    { symbol: "INTU", weight: 1.1, change: 0.4 },
    { symbol: "AMAT", weight: 1.0, change: 2.4 },
    { symbol: "PYPL", weight: 0.9, change: -0.8 },
    { symbol: "BKNG", weight: 0.8, change: 0.6 },
    { symbol: "MU", weight: 0.7, change: 1.9 },
    { symbol: "ISRG", weight: 0.7, change: 0.3 },
    { symbol: "LRCX", weight: 0.6, change: 2.0 },
    { symbol: "PANW", weight: 0.5, change: -1.2 },
    { symbol: "SNPS", weight: 0.5, change: 0.7 },
    { symbol: "KLAC", weight: 0.5, change: 1.6 },
  ],
};

const heatmapSectors: Record<HeatmapIndex, { symbol: string; weight: number; change: number }[]> = {
  sp500: [
    { symbol: "Tech", weight: 31.5, change: 1.4 },
    { symbol: "Health", weight: 12.2, change: -0.5 },
    { symbol: "Finance", weight: 11.8, change: 0.6 },
    { symbol: "Consumer Disc.", weight: 10.4, change: -0.8 },
    { symbol: "Comm. Svcs", weight: 8.9, change: 0.9 },
    { symbol: "Industrials", weight: 7.6, change: 0.3 },
    { symbol: "Consumer Stpl.", weight: 5.8, change: -0.2 },
    { symbol: "Energy", weight: 3.9, change: -1.3 },
    { symbol: "Utilities", weight: 2.8, change: 0.1 },
    { symbol: "Real Estate", weight: 2.6, change: -0.4 },
    { symbol: "Materials", weight: 2.5, change: 0.7 },
  ],
  nasdaq100: [
    { symbol: "Tech", weight: 49.2, change: 1.6 },
    { symbol: "Comm. Svcs", weight: 15.8, change: 0.7 },
    { symbol: "Consumer Disc.", weight: 14.6, change: -0.9 },
    { symbol: "Health", weight: 6.8, change: -0.3 },
    { symbol: "Consumer Stpl.", weight: 5.2, change: 0.4 },
    { symbol: "Industrials", weight: 4.1, change: 0.2 },
    { symbol: "Utilities", weight: 2.4, change: -0.1 },
    { symbol: "Energy", weight: 1.9, change: -1.1 },
  ],
};

type HeatmapView = "stocks" | "sectors";
const heatViewOrder: HeatmapView[] = ["stocks", "sectors"];
const heatViewLabels: Record<HeatmapView, string> = { stocks: "Stocks", sectors: "Sectors" };

/* ------------------------------------------------------------------ */
/*  Squarified treemap layout                                          */
/* ------------------------------------------------------------------ */

const TM_W = 400;
const TM_H = 500;

interface HeatRect {
  x: number; y: number; w: number; h: number;
  symbol: string; change: number;
}

function treemapLayout(
  items: { symbol: string; weight: number; change: number }[],
): HeatRect[] {
  if (!items.length) return [];

  const sorted = [...items].sort((a, b) => b.weight - a.weight);
  const totalWeight = sorted.reduce((s, i) => s + i.weight, 0);
  const totalArea = TM_W * TM_H;
  const areas = sorted.map((i) => (i.weight / totalWeight) * totalArea);
  const rects: HeatRect[] = [];

  function worst(cellAreas: number[], side: number): number {
    const total = cellAreas.reduce((s, a) => s + a, 0);
    const rowOther = total / side;
    let max = 0;
    for (const a of cellAreas) {
      const cellSide = a / rowOther;
      const r = Math.max(rowOther / cellSide, cellSide / rowOther);
      if (r > max) max = r;
    }
    return max;
  }

  function process(
    idxs: number[],
    bx: number, by: number, bw: number, bh: number,
  ) {
    if (!idxs.length) return;
    if (idxs.length === 1) {
      const i = idxs[0];
      rects.push({ x: bx, y: by, w: bw, h: bh, symbol: sorted[i].symbol, change: sorted[i].change });
      return;
    }

    const isWide = bw >= bh;
    const side = isWide ? bh : bw;

    let bestEnd = 0;
    let rowAreas: number[] = [];
    let bestWorst = Infinity;

    for (let i = 0; i < idxs.length; i++) {
      const test = [...rowAreas, areas[idxs[i]]];
      const w = worst(test, side);
      if (w <= bestWorst) {
        bestWorst = w;
        bestEnd = i;
        rowAreas = test;
      } else break;
    }

    const rowTotal = rowAreas.reduce((s, a) => s + a, 0);

    if (isWide) {
      const rw = rowTotal / bh;
      let py = by;
      for (let i = 0; i <= bestEnd; i++) {
        const ch = areas[idxs[i]] / rw;
        rects.push({ x: bx, y: py, w: rw, h: ch, symbol: sorted[idxs[i]].symbol, change: sorted[idxs[i]].change });
        py += ch;
      }
      process(idxs.slice(bestEnd + 1), bx + rw, by, bw - rw, bh);
    } else {
      const rh = rowTotal / bw;
      let px = bx;
      for (let i = 0; i <= bestEnd; i++) {
        const cw = areas[idxs[i]] / rh;
        rects.push({ x: px, y: by, w: cw, h: rh, symbol: sorted[idxs[i]].symbol, change: sorted[idxs[i]].change });
        px += cw;
      }
      process(idxs.slice(bestEnd + 1), bx, by + rh, bw, bh - rh);
    }
  }

  process(sorted.map((_, i) => i), 0, 0, TM_W, TM_H);
  return rects;
}

function heatColor(change: number, isDark: boolean): string {
  if (isDark) {
    if (change >= 3) return "#1a3a2a";
    if (change >= 2) return "#1e3d2d";
    if (change >= 1) return "#223f30";
    if (change >= 0.3) return "#2a4436";
    if (change > -0.3) return "#2a2a2e";
    if (change > -1) return "#3d2a2a";
    if (change > -2) return "#422828";
    if (change > -3) return "#482626";
    return "#4e2424";
  }
  if (change >= 3) return "#c1e6d0";
  if (change >= 2) return "#cfeadb";
  if (change >= 1) return "#d9f0e3";
  if (change >= 0.3) return "#e4f5ec";
  if (change > -0.3) return "#ececee";
  if (change > -1) return "#f5e0e0";
  if (change > -2) return "#f0d4d4";
  if (change > -3) return "#eac8c8";
  return "#e4bcbc";
}

/* ------------------------------------------------------------------ */
/*  Market Heatmap Widget                                              */
/* ------------------------------------------------------------------ */

const heatmapTabs: { id: HeatmapIndex; label: string }[] = [
  { id: "sp500", label: "S&P 500" },
  { id: "nasdaq100", label: "NASDAQ 100" },
];

const heatmapDescriptions: Record<HeatmapIndex, { title: string; body: React.ReactNode }> = {
  sp500: {
    title: "The 500 that move America",
    body: (
      <div className="text-left rounded-2xl border border-border/60 overflow-hidden">
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">See the whole market in one glance</p><p className="text-[14px] text-muted-foreground mt-0.5">Size = weight in the index. Colour = how it&apos;s doing today. Green is up, red is down</p></div></div>
          <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Spot sector trends instantly</p><p className="text-[14px] text-muted-foreground mt-0.5">Flip to Sectors view to see which parts of the economy are leading or lagging</p></div></div>
        </div>
        <div className="border-t border-border/60" />
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Big blocks aren&apos;t always best</p><p className="text-[14px] text-muted-foreground mt-0.5">Apple and Microsoft are huge here. Doesn&apos;t mean they&apos;re the best buy today</p></div></div>
          <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">One day doesn&apos;t make a trend</p><p className="text-[14px] text-muted-foreground mt-0.5">A red day for tech doesn&apos;t mean sell everything. Zoom out before you act</p></div></div>
        </div>
      </div>
    ),
  },
  nasdaq100: {
    title: "Tech-heavy and proud of it",
    body: (
      <div className="text-left rounded-2xl border border-border/60 overflow-hidden">
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">The growth engine of the market</p><p className="text-[14px] text-muted-foreground mt-0.5">NASDAQ 100 is dominated by tech and innovation. If you&apos;re bullish on growth, this is your lens</p></div></div>
          <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Compare with S&P 500</p><p className="text-[14px] text-muted-foreground mt-0.5">Switch between the two to see if tech is leading the market or dragging it down</p></div></div>
        </div>
        <div className="border-t border-border/60" />
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Concentrated risk</p><p className="text-[14px] text-muted-foreground mt-0.5">Top 5 stocks are over 40% of the index. When they sneeze, everything catches a cold</p></div></div>
          <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Missing whole sectors</p><p className="text-[14px] text-muted-foreground mt-0.5">No financials, no energy. This is not a full picture of the economy</p></div></div>
        </div>
      </div>
    ),
  },
};

function HeatmapWidget() {
  const [index, setIndex] = useState<HeatmapIndex>("sp500");
  const [view, setView] = useState<HeatmapView>("stocks");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const rawItems = view === "stocks" ? heatmapStocks[index] : heatmapSectors[index];

  // Remove items too small to tap, then re-layout so remaining ones fill the space.
  // The final (smallest) tile is relabeled "Others" to represent the tail of the index.
  const rects = useMemo(() => {
    const MIN_DIM = 50;
    let items = rawItems;
    let result: HeatRect[] = [];
    for (let pass = 0; pass < 3; pass++) {
      const allRects = treemapLayout(items);
      const tooSmall = new Set(allRects.filter((r) => Math.min(r.w, r.h) < MIN_DIM).map((r) => r.symbol));
      if (tooSmall.size === 0) {
        result = allRects;
        break;
      }
      items = items.filter((i) => !tooSmall.has(i.symbol));
    }
    if (result.length === 0) result = treemapLayout(items);
    if (result.length > 0) {
      const last = result[result.length - 1];
      result[result.length - 1] = { ...last, symbol: "Others" };
    }
    return result;
  }, [rawItems]);

  const cycleView = () =>
    setView((p) => heatViewOrder[(heatViewOrder.indexOf(p) + 1) % heatViewOrder.length]);

  return (
    <WidgetHeader
      title="Market at a Glance"
      description="The whole US market in one frame. Bigger squares are bigger companies. Color shows today's move."
      flipper={{
        label: heatViewLabels[view],
        icon: <ArrowUpDown size={13} className="flex-shrink-0 text-muted-foreground" />,
        onFlip: cycleView,
      }}
      tabs={heatmapTabs}
      activeTab={index}
      onTabChange={(id) => setIndex(id as HeatmapIndex)}
      tabDescription={heatmapDescriptions[index]}
      pillLayoutId="heatmap-tab-pill"
    >
      {/* Treemap */}
      <div
        className="relative w-full overflow-hidden rounded-2xl"
        style={{ aspectRatio: `${TM_W} / ${TM_H}` }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${index}-${view}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0"
          >
            {rects.map((r) => {
              const showLabel = r.w > 28 && r.h > 24;
              const showChange = r.w > 42 && r.h > 32;
              const isLarge = r.w > 65 && r.h > 50;
              return (
                <div
                  key={r.symbol}
                  className="absolute p-[1px]"
                  style={{
                    left: `${(r.x / TM_W) * 100}%`,
                    top: `${(r.y / TM_H) * 100}%`,
                    width: `${(r.w / TM_W) * 100}%`,
                    height: `${(r.h / TM_H) * 100}%`,
                  }}
                >
                  <div
                    className="flex h-full w-full flex-col items-center justify-center"
                    style={{ backgroundColor: heatColor(r.change, isDark) }}
                  >
                    {showLabel && (
                      <span
                        className={cn("font-bold leading-none text-center px-1", isDark ? "text-gray-900" : "text-black/80")}
                        style={{ fontSize: isLarge ? 13 : 10 }}
                      >
                        {r.symbol}
                      </span>
                    )}
                    {showChange && r.symbol !== "Others" && (
                      <span
                        className={cn("mt-0.5 leading-none", isDark ? "text-gray-700" : "text-black/50")}
                        style={{ fontSize: isLarge ? 11 : 9 }}
                      >
                        {r.change > 0 ? "+" : ""}{r.change.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <Link
        href="/heatmap"
        className="mt-3 flex w-full items-center justify-center gap-2 py-3 text-[14px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <Maximize2 size={15} />
        View All
      </Link>
    </WidgetHeader>
  );
}

/* ------------------------------------------------------------------ */
/*  Promo Banner Widget (tap to cycle: strip → big → hero)             */
/* ------------------------------------------------------------------ */

type BannerMode = "strip" | "strip-full" | "big" | "big-full" | "hero" | "hero-full";
const bannerOrder: BannerMode[] = ["strip", "strip-full", "big", "big-full", "hero", "hero-full"];

const bannerLabels: Record<BannerMode, string> = {
  strip: "Thin Banner",
  "strip-full": "Thin Banner · End to End",
  big: "Big Banner",
  "big-full": "Big Banner · End to End",
  hero: "Hero Banner",
  "hero-full": "Hero Banner · End to End",
};

function PromoBanner() {
  const [mode, setMode] = useState<BannerMode>("big");

  const cycle = () =>
    setMode((p) => bannerOrder[(bannerOrder.indexOf(p) + 1) % bannerOrder.length]);

  const label = bannerLabels[mode];
  const isFull = mode.endsWith("-full");

  const heights: Record<string, string> = {
    strip: "py-3.5",
    "strip-full": "py-3.5",
    big: "py-16",
    "big-full": "py-16",
    hero: "py-40",
    "hero-full": "py-40",
  };

  return (
    <button
      onClick={cycle}
      className={cn(
        "flex w-full items-center justify-center bg-muted transition-all active:scale-[0.99]",
        heights[mode],
        isFull ? "-mx-5 w-[calc(100%+2.5rem)]" : "rounded-2xl"
      )}
    >
      <p className="text-[14px] font-semibold text-muted-foreground">{label}</p>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Popular Stocks Widget                                              */
/* ------------------------------------------------------------------ */

type PopularTab = "most-invested" | "popular-sip";
const popularTabs: { id: PopularTab; label: string }[] = [
  { id: "most-invested", label: "Most Invested" },
  { id: "popular-sip", label: "Popular for SIP" },
];

interface PopularStock {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  marketCap: string;
  pe: number | null;
  high52w: number;
  low52w: number;
  revGrowth: number;
  profitGrowth: number;
}

const popularStocksData: Record<PopularTab, PopularStock[]> = {
  "most-invested": [
    { symbol: "AAPL", name: "Apple", price: 198.36, changePercent: 2.33, marketCap: "3.0T", pe: 31, high52w: 199.6, low52w: 164.1, revGrowth: 2.1, profitGrowth: 10.7 },
    { symbol: "TSLA", name: "Tesla", price: 178.24, changePercent: -6.48, marketCap: "568B", pe: 48, high52w: 278.0, low52w: 138.8, revGrowth: -5.5, profitGrowth: -45.2 },
    { symbol: "AMZN", name: "Amazon", price: 186.42, changePercent: 3.17, marketCap: "1.9T", pe: 59, high52w: 191.7, low52w: 118.4, revGrowth: 12.5, profitGrowth: 229.1 },
    { symbol: "MSFT", name: "Microsoft", price: 428.15, changePercent: 2.71, marketCap: "3.2T", pe: 37, high52w: 433.0, low52w: 309.5, revGrowth: 17.6, profitGrowth: 33.2 },
    { symbol: "NVDA", name: "NVIDIA", price: 892.45, changePercent: 3.97, marketCap: "2.2T", pe: 68, high52w: 974.0, low52w: 392.3, revGrowth: 122.4, profitGrowth: 581.3 },
  ],
  "popular-sip": [
    { symbol: "AAPL", name: "Apple", price: 198.36, changePercent: 2.33, marketCap: "3.0T", pe: 31, high52w: 199.6, low52w: 164.1, revGrowth: 2.1, profitGrowth: 10.7 },
    { symbol: "MSFT", name: "Microsoft", price: 428.15, changePercent: 2.71, marketCap: "3.2T", pe: 37, high52w: 433.0, low52w: 309.5, revGrowth: 17.6, profitGrowth: 33.2 },
    { symbol: "GOOGL", name: "Alphabet", price: 152.67, changePercent: -3.68, marketCap: "1.9T", pe: 27, high52w: 193.0, low52w: 121.5, revGrowth: 13.8, profitGrowth: 28.6 },
    { symbol: "AMZN", name: "Amazon", price: 186.42, changePercent: 3.17, marketCap: "1.9T", pe: 59, high52w: 191.7, low52w: 118.4, revGrowth: 12.5, profitGrowth: 229.1 },
    { symbol: "NVDA", name: "NVIDIA", price: 892.45, changePercent: 3.97, marketCap: "2.2T", pe: 68, high52w: 974.0, low52w: 392.3, revGrowth: 122.4, profitGrowth: 581.3 },
  ],
};

const popularDescriptions: Record<PopularTab, { title: string; body: React.ReactNode }> = {
  "most-invested": {
    title: "What everyone's buying",
    body: (
      <div className="text-left rounded-2xl border border-border/60 overflow-hidden">
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">See where the crowd is putting money</p><p className="text-[14px] text-muted-foreground mt-0.5">These are the stocks held by the most investors on Aspora. Popularity often signals trust</p></div></div>
          <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Good starting point for research</p><p className="text-[14px] text-muted-foreground mt-0.5">If millions of people own it, it&apos;s probably worth understanding why</p></div></div>
        </div>
        <div className="border-t border-border/60" />
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Popular doesn&apos;t mean best</p><p className="text-[14px] text-muted-foreground mt-0.5">The most-owned stocks aren&apos;t always the best performers. Do your own homework</p></div></div>
          <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Crowded trades can reverse fast</p><p className="text-[14px] text-muted-foreground mt-0.5">When everyone owns something, a sell-off can be sharp. Keep an eye on the fundamentals</p></div></div>
        </div>
      </div>
    ),
  },
  "popular-sip": {
    title: "Set it and forget it",
    body: (
      <div className="text-left rounded-2xl border border-border/60 overflow-hidden">
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Built for long-term investors</p><p className="text-[14px] text-muted-foreground mt-0.5">These are the stocks and ETFs people invest in regularly, month after month</p></div></div>
          <div className="flex gap-3"><Check size={18} strokeWidth={2.5} className="shrink-0 text-gain mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Dollar-cost averaging works best here</p><p className="text-[14px] text-muted-foreground mt-0.5">SIP smooths out volatility. These picks tend to be stable, proven names</p></div></div>
        </div>
        <div className="border-t border-border/60" />
        <div className="p-5 space-y-4">
          <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Not a shortcut to quick gains</p><p className="text-[14px] text-muted-foreground mt-0.5">SIP is a patience game. If you&apos;re looking for short-term wins, this isn&apos;t the list</p></div></div>
          <div className="flex gap-3"><X size={18} strokeWidth={2.5} className="shrink-0 text-loss mt-0.5" /><div><p className="text-[15px] font-semibold text-foreground">Review periodically</p><p className="text-[14px] text-muted-foreground mt-0.5">Set and forget doesn&apos;t mean never check. Revisit your SIPs every quarter</p></div></div>
        </div>
      </div>
    ),
  },
};

function PopularStocksWidget() {
  const router = useRouter();
  const [tab, setTab] = useState<PopularTab>("most-invested");
  const [capSize, setCapSize] = useState<CapSize>("mega");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const cycleCapSize = () =>
    setCapSize((p) => capOrder[(capOrder.indexOf(p) + 1) % capOrder.length]);

  const stocks = popularStocksData[tab];

  const toggleBookmark = (sym: string) =>
    setBookmarks((p) => {
      const n = new Set(p);
      if (n.has(sym)) n.delete(sym); else n.add(sym);
      return n;
    });

  const showConsensus = capSize === "mega";

  const columns = [
    { header: "Stock", align: "left" as const },
    { header: "Price", align: "right" as const },
    { header: "1Y", align: "right" as const, minWidth: 80 },
    ...(showConsensus ? [{ header: "Consensus", align: "center" as const, minWidth: 120 }] : []),
    { header: "PE", align: "right" as const, minWidth: 48 },
    { header: "M.Cap", align: "right" as const, minWidth: 68 },
    { header: "Rev Gr.", align: "right" as const, minWidth: 74 },
    { header: "Profit Gr.", align: "right" as const, minWidth: 80 },
    { header: "1M Volume", align: "right" as const, minWidth: 80 },
    { header: "Monthly Avg Vol", align: "right" as const, minWidth: 110 },
    { header: "1Y Range", align: "center" as const, minWidth: 136 },
    { header: "Watchlist", align: "center" as const, minWidth: 80 },
  ];

  const rows = stocks.map((stock) => {
    const chgColor = stock.changePercent >= 0 ? "text-emerald-500" : "text-red-500";
    const oneY = oneYearChange(stock.symbol);
    return [
      <div key="name" className="flex items-center gap-2.5">
        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-muted-foreground/25" />
        <p className="min-w-0 text-[14px] font-semibold leading-tight text-foreground line-clamp-2">{stock.name}</p>
      </div>,
      <div key="price" className="flex flex-col items-end">
        <span className="whitespace-nowrap tabular-nums text-[14px] text-foreground">{stock.price.toFixed(1)}</span>
        <span className={cn("whitespace-nowrap tabular-nums text-[12px] font-semibold", chgColor)}>{stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(1)}%</span>
      </div>,
      <span key="1y" className={cn("whitespace-nowrap tabular-nums text-[14px] font-semibold", oneY >= 0 ? "text-emerald-500" : "text-red-500")}>{fmtPct1Y(stock.symbol)}</span>,
      ...(showConsensus ? [
        <div key="consensus" className="flex justify-center">
          <ConsensusBadge {...(MEGA_CONSENSUS[stock.symbol] ?? { buy: 10, hold: 10, sell: 5 })} />
        </div>,
      ] : []),
      <span key="pe" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{stock.pe != null ? Math.round(stock.pe) : "—"}</span>,
      <span key="mcap" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{stock.marketCap.replace("$", "")}</span>,
      <span key="rev" className={cn("whitespace-nowrap tabular-nums text-[14px] font-medium", stock.revGrowth >= 0 ? "text-emerald-500" : "text-red-500")}>{stock.revGrowth >= 0 ? "+" : ""}{Math.round(stock.revGrowth)}%</span>,
      <span key="profit" className={cn("whitespace-nowrap tabular-nums text-[14px] font-medium", stock.profitGrowth >= 0 ? "text-emerald-500" : "text-red-500")}>{stock.profitGrowth >= 0 ? "+" : ""}{Math.round(stock.profitGrowth)}%</span>,
      <span key="mvol" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{fmtVol(oneMonthVol(stock.symbol))}</span>,
      <span key="mavol" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{fmtVol(monthlyAvgVol(stock.symbol))}</span>,
      <RangeBar key="range" low={stock.low52w} high={stock.high52w} current={stock.price} />,
      <div key="watch" className="flex justify-center">
        <button onClick={() => toggleBookmark(stock.symbol)} className="transition-transform active:scale-90">
          <Bookmark size={20} strokeWidth={1.8} className={cn("transition-colors", bookmarks.has(stock.symbol) ? "fill-foreground text-foreground" : "text-muted-foreground/50")} />
        </button>
      </div>,
    ];
  });

  return (
    <ScrollableTableWidget
      title="Popular Stocks"
      description="What other Aspora members are buying right now. A pulse check on the crowd, not a green light to follow."
      flipper={{
        label: capLabels[capSize],
        icon: <ArrowUpDown size={13} className="flex-shrink-0 text-muted-foreground" />,
        onFlip: cycleCapSize,
      }}
      tabs={popularTabs}
      activeTab={tab}
      onTabChange={(id) => setTab(id as PopularTab)}
      tabDescription={popularDescriptions[tab]}
      pillLayoutId="popular-tab-pill"
      columns={columns}
      rows={rows}
      scrollableMinWidth={500}
      animationKey={`${tab}-${capSize}`}
      onRowClick={(i) => router.push(`/stocks/${stocks[i].symbol}`)}
      footer={{ label: "View All", href: `/explore/popular-stocks?tab=${tab}` }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Quick Access Widget                                                */
/* ------------------------------------------------------------------ */

const quickAccessItems: { label: string; icon: LucideIcon; href?: string }[] = [
  { label: "My Watchlist", icon: Bookmark, href: "/watchlist" },
  { label: "Compare Stocks", icon: GitCompareArrows },
  { label: "Level Up", icon: GraduationCap, href: "/learn" },
  { label: "News", icon: Newspaper },
  { label: "Market Summary", icon: BarChart3 },
  { label: "Portfolio Analysis", icon: Brain },
  { label: "Earnings Calendar", icon: CalendarDays },
  { label: "Dividend Calendar", icon: CalendarCheck },
];

const qaRow1 = ["My Watchlist", "Compare Stocks", "Level Up", "Earnings Calendar"];
const qaRow2 = ["News", "Market Summary", "Portfolio Analysis", "Dividend Calendar"];

function QuickAccessPill({ item }: { item: (typeof quickAccessItems)[number] }) {
  const Icon = item.icon;
  const cls = "flex shrink-0 items-center gap-2.5 rounded-full border border-border/60 px-4 py-2.5 active:scale-[0.97] transition-transform";
  const inner = (
    <>
      <Icon size={18} strokeWidth={1.8} className="text-foreground" />
      <span className="text-[14px] font-semibold text-foreground whitespace-nowrap">{item.label}</span>
    </>
  );
  return item.href ? (
    <Link href={item.href} className={cls}>{inner}</Link>
  ) : (
    <button className={cls}>{inner}</button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function QuickAccessWidget() {
  return (
    <div>
      <h2 className="text-[18px] font-bold tracking-tight mb-3.5">Quick Access</h2>
      <div className="-mx-5 overflow-x-auto no-scrollbar">
        <div className="flex flex-col gap-2.5 px-5" style={{ width: "max-content" }}>
          <div className="flex gap-2.5">
            {qaRow1.map((label) => {
              const item = quickAccessItems.find((i) => i.label === label)!;
              return <QuickAccessPill key={label} item={item} />;
            })}
          </div>
          <div className="flex gap-2.5">
            {qaRow2.map((label) => {
              const item = quickAccessItems.find((i) => i.label === label)!;
              return <QuickAccessPill key={label} item={item} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function QuickAccessV6() {
  return (
    <div>
      <h2 className="text-[18px] font-bold tracking-tight mb-3.5">Quick Access v6</h2>
      <div className="grid grid-cols-4 gap-3">
        {quickAccessItems.map((item) => (
          <button key={item.label} className="flex flex-col items-center gap-2 active:scale-[0.95] transition-transform">
            <div className="h-12 w-12 rounded-full bg-muted" />
            <span className="text-[14px] font-medium text-foreground text-center leading-tight">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function QuickAccessTogglable() {
  const [variant, setVariant] = useState<"v6" | "pills">("v6");

  return (
    <div className="pb-2">
      <button onClick={() => setVariant((v) => v === "v6" ? "pills" : "v6")}>
        <h2 className="text-[18px] font-bold tracking-tight mb-3.5">Quick Access</h2>
      </button>
      {variant === "v6" ? (
        <div className="grid grid-cols-4 gap-x-3 gap-y-5">
          {quickAccessItems.map((item) => {
            const inner = (
              <>
                <div className="h-12 w-12 rounded-full bg-muted" />
                <span className="text-[14px] font-medium text-foreground text-center leading-tight">{item.label}</span>
              </>
            );
            return item.href ? (
              <Link key={item.label} href={item.href} className="flex flex-col items-center gap-3 active:scale-[0.95] transition-transform">
                {inner}
              </Link>
            ) : (
              <button key={item.label} className="flex flex-col items-center gap-3 active:scale-[0.95] transition-transform">
                {inner}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="-mx-5 overflow-x-auto no-scrollbar">
          <div className="flex flex-col gap-2.5 px-5" style={{ width: "max-content" }}>
            <div className="flex gap-2.5">
              {qaRow1.map((label) => {
                const item = quickAccessItems.find((i) => i.label === label)!;
                return <QuickAccessPill key={label} item={item} />;
              })}
            </div>
            <div className="flex gap-2.5">
              {qaRow2.map((label) => {
                const item = quickAccessItems.find((i) => i.label === label)!;
                return <QuickAccessPill key={label} item={item} />;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Explore Footer — Trust, Access & Co-Creation                       */
/* ------------------------------------------------------------------ */

export function ExploreFooter() {
  return (
    <div className="relative -mx-5 mt-4">
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.03] to-transparent rounded-t-[32px]" />

      <div className="relative px-6 pt-12 pb-10">
        {/* Hero */}
        <h2 className="text-[28px] font-bold text-foreground leading-[1.15] tracking-tight text-center">
          We answer to you
        </h2>
        <p className="text-[15px] text-muted-foreground mt-3 leading-relaxed text-center">
          Built around how you invest.<br />Tell us how to make it better.
        </p>

        {/* Co-create actions */}
        <div className="mt-8 space-y-3">
          {[
            { title: "Vote on what we build", sub: "1,247 votes this week", accent: true },
            { title: "Share your feedback", sub: "What works, what doesn\u2019t" },
            { title: "Join a research session", sub: "Help us understand you better" },
          ].map((item) => (
            <button
              key={item.title}
              className="flex w-full items-center justify-between rounded-2xl bg-background border border-border/50 px-5 py-4 text-left active:scale-[0.98] transition-transform"
            >
              <div>
                <p className={cn("text-[16px] font-semibold", item.accent ? "text-foreground" : "text-foreground/80")}>{item.title}</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">{item.sub}</p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground/30" />
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-border/40" />
          <span className="text-[11px] font-medium text-muted-foreground/30 uppercase tracking-[0.2em]">Need a human?</span>
          <div className="flex-1 h-px bg-border/40" />
        </div>

        {/* Contact */}
        <div className="flex items-center justify-around">
          {[
            { icon: MessageCircle, label: "Chat", tat: "Instant" },
            { icon: Phone, label: "Schedule a Call", tat: "Pick a time" },
            { icon: Mail, label: "Write to CEO", tat: "Usually 48h" },
          ].map((item) => (
            <button key={item.label} className="flex flex-col items-center gap-2 active:scale-95 transition-transform flex-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <item.icon size={20} strokeWidth={1.8} className="text-foreground" />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-medium text-foreground leading-tight">{item.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.tat}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Trust */}
        <div className="mt-10 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-gain" />
            <span className="text-[12px] text-muted-foreground/40">All systems operational</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground/40">
            <span>SIPC insured</span>
            <span>·</span>
            <span>Segregated accounts</span>
            <span>·</span>
            <span>Alpaca Securities</span>
            <span>·</span>
            <span>256-bit encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Onboarding Widget (V3 — The Contrast)                              */
/* ------------------------------------------------------------------ */

const KYC_STEPS = ["Email", "Phone", "Identity", "Funding", "Review"];
const KYC_CURRENT = 2;

const HERO_STATES = ["start", "kyc", "video", "fund", "learn"] as const;
type HeroState = (typeof HERO_STATES)[number];

function HeroWidget() {
  const [heroState, setHeroState] = useState<HeroState>("start");

  const cycle = () =>
    setHeroState((s) => HERO_STATES[(HERO_STATES.indexOf(s) + 1) % HERO_STATES.length]);

  const noiseStyle = { backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E')" };

  return (
    <div onClick={cycle} className="cursor-pointer">
      <AnimatePresence mode="wait">
        {heroState === "start" && (
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-3xl bg-foreground hero-invert px-6 pb-6 pt-48"
          >
            <div className="absolute inset-0 opacity-[0.03]" style={noiseStyle} />
            <div className="relative flex flex-col items-center text-center">
              <p className="text-[20px] font-bold text-background leading-[1.3] mb-1">
                No rush. Explore all you want.
              </p>
              <p className="text-[15px] text-background/50 leading-relaxed mb-6">
                When you&apos;re ready to invest, we&apos;re here.
              </p>
              <button className="rounded-full bg-background px-6 py-3 text-[15px] font-semibold text-foreground active:opacity-90 transition-opacity">
                Start Investing
              </button>
            </div>
          </motion.div>
        )}

        {heroState === "kyc" && (
          <motion.div
            key="kyc"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-3xl bg-foreground hero-invert px-6 pt-12 pb-8"
          >
            <div className="absolute inset-0 opacity-[0.03]" style={noiseStyle} />
            <div className="relative flex flex-col items-center text-center">
              <div className="mb-8 mt-4">
                <svg width={80} height={80} viewBox="0 0 80 80">
                  <circle cx={40} cy={40} r={34} fill="none" stroke="hsl(var(--background) / 0.15)" strokeWidth={5} />
                  <circle
                    cx={40} cy={40} r={34}
                    fill="none" stroke="hsl(var(--background))" strokeWidth={5} strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 34}
                    strokeDashoffset={2 * Math.PI * 34 * (1 - (KYC_CURRENT + 1) / KYC_STEPS.length)}
                    transform="rotate(-90 40 40)"
                  />
                </svg>
              </div>
              <p className="text-[20px] font-bold text-background leading-tight mb-1">
                Your account is almost ready
              </p>
              <p className="text-[15px] text-background/50 leading-relaxed mb-5">
                We saved your progress.<br />Pick up where you left off.
              </p>
              <button className="rounded-full bg-background px-6 py-3 text-[15px] font-semibold text-foreground active:opacity-90 transition-opacity">
                Continue Setup
              </button>
            </div>
          </motion.div>
        )}

        {heroState === "video" && (
          <motion.div
            key="video"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4 }}
          >
            <Video1BSpotlight />
          </motion.div>
        )}

        {heroState === "fund" && (
          <motion.div
            key="fund"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4 }}
          >
            <Funds2DWarmHandoff />
          </motion.div>
        )}

        {heroState === "learn" && (
          <motion.div
            key="learn"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4 }}
          >
            <Learn3DFriendVoice />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ExploreFundedNotTraded() {
  const [msIdx, setMsIdx] = useState(0);
  const [userTz, setUserTz] = useState("America/New_York");

  useEffect(() => {
    setUserTz(getBrowserTz());
  }, []);

  const cycleStatus = () =>
    setMsIdx((i) => (i + 1) % marketStates.length);

  return (
    <div className="space-y-14 px-5 pt-5 pb-4">
      <HeroWidget />
      <CompactInlineStrip
        state={marketStates[msIdx]}
        userTz={userTz}
        onToggle={cycleStatus}
      />
      <PopularStocksWidget />
      <PromoBanner />
      <QuickAccessV5B />
      <TopMoversCardless />
      <RecurringBasketsWidget />
      <AnalystRatingsWidget />
      <HeatmapWidget />
    </div>
  );
}
