"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const tabs = ["Pages", "Components", "Archive"] as const;
type Tab = (typeof tabs)[number];

const pages = [
  {
    title: "Home v3",
    description: "Home screen iteration",
    href: "/home-v3",
    status: "wip",
  },
  {
    title: "Stocks",
    description: "Stock detail view with charts and trading",
    href: "/stocks",
    status: "v1",
  },
  {
    title: "Order Flow",
    description: "Buy/sell order placement with swipe to confirm",
    href: "/order-flow/v16",
    status: "v16",
  },
];

const archive = [
  {
    title: "Explore",
    description: "Stocks, ETF, Options, Baskets, Algo — 3 user states",
    href: "/explore",
    status: "3 versions",
  },
  {
    title: "Home",
    description: "Watchlist, header, and bottom navigation",
    href: "/home",
    status: "v1",
  },
  {
    title: "Alerts",
    description: "Set price and percentage alerts for stocks",
    href: "/stocks/AAPL/alerts",
    status: "v1",
  },
  {
    title: "Order Flow",
    description: "Stock order placement — buy/sell with swipe",
    href: "/order-flow",
    status: "3 versions",
  },
  {
    title: "Home v2",
    description: "Redesigned home screen",
    href: "/home-v2",
    status: "v2",
  },
];

const components = [
  // — 2026-04-19 —
  {
    title: "Stock Header",
    description: "Stock info header — 5 layouts · 3 market states",
    href: "/stock-header-variants",
    status: "5 variations",
  },
  // — 2026-04-14 —
  {
    title: "ETF Top Movers v2",
    description: "Frozen-6 + scroll-5 — 10 layout directions",
    href: "/etf-top-movers-v2",
    status: "10 variations",
  },
  {
    title: "Market Status Widget",
    description: "Pulse bar, day arc, dial, typographic, atmospheric",
    href: "/market-status-widget",
    status: "5 directions",
  },
  {
    title: "Hero Widget v2",
    description: "3 states · 12 visual variations",
    href: "/hero-widget-v2",
    status: "12 variations",
  },
  {
    title: "Level Up Widget",
    description: "ETF learning modules — 5 entry-point designs",
    href: "/level-up-v2",
    status: "5 variations",
  },
  {
    title: "Quick Access v3",
    description: "3 tools + living AI row — text-flipping variations",
    href: "/quick-access-v3",
    status: "5 variations",
  },
  {
    title: "Quick Access v2",
    description: "3 shortcuts + horizontal AI Summary — bold visual variations",
    href: "/quick-access-v2",
    status: "5 variations",
  },
  // — 2026-04-13 —
  {
    title: "ETF Card Variants",
    description: "Popular ETFs — 5 layout explorations",
    href: "/etf-cards",
    status: "5 variations",
  },
  {
    title: "Search Result Row",
    description: "List design for stocks, index, ETF, options",
    href: "/explore-search-results",
    status: "5 variations",
  },
  {
    title: "Add Funds Hero",
    description: "KYC complete — USD + stablecoin funding nudge",
    href: "/explore-add-funds",
    status: "4 versions",
  },
  {
    title: "ETF Cards",
    description: "Popular ETFs — 2-col layout explorations",
    href: "/explore-etf-cards",
    status: "5 variations",
  },
  {
    title: "Search Widgets",
    description: "Recent, Popular, Collections, Options Under 10",
    href: "/explore-search-widgets",
    status: "12 variations",
  },
  {
    title: "Onboarding Widget",
    description: "Fresh user + KYC drop-off — 3 versions",
    href: "/explore-onboarding",
    status: "3 versions",
  },
  {
    title: "Explore Footer",
    description: "Co-create, talk, trust — 5 creative concepts",
    href: "/explore-footer",
    status: "5 concepts",
  },
  // — 2026-04-12 —
  {
    title: "AI Summary",
    description: "Watchlist AI summary — layout explorations",
    href: "/explore-ai-summary",
    status: "10 variations",
  },
  {
    title: "Trust & Co-Creation",
    description: "Trust, support, and co-creation sections",
    href: "/explore-trust",
    status: "2 approaches",
  },
  {
    title: "Collection Cards",
    description: "Vertical, horizontal, list, grid, filled",
    href: "/explore-collection-cards",
    status: "7 variations",
  },
  {
    title: "Quick Access",
    description: "Shortcut grid — layout explorations",
    href: "/explore-quick-access",
    status: "10 variations",
  },
  {
    title: "Scrollable Table Widget",
    description: "Frozen first col, scrollable data, pills, flipper",
    href: "/explore-scrollable-table",
    status: "component",
  },
  // — 2026-03-04 —
  {
    title: "Bottom Nav",
    description: "Tab bar — icon, label, active indicator",
    href: "/explore-bottom-nav",
    status: "2 variations",
  },
  // — 2026-03-03 —
  {
    title: "Ticker",
    description: "Market tickers — marquee, pills, cards, dense, glow",
    href: "/explore-tickers",
    status: "5 variations",
  },
  {
    title: "Header Design",
    description: "Search bar, navigation, and customisation controls",
    href: "/explore-headers",
    status: "5 variations",
  },
];

const items: Record<Tab, typeof pages> = {
  Pages: pages,
  Components: components,
  Archive: archive,
};

function DirectoryCard({
  item,
  index,
}: {
  item: (typeof pages)[number];
  index: number;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        href={item.href}
        className="group flex items-center justify-between rounded-xl border border-border/60 bg-card px-5 py-3.5 transition-colors hover:border-border hover:bg-card/80 active:scale-[0.98]"
      >
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-foreground">
            {item.title}
          </p>
          <p className="mt-0.5 text-[12px] text-muted-foreground leading-snug">
            {item.description}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-3 shrink-0">
          <span className="text-[11px] font-medium text-muted-foreground/70">
            {item.status}
          </span>
          <ChevronRight
            size={16}
            className="text-muted-foreground/50 transition-transform group-hover:translate-x-0.5"
          />
        </div>
      </Link>
    </motion.div>
  );
}

const tabSlugMap: Record<string, Tab> = {
  pages: "Pages",
  components: "Components",
  archive: "Archive",
};

const slugForTab = (tab: Tab) => tab.toLowerCase();

function DirectoryContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") ?? "pages";
  const activeTab: Tab = tabSlugMap[tabParam] ?? "Pages";

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
      {/* Title area */}
      <div className="px-5 pt-14 pb-4">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-[22px] font-bold tracking-tight text-foreground"
        >
          US Equity
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="mt-1 text-[13px] text-muted-foreground"
        >
          Component directory — design explorations
        </motion.p>
      </div>

      {/* Tabs */}
      <div className="px-5 pb-4">
        <div className="flex gap-1.5">
          {tabs.map((tab) => (
            <Link
              key={tab}
              href={`/?tab=${slugForTab(tab)}`}
              scroll={false}
              className={cn(
                "relative rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                activeTab === tab
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/70"
              )}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="directory-tab"
                  className="absolute inset-0 rounded-lg bg-secondary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-border/60" />

      {/* Links */}
      <div className="flex-1 px-5 pt-4 space-y-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            {items[activeTab].map((item, i) => (
              <DirectoryCard key={item.href} item={item} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-5 py-6">
        <p className="text-[11px] text-muted-foreground/40 text-center">
          Prototype — design iterations
        </p>
      </div>
    </div>
  );
}

export default function Directory() {
  return (
    <Suspense>
      <DirectoryContent />
    </Suspense>
  );
}
