"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { SiteNav } from "@/components/marketing/site-nav";

const SUPABASE = "https://qkejcqlvssytkmrzfeut.supabase.co/storage/v1/object/public/brand-assets";

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  // Custom SVG mask shape from the original source
  const maskSvg = `url("data:image/svg+xml,%3Csvg width='580' height='406' viewBox='0 0 580 406' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 17.731C0 7.14159 9.25338-1.07165 19.7756 0.11933 227.566 23.6386 352.43 23.6014 560.228 0.115399 570.749-1.07372 580 7.13915 580 17.7272V387.877C580 398.468 570.745 406.682 560.221 405.487 352.555 381.918 227.472 381.491 19.8164 405.443 9.28027 406.658 0 398.44 0 387.834V17.731Z' fill='%23000'/%3E%3C/svg%3E")`;

  return (
    <section
      className="relative flex flex-col items-center text-center overflow-visible"
      style={{ height: "100vh", paddingTop: "220px" }}
    >
      {/* Full-bleed sunrise background photo */}
      <div className="absolute inset-0 -z-10">
        <picture>
          <source
            type="image/avif"
            srcSet={`${SUPABASE}/backgrounds/optimized/768/snapshot-11-sunrise.avif 768w, ${SUPABASE}/backgrounds/optimized/1280/snapshot-11-sunrise.avif 1280w, ${SUPABASE}/backgrounds/optimized/1920/snapshot-11-sunrise.avif 1920w`}
            sizes="100vw"
          />
          <source
            type="image/webp"
            srcSet={`${SUPABASE}/backgrounds/optimized/768/snapshot-11-sunrise.webp 768w, ${SUPABASE}/backgrounds/optimized/1280/snapshot-11-sunrise.webp 1280w, ${SUPABASE}/backgrounds/optimized/1920/snapshot-11-sunrise.webp 1920w`}
            sizes="100vw"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${SUPABASE}/backgrounds/optimized/1920/snapshot-11-sunrise.webp`}
            alt=""
            className="w-full h-full object-cover"
          />
        </picture>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-4 max-w-[840px] px-5">
          <h1
            className="text-white m-0"
            style={{
              fontSize: "clamp(3rem, 8vw, 5.75rem)",
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: "-0.01em",
              textTransform: "uppercase",
            }}
          >
            Your ambition is our business
          </h1>
          <p className="text-white m-0 max-w-[612px]"
            style={{ fontSize: "clamp(1rem, 2vw, 1.125rem)", lineHeight: 1.5 }}>
            You crossed borders to build a bigger life. Your bank should keep up.
            Send money home, pay bills in India, and manage your finances across
            countries. All from one app.
          </p>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/explore"
            className="rounded-full bg-white px-7 py-3.5 text-[14px] font-bold text-neutral-900 hover:bg-white/90 transition-colors">
            Download app
          </Link>
          <Link href="#coming"
            className="rounded-full border-2 border-white/50 px-7 py-3.5 text-[14px] font-bold text-white hover:border-white/80 transition-colors">
            See what is coming
          </Link>
        </div>
      </div>

      {/* Hero image with the original SVG mask shape */}
      <div className="relative z-10 mt-8" style={{ maxWidth: "min(1200px, 90vw)", transform: "translateY(48px)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${SUPABASE}/photo-studio/library/20260304_150927_001_ind_gulp.png`}
          alt="Aspora user"
          className="w-full block object-cover"
          style={{
            aspectRatio: "580 / 406",
            maskImage: maskSvg,
            WebkitMaskImage: maskSvg,
            maskSize: "100% 100%",
            WebkitMaskSize: "100% 100%",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
          }}
        />
      </div>
    </section>
  );
}

// ─── Credibility ──────────────────────────────────────────────────────────────

function CredibilitySection() {
  const stats = [
    { value: "$10B+", label: "Sent home" },
    { value: "1M+", label: "People trust" },
    { value: "5+", label: "Countries live" },
  ];

  const pressLogos = [
    { src: `${SUPABASE}/press-logos/techcrunch.svg`, alt: "TechCrunch", tall: false },
    { src: `${SUPABASE}/press-logos/yourstory.svg`, alt: "YourStory", tall: false },
    { src: `${SUPABASE}/press-logos/economictimes.svg`, alt: "The Economic Times", tall: true },
    { src: `${SUPABASE}/press-logos/gulfnews.svg`, alt: "Gulf News", tall: false },
  ];

  return (
    <section
      className="relative text-center bg-white"
      style={{ padding: "calc(6rem + 120px) 0 4rem" }}
    >
      <div className="mx-auto max-w-[1436px] px-5">
        <p className="m-0 mb-12 font-bold text-neutral-900"
          style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)", lineHeight: 1.3 }}>
          A million people already call Aspora home
        </p>

        <div className="flex justify-center gap-16 flex-wrap mb-10">
          {stats.map((s) => (
            <div key={s.value} className="text-center">
              <p className="m-0 mb-1.5 font-black uppercase tracking-tight text-neutral-900"
                style={{ fontSize: "clamp(2.75rem, 6vw, 3.75rem)", lineHeight: 1 }}>
                {s.value}
              </p>
              <p className="m-0 text-neutral-500" style={{ fontSize: "0.875rem" }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-7 pt-4 border-t border-neutral-200 mt-10">
          <p className="m-0 text-neutral-400 font-semibold uppercase tracking-[0.15em]"
            style={{ fontSize: "0.6875rem" }}>
            As featured in
          </p>
          <div className="flex justify-center items-center gap-12 flex-wrap">
            {pressLogos.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.alt}
                src={p.src}
                alt={p.alt}
                className="w-auto object-contain opacity-40 grayscale hover:opacity-70 transition-opacity"
                style={{ height: p.tall ? "26px" : "20px", maxWidth: "160px" }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Send Money ───────────────────────────────────────────────────────────────

function SendMoneySection() {
  const checkIconUrl = `${SUPABASE}/icons/filled/check-circle.svg`;
  const switchIconUrl = `${SUPABASE}/icons/filled/switch-vertical-01.svg`;
  const chevronUrl = `${SUPABASE}/icons/filled/chevron-down.svg`;

  return (
    <section className="bg-white py-24" id="send">
      <div className="mx-auto max-w-[1436px] px-5">
        <div className="flex justify-between items-center gap-20 flex-col md:flex-row">
          {/* Text */}
          <div className="flex flex-col gap-10 max-w-[620px]">
            <div className="flex flex-col gap-4">
              <span className="text-neutral-400 font-semibold uppercase tracking-[0.12em] text-[11px]">Live now</span>
              <h2 className="m-0 font-black text-neutral-900 leading-tight tracking-tight"
                style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}>
                Send money home without the hidden math
              </h2>
              <p className="m-0 text-neutral-500 leading-relaxed" style={{ fontSize: "1.0625rem" }}>
                No hidden fees. No inflated exchange rates. No waiting three days for a
                confirmation. The rate you see is the rate you get. That is it.
              </p>
            </div>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              {[
                "UK, UAE, US, and Europe to India",
                "Live Google rates with zero markup",
                "Money lands in minutes, not days",
                "Track every transfer in real time",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-neutral-900"
                  style={{ fontSize: "1rem", lineHeight: 1.5 }}>
                  <span className="shrink-0 w-5 h-5 block bg-neutral-900"
                    style={{
                      maskImage: `url('${checkIconUrl}')`,
                      WebkitMaskImage: `url('${checkIconUrl}')`,
                      maskSize: "contain",
                      WebkitMaskSize: "contain",
                      maskRepeat: "no-repeat",
                      WebkitMaskRepeat: "no-repeat",
                    }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Converter widget */}
          <div className="shrink-0 w-full md:w-[500px] rounded-[64px] flex flex-col gap-6 bg-neutral-100 px-10 py-12">
            {/* You send */}
            <div className="bg-white rounded-2xl px-6 py-5 flex flex-col gap-3">
              <p className="m-0 text-neutral-400 font-semibold uppercase tracking-[0.12em] text-[11px]">You send</p>
              <div className="flex items-center justify-between">
                <p className="m-0 font-black tabular-nums text-neutral-900"
                  style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)" }}>1,000</p>
                <div className="flex items-center gap-2 bg-neutral-100 rounded-full px-4 py-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${SUPABASE}/3d-icons/flag-gbp.png`} alt="GBP" className="w-7 h-7 rounded-full object-cover border border-neutral-200" />
                  <span className="font-bold text-neutral-900 text-sm">GBP</span>
                  <span className="w-4 h-4 block bg-neutral-900"
                    style={{
                      maskImage: `url('${chevronUrl}')`,
                      WebkitMaskImage: `url('${chevronUrl}')`,
                      maskSize: "contain",
                      WebkitMaskSize: "contain",
                      maskRepeat: "no-repeat",
                      WebkitMaskRepeat: "no-repeat",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Rate */}
            <div className="flex items-center gap-2.5">
              <div className="flex-1 h-px bg-neutral-200" />
              <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-full px-[18px] py-2">
                <span className="w-[18px] h-[18px] block bg-neutral-900"
                  style={{
                    maskImage: `url('${switchIconUrl}')`,
                    WebkitMaskImage: `url('${switchIconUrl}')`,
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                  }}
                />
                <span className="font-semibold text-neutral-900 text-[12px]">Live Google rate</span>
                <span className="text-neutral-500 text-[12px]">£1 = ₹110.24</span>
              </div>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>

            {/* They receive */}
            <div className="bg-white rounded-2xl px-6 py-5 flex flex-col gap-3">
              <p className="m-0 text-neutral-400 font-semibold uppercase tracking-[0.12em] text-[11px]">They receive</p>
              <div className="flex items-center justify-between">
                <p className="m-0 font-black tabular-nums text-neutral-900"
                  style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)" }}>1,10,240</p>
                <div className="flex items-center gap-2 bg-neutral-100 rounded-full px-4 py-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${SUPABASE}/3d-icons/flag-inr.png`} alt="INR" className="w-7 h-7 rounded-full object-cover border border-neutral-200" />
                  <span className="font-bold text-neutral-900 text-sm">INR</span>
                </div>
              </div>
            </div>

            {/* Fee */}
            <div className="flex items-center justify-between px-1">
              <span className="text-neutral-400 text-[13px]">Transfer fee</span>
              <span className="text-emerald-600 font-bold text-[12px] uppercase tracking-wide">First transfer is free</span>
            </div>

            {/* CTA */}
            <Link href="/explore"
              className="w-full text-center rounded-2xl bg-neutral-900 py-4 text-[14px] font-bold text-white hover:opacity-90 transition-opacity">
              Send money now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pay Bills ────────────────────────────────────────────────────────────────

function PayBillsSection() {
  const checkIconUrl = `${SUPABASE}/icons/filled/check-circle.svg`;

  return (
    <section className="bg-white py-24 border-t border-neutral-100" id="bills">
      <div className="mx-auto max-w-[1436px] px-5">
        <div className="flex justify-between items-center gap-20 flex-col md:flex-row-reverse">
          {/* Text */}
          <div className="flex flex-col gap-10 max-w-[620px]">
            <div className="flex flex-col gap-4">
              <span className="text-neutral-400 font-semibold uppercase tracking-[0.12em] text-[11px]">Live in the UK</span>
              <h2 className="m-0 font-black text-neutral-900 leading-tight tracking-tight"
                style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}>
                Pay bills back home without the back and forth
              </h2>
              <p className="m-0 text-neutral-500 leading-relaxed" style={{ fontSize: "1.0625rem" }}>
                Pay electricity, gas, mobile, broadband, and every other bill in India
                directly from your GBP account. No processing fee. No middleman.
              </p>
            </div>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              {[
                "Pay directly from your UK bank account",
                "Zero processing fees",
                "All bill types supported across India",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-neutral-900"
                  style={{ fontSize: "1rem", lineHeight: 1.5 }}>
                  <span className="shrink-0 w-5 h-5 block bg-neutral-900"
                    style={{
                      maskImage: `url('${checkIconUrl}')`,
                      WebkitMaskImage: `url('${checkIconUrl}')`,
                      maskSize: "contain",
                      WebkitMaskSize: "contain",
                      maskRepeat: "no-repeat",
                      WebkitMaskRepeat: "no-repeat",
                    }}
                  />
                  {item}
                </li>
              ))}
            </ul>
            <div>
              <Link href="/explore"
                className="inline-flex rounded-full bg-neutral-900 px-7 py-3.5 text-[14px] font-bold text-white hover:opacity-80 transition-opacity">
                Pay bills now
              </Link>
            </div>
          </div>

          {/* Bill widget */}
          <div className="shrink-0 w-full md:w-[500px] rounded-[64px] bg-neutral-100 flex items-center justify-center py-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${SUPABASE}/3d-icons/bill-payments-combined.png`}
              alt="Bill payments"
              className="w-[285px] h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── NRI Account ─────────────────────────────────────────────────────────────

function NRISection() {
  return (
    <section className="py-24 md:py-32" id="nri" style={{ background: "var(--color-neutral-950, #16100f)" }}>
      <div className="mx-auto max-w-[1436px] px-5">
        <div className="flex items-center gap-24 flex-col md:flex-row">
          {/* Text */}
          <div className="flex flex-col gap-6 max-w-[520px]">
            <div className="flex flex-col gap-4">
              <span className="text-neutral-500 font-semibold uppercase tracking-[0.12em] text-[11px]">Coming soon</span>
              <h2 className="m-0 font-black text-white leading-tight tracking-tight"
                style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}>
                Aspora NRI account
              </h2>
              <p className="m-0 leading-relaxed" style={{ fontSize: "1.0625rem", color: "#938e8d" }}>
                The first fully digital NRE/NRO account. No paperwork. No branch
                visits. No flying back to India to open a bank account. Open, fund, and
                manage your Indian bank account from wherever you live.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap mt-2">
              <Link href="/explore"
                className="rounded-full bg-white px-7 py-3.5 text-[14px] font-bold text-neutral-900 hover:opacity-90 transition-opacity">
                Join the waitlist
              </Link>
              <Link href="/explore"
                className="rounded-full border border-neutral-700 px-7 py-3.5 text-[14px] font-bold text-white hover:border-neutral-500 transition-colors">
                Explore benefits
              </Link>
            </div>
          </div>

          {/* NRI 3D image */}
          <div className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${SUPABASE}/3d-icons/nri-account-3d.png`}
              alt="NRI Account"
              className="w-full md:w-[600px] h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Roadmap ──────────────────────────────────────────────────────────────────

function RoadmapSection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-[1436px] px-5">
        {/* Header */}
        <div className="text-center flex flex-col items-center mb-12">
          <span className="text-neutral-400 font-semibold uppercase tracking-[0.12em] text-[11px]">Also on the way</span>
          <h2 className="m-0 mt-3 font-black text-neutral-900 tracking-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}>
            Your full financial life across borders
          </h2>
          <p className="m-0 mt-3 text-neutral-500 leading-relaxed max-w-[560px]" style={{ fontSize: "1.0625rem" }}>
            Sending money home was the start. We are building everything you need to
            save, invest, and bank across countries.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ gridTemplateRows: "auto auto" }}>
          {/* Hero card */}
          <div className="md:row-span-2 rounded-2xl bg-neutral-100 p-8 md:p-12 flex flex-col justify-center gap-2 cursor-pointer group">
            <div className="mb-10">
              <div className="h-[300px] flex items-center justify-center">
                <img src="/images/3d/lock-green.png" alt="" className="h-[260px] w-auto object-contain" />
              </div>
            </div>
            <h3 className="m-0 font-black text-neutral-900"
              style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.625rem)", lineHeight: 1.2 }}>
              Digital Gold and Mutual Funds
            </h3>
            <p className="m-0 text-neutral-500 leading-relaxed" style={{ fontSize: "1rem" }}>
              Invest in India from abroad. Buy digital gold or put money into Indian
              mutual funds directly through Aspora.
            </p>
            <Link href="/dev"
              className="mt-2 inline-flex font-bold text-neutral-900 underline underline-offset-4 hover:opacity-60 transition-opacity text-[14px]">
              Know more
            </Link>
          </div>

          {/* Multi-currency wallets */}
          <div className="rounded-2xl bg-neutral-100 p-6 md:p-8 flex items-center gap-12 cursor-pointer hover:bg-neutral-200/70 transition-colors">
            <div className="shrink-0 flex items-start justify-start">
              <div className="h-[120px] flex items-center justify-center w-20">
                <img src="/images/3d/people-glass.png" alt="" className="h-[100px] w-auto object-contain" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="m-0 font-black text-neutral-900" style={{ fontSize: "1.375rem", lineHeight: 1.2 }}>
                Multi-currency wallets
              </h3>
              <p className="m-0 text-neutral-500 leading-relaxed" style={{ fontSize: "1rem" }}>
                Hold GBP, USD, EUR, AED, INR, and more in one place. Convert between
                them at the real rate. Spend or send from whichever currency makes sense.
              </p>
            </div>
          </div>

          {/* High yield deposits */}
          <div className="rounded-2xl bg-neutral-100 p-6 md:p-8 flex items-center gap-12 cursor-pointer hover:bg-neutral-200/70 transition-colors">
            <div className="shrink-0 flex items-start justify-start">
              <div className="h-[120px] flex items-center justify-center w-20">
                <img src="/images/3d/megaphone-warm.png" alt="" className="h-[100px] w-auto object-contain" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="m-0 font-black text-neutral-900" style={{ fontSize: "1.375rem", lineHeight: 1.2 }}>
                High yield deposits
              </h3>
              <p className="m-0 text-neutral-500 leading-relaxed" style={{ fontSize: "1rem" }}>
                Lock your money and earn high rates across currencies. Fixed deposits
                managed in a few taps. No minimum balance surprises.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Community ────────────────────────────────────────────────────────────────

function CommunitySection() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* Forest background */}
      <div className="absolute inset-0 -z-10">
        <picture>
          <source
            type="image/avif"
            srcSet={`${SUPABASE}/backgrounds/optimized/768/snapshot-08-forest.avif 768w, ${SUPABASE}/backgrounds/optimized/1280/snapshot-08-forest.avif 1280w, ${SUPABASE}/backgrounds/optimized/1920/snapshot-08-forest.avif 1920w`}
            sizes="100vw"
          />
          <source
            type="image/webp"
            srcSet={`${SUPABASE}/backgrounds/optimized/768/snapshot-08-forest.webp 768w, ${SUPABASE}/backgrounds/optimized/1280/snapshot-08-forest.webp 1280w, ${SUPABASE}/backgrounds/optimized/1920/snapshot-08-forest.webp 1920w`}
            sizes="100vw"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${SUPABASE}/backgrounds/optimized/1920/snapshot-08-forest.webp`}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </picture>
      </div>

      <div className="relative z-10 mx-auto max-w-[1436px] px-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col items-start gap-4">
            <h2 className="m-0 font-black text-white leading-tight tracking-tight"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}>
              Arriving for the Filipino community
            </h2>
            <p className="m-0 text-white leading-relaxed" style={{ fontSize: "1.0625rem" }}>
              We started with the Indian diaspora and we are still building. New
              products, new countries, deeper roots. Now the same app, same standards,
              and same respect are coming to the Filipino community.
            </p>
            <div className="flex items-center gap-0 mt-4 w-full max-w-[440px]">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 rounded-l-full border border-white/30 bg-white/10 px-6 py-3 text-[13px] text-white placeholder-white/40 outline-none backdrop-blur-sm focus:border-white/50"
                style={{ minWidth: "180px" }}
              />
              <Link href="/explore"
                className="rounded-r-full bg-white px-6 py-3 text-[13px] font-bold text-neutral-900 hover:opacity-90 transition-opacity whitespace-nowrap">
                Join waitlist
              </Link>
            </div>
          </div>

          {/* Filipino community photo */}
          <div className="overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${SUPABASE}/Photography/filipino-community-2.png`}
              alt="Filipino community"
              className="w-full h-full object-cover block"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Security ─────────────────────────────────────────────────────────────────

function SecuritySection() {
  const features = [
    {
      icon: `${SUPABASE}/icons/filled/shield-01.svg`,
      title: "Regulated in every market",
      body: "Licensed and regulated by financial authorities in every country we operate in",
    },
    {
      icon: `${SUPABASE}/icons/filled/wallet-02.svg`,
      title: "Your money is always yours",
      body: "Funds are held separately and safeguarded until every transfer is complete. We never touch it",
    },
    {
      icon: `${SUPABASE}/icons/filled/check-circle.svg`,
      title: "Real-time tracking",
      body: "Know exactly where your money is at every step. From send to delivered",
    },
  ];

  return (
    <section className="bg-white py-24" id="security">
      <div className="mx-auto max-w-[1436px] px-5">
        <div className="flex items-center gap-20 flex-col md:flex-row">
          {/* Visual */}
          <div className="shrink-0 w-full md:w-[500px] rounded-[64px] bg-neutral-100 flex items-center justify-center py-12">
            <img src="/images/3d/lock-green.png" alt="" className="h-[280px] w-auto object-contain" />
          </div>

          {/* Text */}
          <div className="flex-1">
            <div className="mb-12">
              <h2 className="m-0 font-black text-neutral-900 leading-tight tracking-tight"
                style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}>
                Built to be trusted
              </h2>
              <p className="m-0 mt-3 text-neutral-500 leading-relaxed max-w-[531px]" style={{ fontSize: "1.0625rem" }}>
                Your security is our foundation. Every layer of Aspora is built to
                protect what matters most.
              </p>
            </div>
            <div className="flex flex-col gap-12">
              {features.map((f) => (
                <div key={f.title} className="flex items-center gap-6">
                  <span
                    className="shrink-0 w-8 h-8 block bg-neutral-900"
                    style={{
                      maskImage: `url('${f.icon}')`,
                      WebkitMaskImage: `url('${f.icon}')`,
                      maskSize: "contain",
                      WebkitMaskSize: "contain",
                      maskRepeat: "no-repeat",
                      WebkitMaskRepeat: "no-repeat",
                    }}
                  />
                  <div className="flex flex-col gap-2">
                    <h4 className="m-0 font-bold text-neutral-900" style={{ fontSize: "1.125rem" }}>{f.title}</h4>
                    <p className="m-0 text-neutral-500 leading-relaxed" style={{ fontSize: "1rem" }}>{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  const chevronUrl = `${SUPABASE}/icons/filled/chevron-down.svg`;

  const faqs = [
    { q: "What is Aspora?", a: "Aspora is a financial app built for the global diaspora. Right now you can send money from the UK, UAE, US, and Europe to India, and pay bills in India directly from your UK bank account. We are building more products for people who manage their lives across countries." },
    { q: "How much does it cost to send money?", a: "Aspora charges zero markup on exchange rates. The rate you see on the app is the rate you get. Transfer fees vary by corridor and payment method but are always shown upfront before you confirm." },
    { q: "How long does a transfer take?", a: "Most transfers to India arrive within minutes. Timing can vary depending on your bank and payment method, but you can track the status in real time inside the app." },
    { q: "Is Aspora safe to use?", a: "Yes. Aspora is licensed and regulated by financial authorities in every country we operate in. Your funds are held separately and safeguarded until every transfer is complete." },
    { q: "What is the Aspora NRI Account?", a: "The Aspora NRI Account is a fully digital NRE/NRO account coming soon. It lets you open, fund, and manage an Indian bank account from abroad without paperwork or branch visits. Join the waitlist to get early access." },
  ];

  return (
    <section className="bg-white py-24 border-t border-neutral-100">
      <div className="mx-auto max-w-[900px] px-5">
        <div className="text-center flex flex-col items-center mb-12">
          <h2 className="m-0 font-black text-neutral-900 tracking-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}>
            Frequently asked questions
          </h2>
          <p className="m-0 mt-2 text-neutral-500" style={{ fontSize: "1rem" }}>
            Quick answers to the things people ask us most.
          </p>
        </div>

        <div>
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-neutral-100">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between py-5 text-left gap-6 cursor-pointer bg-transparent border-0 p-0">
                <span className="font-semibold text-neutral-900 text-[16px]">{faq.q}</span>
                <span
                  className="shrink-0 w-4 h-4 block bg-neutral-400 transition-transform duration-200"
                  style={{
                    maskImage: `url('${chevronUrl}')`,
                    WebkitMaskImage: `url('${chevronUrl}')`,
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    transform: open === i ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
              <div className={cn("overflow-hidden transition-all duration-300", open === i ? "max-h-52 pb-5" : "max-h-0")}>
                <p className="m-0 text-neutral-500 leading-relaxed pr-8" style={{ fontSize: "1rem" }}>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <Link href="/dev"
            className="font-semibold text-neutral-900 underline underline-offset-4 hover:opacity-60 transition-opacity text-[14px]">
            See more questions
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

function BlogSection() {
  const articles = [
    {
      img: "https://cdn.sanity.io/images/joroillu/production/eb648e17b4a1213adfcd3f28238b5f810b3d5105-4274x2548.jpg?rect=0,206,4274,2137&w=800&h=400",
      title: "Welcome Home: A Guide to Your Next India Visit",
      body: "For NRIs, OCI Holders & PIOs ✦ The Indian Diaspora ✦ 2026 Edition ✦ By Aspora",
      author: "Rupali Amin",
      date: "23 Apr 2026",
    },
    {
      img: "https://cdn.sanity.io/images/joroillu/production/faedd74aba6a8a595e7d80fa0cdaf6fb1a88f981-1960x1029.png?rect=0,25,1960,980&w=800&h=400",
      title: "Best NRI Remittance Options for 2026: Cost-Effective and Fast",
      body: "Which NRI remittance option is cheapest in 2026? Compare digital apps, exchange houses, and bank wires for sending money from the US to India.",
      author: "Rupali Amin",
      date: "30 Mar 2026",
    },
    {
      img: "https://cdn.sanity.io/images/joroillu/production/d544521d773f9cdf3a4990fb0cb2e9840562ab1b-1960x1029.png?rect=0,25,1960,980&w=800&h=400",
      title: "Comparing Fees, Speed and Exchange Rates of USA to India Transfer Services",
      body: "What's the best way to send money to India from the USA? Compare fees, exchange rates, and speeds across top services to find the right provider for you.",
      author: "Rupali Amin",
      date: "30 Mar 2026",
    },
  ];

  return (
    <section className="bg-white py-24 border-t border-neutral-100">
      <div className="mx-auto max-w-[1436px] px-5">
        <div className="flex justify-between items-baseline mb-12">
          <h2 className="m-0 font-black text-neutral-900" style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}>
            Latest from Aspora
          </h2>
          <Link href="/dev" className="font-bold text-neutral-900 underline underline-offset-4 hover:opacity-60 transition-opacity text-[14px]">
            Browse all
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((a, i) => (
            <Link key={i} href="/dev"
              className="bg-neutral-100 rounded-2xl overflow-hidden flex flex-col text-current no-underline cursor-pointer group">
              <div className="h-[180px] bg-neutral-200 overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.img} alt={a.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-5 flex-1 flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#2e3eb1" }}></span>
                <h3 className="m-0 font-bold text-neutral-900 leading-snug"
                  style={{ fontSize: "1.0625rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {a.title}
                </h3>
                <p className="m-0 text-neutral-500 leading-snug text-[13px]"
                  style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {a.body}
                </p>
                <div className="flex items-center gap-2 text-neutral-400 text-[12px] mt-3">
                  <span>by {a.author}</span>
                  <span className="w-[3px] h-[3px] rounded-full bg-neutral-400 shrink-0" />
                  <span>{a.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTASection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = [
    `${SUPABASE}/hero-locations/optimized/1920/uk_london_big-ben_forest.webp`,
    `${SUPABASE}/hero-locations/optimized/1920/india_agra_taj-mahal_autumn.webp`,
    `${SUPABASE}/hero-locations/optimized/1920/us_new-york_brooklyn-bridge_winter.webp`,
    `${SUPABASE}/hero-locations/optimized/1920/italy_florence_duomo_ocean.webp`,
  ];

  useEffect(() => {
    const t = setInterval(() => setActiveSlide((s) => (s + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <section className="bg-white px-5 py-8 pb-24">
      <div className="mx-auto max-w-[1440px]">
        <div className="relative overflow-hidden rounded-2xl flex items-center justify-center min-h-[360px]">
          {/* Rotating background slides */}
          {slides.map((src, i) => (
            <div key={src}
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
              style={{ backgroundImage: `url('${src}')`, opacity: i === activeSlide ? 1 : 0 }}
            />
          ))}

          <div className="relative z-10 py-24 text-center flex flex-col items-center px-5">
            <h2 className="m-0 font-black text-white uppercase leading-[0.95] tracking-[-0.01em]"
              style={{ fontSize: "clamp(2.5rem, 7vw, 4.5rem)", maxWidth: "720px" }}>
              For people who belong to more than one place
            </h2>
            <p className="m-0 mt-5 text-white leading-relaxed" style={{ fontSize: "1.0625rem" }}>
              Send, save, and bank across borders. Your finances, finally in one place.
            </p>
            <div className="mt-10">
              <Link href="/explore"
                className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 font-bold text-neutral-900 hover:opacity-90 transition-opacity text-[14px]">
                <span>🍎</span>
                <span>▶</span>
                <span>Download app</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function SiteFooter() {
  return (
    <footer className="pt-16 pb-10 px-5" style={{ background: "#16100f" }}>
      <div className="mx-auto max-w-[1436px]">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${SUPABASE}/brand/aspora-full-logo.svg`} alt="Aspora"
              className="h-5 w-auto" style={{ filter: "invert(1)" }} />
            <div className="mt-5 flex flex-col gap-2.5">
              <Link href="/explore"
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 hover:opacity-80 transition-opacity no-underline"
                style={{ background: "#221b1a" }}>
                <span className="text-[16px]">🍎</span>
                <div>
                  <p className="m-0 text-[9px]" style={{ color: "#554e4d" }}>Download on the</p>
                  <p className="m-0 text-[12px] font-bold text-white">App Store</p>
                </div>
              </Link>
              <Link href="/explore"
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 hover:opacity-80 transition-opacity no-underline"
                style={{ background: "#221b1a" }}>
                <span className="text-[16px]">▶</span>
                <div>
                  <p className="m-0 text-[9px]" style={{ color: "#554e4d" }}>Get it on</p>
                  <p className="m-0 text-[12px] font-bold text-white">Google Play</p>
                </div>
              </Link>
            </div>
            {/* QR placeholder */}
            <div className="mt-4 h-[130px] w-[130px] rounded-xl p-2 bg-white flex items-center justify-center">
              <div className="grid grid-cols-5 gap-0.5 w-full h-full">
                {Array(25).fill(0).map((_, i) => (
                  <div key={i} className={cn("rounded-[1px]", [0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24].includes(i) ? "bg-neutral-900" : "bg-white")} />
                ))}
              </div>
            </div>
            <p className="mt-2 text-[11px]" style={{ color: "#554e4d" }}>Scan to download the app</p>
          </div>

          {[
            { heading: "Product", links: ["Send money", "NRI Banking", "Multi-currency account", "Pay bills"] },
            { heading: "Resources", links: ["Blog", "Currency rates", "Smart financial tools"] },
            { heading: "Company", links: ["About us", "Careers", "Roadmap", "Help"] },
            { heading: "Legal", links: ["Privacy Policy", "Terms of use"] },
          ].map((col) => (
            <div key={col.heading}>
              <p className="m-0 mb-4 text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: "#3a3433" }}>
                {col.heading}
              </p>
              <ul className="list-none p-0 m-0 space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link href="/dev" className="text-[13px] no-underline hover:opacity-70 transition-opacity" style={{ color: "#554e4d" }}>
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal text */}
        <div className="mt-12 pt-8" style={{ borderTop: "1px solid #221b1a" }}>
          {[
            "Real Transfer Limited (company number NI065249) is an entity that operates under the Aspora brand and is incorporated in the United Kingdom, having its registered office at Office 8, Merrion Business Centre, 58, Howard Street, Belfast, Northern Ireland, BT1 6PJ Belfast. Real Transfer Limited is an Authorised Payment Institution regulated by the Financial Conduct Authority (FCA) (FRN535949).",
            "Nesse Technologies Inc (registration number 1000398647) is another entity that operates under the Aspora brand and is incorporated in Ontario, Canada. It has its registered office at Unit C6 - 80 Birmingham St, Toronto, ON, Canada, M8V3W6. Nesse Technologies Inc. is registered and regulated by Financial Transactions and Report Analysis Centre (FINTRAC), Canada as a Money Service Business (MSB) registration number: M23142925.",
            "Each of Aspora's entities, i.e. Real Transfer Limited and Nesse Technologies Inc provide users of the platform (or clients) access to payment services in a number of operating jurisdictions. Client(s) funds remain segregated and are held in safeguarding until the payment transfer is complete.",
            "Payment services in the UAE are provided through a partner, Lulu International Exchange LLC, which is regulated by the Central Bank of UAE. Client(s) deal directly with Lulu International Exchange LLC via platform.",
            "In the US, Aspora operates as a Money Services Business (MSB), Vance Money Services LLC (MSB Registration Number: 31000302683150), and offers money remittance services to U.S. customers in partnership with a partner bank registered with the Financial Crimes Enforcement Network (FinCEN) and subject to all applicable U.S. federal and state regulations.",
          ].map((p, i) => (
            <p key={i} className="m-0 mb-3 leading-relaxed text-[11px] max-w-[960px]" style={{ color: "#3a3433" }}>{p}</p>
          ))}
          <p className="m-0 text-[11px]" style={{ color: "#3a3433" }}>
            For queries, please email us at{" "}
            <a href="mailto:help@aspora.com" className="underline" style={{ color: "#3a3433" }}>help@aspora.com</a>.
          </p>
        </div>

        {/* Bottom utility links */}
        <div className="mt-6 flex flex-wrap gap-x-1 text-[12px]" style={{ color: "#3a3433" }}>
          {["Style guide", "Components", "Templates", "Test", "Sitemap"].map((l, i, arr) => (
            <span key={l} className="flex items-center gap-1">
              <Link href="/dev" className="hover:opacity-70 transition-opacity no-underline" style={{ color: "#3a3433" }}>{l}</Link>
              {i < arr.length - 1 && <span style={{ color: "#221b1a" }}>·</span>}
            </span>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between" style={{ borderTop: "1px solid #221b1a" }}>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] hover:opacity-70 transition-opacity"
              style={{ borderColor: "#3a3433", color: "#554e4d" }}>
              🇬🇧 United Kingdom
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 4l3 3 3-3" />
              </svg>
            </button>
            <p className="m-0 text-[12px]" style={{ color: "#3a3433" }}>
              © 2026 Aspora.com (Vance Inc). All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-5">
            {[
              { label: "LinkedIn", href: "/dev" },
              { label: "X", href: "/dev" },
              { label: "Instagram", href: "/dev" },
            ].map((s) => (
              <Link key={s.label} href={s.href}
                className="text-[12px] font-semibold no-underline hover:opacity-70 transition-opacity"
                style={{ color: "#554e4d" }}>
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "var(--font-haffer), var(--font-inter), system-ui, sans-serif" }}>
      <SiteNav />
      <main>
        <HeroSection />
        <CredibilitySection />
        <SendMoneySection />
        <PayBillsSection />
        <NRISection />
        <RoadmapSection />
        <CommunitySection />
        <SecuritySection />
        <FAQSection />
        <BlogSection />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  );
}
