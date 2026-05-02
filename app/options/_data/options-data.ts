// Shared options data generator — deterministic, seeded by symbol

export interface OptionContract {
  contractId: string; // e.g. "AAPL-20250425-200-CALL"
  symbol: string;
  expiry: string;     // "Apr 25, 2025"
  expiryCode: string; // "20250425"
  strike: number;
  type: "CALL" | "PUT";
  price: number;
  change: number;
  changePct: number;
  oi: string;         // "1.21M"
  oiRaw: number;      // raw OI count for aggregation
  volume: string;     // "284K"
  volumeRaw: number;  // raw volume count for aggregation
  iv: number;         // implied volatility %
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  bid: number;
  ask: number;
  itm: boolean;       // in the money
}

export type ExpiryType = "Daily" | "Weekly" | "Monthly" | "Quarterly";

export interface ExpiryGroup {
  label: string;      // "Apr 25, 2025"
  code: string;       // "20250425"
  type: ExpiryType;
  daysToExpiry: number;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
}

function fmtCount(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return `${n}`;
}

export function getExpiries(symbol: string): ExpiryGroup[] {
  return [
    { label: "Apr 25, 2025", code: "20250425", type: "Daily", daysToExpiry: 1 },
    { label: "May 2, 2025",  code: "20250502", type: "Weekly", daysToExpiry: 8 },
    { label: "May 16, 2025", code: "20250516", type: "Monthly", daysToExpiry: 22 },
    { label: "Jun 20, 2025", code: "20250620", type: "Monthly", daysToExpiry: 57 },
    { label: "Sep 19, 2025", code: "20250919", type: "Quarterly", daysToExpiry: 148 },
    { label: "Dec 19, 2025", code: "20251219", type: "Quarterly", daysToExpiry: 239 },
    { label: "Jan 16, 2026", code: "20260116", type: "Quarterly", daysToExpiry: 267 },
  ];
}

/** Derive base price for any symbol consistently */
export function getBasePrice(symbol: string): number {
  const known: Record<string, number> = {
    AAPL: 198.11, NVDA: 124.92, TSLA: 178.24, MSFT: 428.15,
    AMZN: 186.42, GOOGL: 152.67, META: 523.80,
    SPY: 524.18,  QQQ: 441.32,  VTI: 248.65,
    IWM: 198.42,  GLD: 224.87,  TLT: 89.24,
    XLK: 214.56,  ARKK: 48.73,
    SPX: 5234.18, NDX: 18247.09, DJI: 39142.23,
    RUT: 2048.67, VIX: 18.42,   NYA: 17842.55,
  };
  if (known[symbol]) return known[symbol];
  const h = hashStr(symbol);
  return Math.round(50 + (h % 450));
}

/** Generate strike ladder centered on the underlying price */
export function getStrikes(underlyingPrice: number, count = 30): number[] {
  // Choose a sensible step
  let step = 1;
  if (underlyingPrice > 5000) step = 25;
  else if (underlyingPrice > 1000) step = 10;
  else if (underlyingPrice > 200) step = 5;
  else if (underlyingPrice > 50) step = 2.5;

  const atm = Math.round(underlyingPrice / step) * step;
  const strikes: number[] = [];
  const half = Math.floor(count / 2);
  for (let i = -half; i <= half; i++) {
    strikes.push(+(atm + i * step).toFixed(2));
  }
  return strikes;
}

/** Generate all contracts for a given symbol + expiry */
export function getContracts(symbol: string, expiryCode: string): OptionContract[] {
  const expiries = getExpiries(symbol);
  const expGroup = expiries.find(e => e.code === expiryCode) ?? expiries[0];
  const underlying = getBasePrice(symbol);
  const strikes = getStrikes(underlying);
  const contracts: OptionContract[] = [];
  const dte = expGroup.daysToExpiry;

  for (const strike of strikes) {
    for (const type of ["CALL", "PUT"] as const) {
      const seed = hashStr(`${symbol}-${expiryCode}-${strike}-${type}`);
      const rng = seeded(seed);

      const itm = type === "CALL" ? strike < underlying : strike > underlying;
      const moneyness = Math.abs(strike - underlying) / underlying;

      // BS-inspired price approximation
      const intrinsic = itm ? Math.abs(underlying - strike) : 0;
      const timePrem = Math.max(0.01, (rng() * 2 + 0.5) * (1 - moneyness * 3) * Math.sqrt(dte / 365) * underlying * 0.02);
      const price = +(intrinsic + timePrem).toFixed(2);

      const changeMag = +(rng() * price * 0.25).toFixed(2);
      const changeSign = rng() > 0.45 ? 1 : -1;
      const change = +(changeSign * changeMag).toFixed(2);
      const changePct = price > 0 ? +((change / (price - change)) * 100).toFixed(1) : 0;

      const oiN = Math.round((rng() * 1.8e6 + 50000) * (itm ? 1.4 : 0.6));
      const volN = Math.round(oiN * (rng() * 0.4 + 0.05));

      const iv = +(20 + rng() * 40 + moneyness * 15).toFixed(1);
      const absD = Math.max(0.01, Math.min(0.99, 0.5 - (moneyness * 3 * (type === "CALL" ? 1 : -1))));
      const delta = type === "CALL" ? +absD.toFixed(3) : +(-absD).toFixed(3);
      const spread = Math.max(0.01, price * 0.01);
      const bid = +(price - spread / 2).toFixed(2);
      const ask = +(price + spread / 2).toFixed(2);

      contracts.push({
        contractId: `${symbol}-${expiryCode}-${strike}-${type}`,
        symbol,
        expiry: expGroup.label,
        expiryCode,
        strike,
        type,
        price,
        change,
        changePct,
        oi: fmtCount(oiN),
        oiRaw: oiN,
        volume: fmtCount(volN),
        volumeRaw: volN,
        iv,
        delta,
        gamma: +(rng() * 0.05).toFixed(4),
        theta: +(-(rng() * 0.15 + 0.01)).toFixed(4),
        vega: +(rng() * 0.3).toFixed(4),
        bid,
        ask,
        itm,
      });
    }
  }
  return contracts;
}

/** Aggregate Open Interest stats across the full chain for a given expiry */
export interface OIStats {
  totalCallOI: number;
  totalPutOI: number;
  putCallRatio: number; // putOI / callOI, 2dp
  callPct: number;      // 0-100, integer
  putPct: number;       // 0-100, integer
}

export function getOIStats(symbol: string, expiryCode: string): OIStats {
  const contracts = getContracts(symbol, expiryCode);
  let callOI = 0;
  let putOI = 0;
  for (const c of contracts) {
    if (c.type === "CALL") callOI += c.oiRaw;
    else putOI += c.oiRaw;
  }
  const total = callOI + putOI || 1;
  const callPct = Math.round((callOI / total) * 100);
  return {
    totalCallOI: callOI,
    totalPutOI: putOI,
    putCallRatio: +(putOI / (callOI || 1)).toFixed(2),
    callPct,
    putPct: 100 - callPct,
  };
}

/**
 * Cumulative OI stats across the entire option chain — every expiry, every strike.
 * Used by detail-page Key Information panels which should reflect overall positioning,
 * not the slice currently shown in a popular-options list.
 */
export function getCumulativeOIStats(symbol: string): OIStats {
  let callOI = 0;
  let putOI = 0;
  for (const expiry of getExpiries(symbol)) {
    for (const c of getContracts(symbol, expiry.code)) {
      if (c.type === "CALL") callOI += c.oiRaw;
      else putOI += c.oiRaw;
    }
  }
  const total = callOI + putOI || 1;
  const callPct = Math.round((callOI / total) * 100);
  return {
    totalCallOI: callOI,
    totalPutOI: putOI,
    putCallRatio: +(putOI / (callOI || 1)).toFixed(2),
    callPct,
    putPct: 100 - callPct,
  };
}

/** Popular/highlighted options for the instrument detail tab */
export function getPopularOptions(symbol: string, count = 7, expiryCode?: string): OptionContract[] {
  const expiries = getExpiries(symbol);
  const expiry = (expiryCode && expiries.find(e => e.code === expiryCode)) || expiries[0];
  const all = getContracts(symbol, expiry.code);
  const underlying = getBasePrice(symbol);

  // Pick alternating calls/puts near the money with high OI
  const step = getStrikes(underlying, 2)[1] - getStrikes(underlying, 2)[0];
  const callStrikes = [1, 2, 4, 3].map(n => Math.round((underlying + n * step) / step) * step);
  const putStrikes  = [1, 2, 3].map(n => Math.round((underlying - n * step) / step) * step);

  const picks: OptionContract[] = [];
  for (let i = 0; i < Math.min(count, callStrikes.length + putStrikes.length); i++) {
    const isCall = i % 2 === 0;
    const strikeArr = isCall ? callStrikes : putStrikes;
    const strike = strikeArr[Math.floor(i / 2)];
    const type = isCall ? "CALL" : "PUT";
    const found = all.find(c => c.strike === strike && c.type === type);
    if (found) picks.push(found);
  }
  return picks.slice(0, count);
}
