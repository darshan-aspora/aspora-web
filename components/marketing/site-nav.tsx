"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, X, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const SUPABASE = "https://qkejcqlvssytkmrzfeut.supabase.co/storage/v1/object/public/brand-assets";
const FLAGS = `${SUPABASE}/flag-icons`;

type Tag = { label: string; flag: string };
type SubItem = { label: string; description: string; href: string; tags?: Tag[] };
type NavItem = { label: string; href?: string; items?: SubItem[] };

const wealthItems: SubItem[] = [
  { label: "Explore", description: "Discover US stocks, ETFs and thematic collections", href: "/explore" },
  { label: "Market", description: "Live market data, movers and global indices", href: "/market" },
  { label: "Portfolio", description: "Track your holdings, P&L and performance", href: "/portfolio" },
  { label: "Advisory", description: "Expert-curated baskets and smart strategies", href: "/advisory" },
];

const productItems: SubItem[] = [
  {
    label: "Send money",
    description: "Transfer money home at live rates with zero markup",
    href: "#send",
    tags: [
      { label: "India", flag: `${FLAGS}/flags-india.svg` },
      { label: "Philippines", flag: `${FLAGS}/flags-philippines.svg` },
      { label: "Nigeria", flag: `${FLAGS}/flags-nigeria.svg` },
    ],
  },
  {
    label: "Pay bills",
    description: "Pay electricity, gas, mobile and every bill back home",
    href: "#bills",
    tags: [{ label: "India", flag: `${FLAGS}/flags-india.svg` }],
  },
  {
    label: "NRI banking",
    description: "The first fully digital NRE/NRO account. No paperwork, no branch visits",
    href: "#nri",
    tags: [{ label: "India", flag: `${FLAGS}/flags-india.svg` }],
  },
  {
    label: "Invest in Gold",
    description: "Buy, hold and lease 24k gold from your phone",
    href: "#gold",
  },
];

const resourceItems: SubItem[] = [
  { label: "Blog", description: "Insights, updates, and stories from Aspora", href: "/dev" },
  { label: "Currency rates", description: "Live exchange rates for all supported corridors", href: "/dev" },
  { label: "Smart financial tools", description: "Easy-to-use calculators for SIP, EMI, FD, PPF, GST, and more", href: "/dev" },
];

const companyItems: SubItem[] = [
  { label: "About us", description: "Our mission to serve the global diaspora", href: "/dev" },
  { label: "Careers", description: "Join us in building the future of cross-border finance", href: "/dev" },
  { label: "Help", description: "FAQs, guides, and customer support", href: "/dev" },
];

const navItems: NavItem[] = [
  { label: "Wealth", items: wealthItems },
  { label: "Products", items: productItems },
  { label: "Resources", items: resourceItems },
  { label: "Company", items: companyItems },
];

function MegaDropdownPanel({ items, onClose }: { items: SubItem[]; onClose: () => void }) {
  const cols = items.length;
  return (
    <div
      className="absolute left-0 right-0 top-full mt-0 z-50 px-5"
      style={{ pointerEvents: "auto" }}
    >
      {/* center within max-w-[1200px] container */}
      <div className="mx-auto max-w-[1200px]">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "#1c1c1e",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
          }}
        >
          <div className={cn("grid p-3 gap-0")} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className="flex flex-col rounded-xl p-4 transition-colors hover:bg-white/[0.05]"
                style={{ border: "1px solid rgba(255,255,255,0.08)", margin: "3px" }}
              >
                <p className="text-[14px] font-semibold text-white m-0">{item.label}</p>
                <p className="mt-1.5 text-[12px] leading-relaxed m-0" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {item.description}
                </p>
                {item.tags && item.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag.label}
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium rounded-full px-2 py-0.5"
                        style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}
                      >
                        <img src={tag.flag} alt={tag.label} className="w-3.5 h-3.5 rounded-full object-cover" />
                        {tag.label}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div
      className={cn(
        "fixed inset-0 z-40 flex flex-col transition-transform duration-300",
        open ? "translate-x-0" : "translate-x-full"
      )}
      style={{ background: "#0f0f11" }}
    >
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <img src={`${SUPABASE}/brand/aspora-full-logo.svg`} alt="aspora" className="h-5 brightness-0 invert" />
        <button onClick={onClose}><X size={20} style={{ color: "rgba(255,255,255,0.5)" }} /></button>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {navItems.map((item) => (
          <div key={item.label}>
            {item.items ? (
              <>
                <button
                  onClick={() => setExpanded(expanded === item.label ? null : item.label)}
                  className="flex w-full items-center justify-between px-5 py-3.5 text-[15px] font-semibold text-white"
                >
                  {item.label}
                  <ChevronDown size={16}
                    className={cn("transition-transform duration-200", expanded === item.label ? "rotate-180" : "")}
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  />
                </button>
                {expanded === item.label && (
                  <div className="pb-2">
                    {item.items.map((sub) => (
                      <Link key={sub.label} href={sub.href} onClick={onClose}
                        className="block px-7 py-2.5 text-[14px] hover:text-white transition-colors"
                        style={{ color: "rgba(255,255,255,0.5)" }}>
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link href={item.href!} onClick={onClose} className="block px-5 py-3.5 text-[15px] font-semibold text-white">
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </div>
      <div className="p-5 flex flex-col gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/explore" onClick={onClose}
          className="text-center rounded-full px-6 py-3 text-[14px] font-semibold text-white hover:bg-white/10 transition-colors"
          style={{ border: "1px solid rgba(255,255,255,0.2)" }}>
          Go to app
        </Link>
        <Link href="/explore" onClick={onClose}
          className="text-center rounded-full bg-white px-6 py-3 text-[14px] font-bold text-neutral-900 hover:opacity-90 transition-opacity">
          Get the app
        </Link>
      </div>
    </div>
  );
}

export function SiteNav() {
  const [bannerOpen, setBannerOpen] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const activeItems = navItems.find((n) => n.label === activeDropdown)?.items;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setActiveDropdown(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      {/* Announcement banner */}
      {bannerOpen && (
        <div className="relative flex items-center justify-center px-10 py-2.5 text-center" style={{ background: "#1a1a1a" }}>
          <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.7)" }}>
            Viewing for{" "}
            <span className="inline-flex items-center gap-1.5 font-semibold text-white">
              <img src={`${FLAGS}/flags-united-kingdom.svg`} alt="UK" className="w-4 h-4 rounded-full object-cover" />
              United Kingdom
            </span>
            {"  "}Not right?{" "}
            <button className="underline underline-offset-2 font-semibold text-white hover:opacity-70 transition-opacity">
              Change country
            </button>
          </p>
          <button onClick={() => setBannerOpen(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 transition-colors"
            style={{ color: "rgba(255,255,255,0.4)" }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Nav bar — relative so dropdown can anchor to it */}
      <nav
        ref={navRef}
        className="sticky top-0 z-50"
        style={{ background: "#0f0f11", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="mx-auto flex max-w-[1200px] items-center px-5 py-4 gap-8">
          {/* Logo */}
          <Link href="/" className="shrink-0 mr-auto">
            <img src={`${SUPABASE}/brand/aspora-full-logo.svg`} alt="aspora" className="h-[22px] brightness-0 invert" />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => (
              <div key={item.label} className="relative">
                {item.items ? (
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}
                    className={cn(
                      "flex items-center gap-1 rounded-lg px-3.5 py-2 text-[14px] font-semibold transition-colors",
                      activeDropdown === item.label ? "text-white bg-white/10" : "hover:text-white"
                    )}
                    style={{ color: activeDropdown === item.label ? "#fff" : "rgba(255,255,255,0.7)" }}
                  >
                    {item.label}
                    <ChevronDown size={13}
                      className={cn("transition-transform duration-200", activeDropdown === item.label ? "rotate-180" : "")}
                    />
                  </button>
                ) : (
                  <Link href={item.href!}
                    className="flex items-center rounded-lg px-3.5 py-2 text-[14px] font-semibold transition-colors hover:text-white"
                    style={{ color: "rgba(255,255,255,0.7)" }}>
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            <button className="flex items-center justify-center w-7 h-7 rounded-full overflow-hidden hover:opacity-80 transition-opacity">
              <img src={`${FLAGS}/flags-united-kingdom.svg`} alt="UK" className="w-full h-full object-cover" />
            </button>
            <Link href="/explore"
              className="text-[13px] font-semibold transition-colors hover:text-white px-3 py-2"
              style={{ color: "rgba(255,255,255,0.6)" }}>
              Go to app
            </Link>
            <Link href="/explore"
              className="rounded-full bg-white px-5 py-2.5 text-[13px] font-bold text-neutral-900 hover:opacity-90 transition-opacity">
              Get the app
            </Link>
          </div>

          <button onClick={() => setMobileOpen(true)} className="md:hidden p-2" style={{ color: "rgba(255,255,255,0.7)" }}>
            <Menu size={20} />
          </button>
        </div>

        {/* Mega dropdown — rendered inside nav so it's part of the sticky block, spans full width */}
        {activeDropdown && activeItems && (
          <MegaDropdownPanel items={activeItems} onClose={() => setActiveDropdown(null)} />
        )}
      </nav>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
