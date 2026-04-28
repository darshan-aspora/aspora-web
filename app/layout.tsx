import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import { TickerVisibilityProvider } from "@/components/ticker-visibility";
import { AIProvider } from "@/contexts/ai-context";
import { CompareProvider } from "@/contexts/compare-context";
import { FontProvider } from "@/components/font-toggle";
import { Agentation } from "agentation";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const haffer = localFont({
  src: "../Haffer/Haffer/HafferUprightsVF.woff2",
  variable: "--font-haffer",
  display: "swap",
});


export const metadata: Metadata = {
  title: "US Equity",
  description: "Trade US Stocks, ETFs & Options",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f0f11",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("light", "font-sans font-inter", inter.variable, haffer.variable)} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <TickerVisibilityProvider>
            <AIProvider>
              <CompareProvider>
                <FontProvider>
                  {children}
                </FontProvider>
              </CompareProvider>
            </AIProvider>
          </TickerVisibilityProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}
