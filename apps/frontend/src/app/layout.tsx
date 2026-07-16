import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StellarLend — P2P Fixed-Rate Lending on Stellar",
  description: "Decentralized fixed-rate peer-to-peer lending protocol on Stellar Soroban. Borrow USDC against collateral at fixed interest rates.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-gray-950 text-gray-50 min-h-screen">
        <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-50">
          <div className="container mx-auto px-4 max-w-6xl flex items-center justify-between h-16">
            <div className="font-bold text-lg flex items-center gap-2">
              <span className="text-violet-400">◈</span>
              <span>StellarLend</span>
            </div>
            <nav className="hidden md:flex gap-6 text-sm text-gray-400">
              <a href="/borrow" className="hover:text-white transition-colors">Borrow</a>
              <a href="/lend" className="hover:text-white transition-colors">Lend</a>
              <a href="/markets" className="hover:text-white transition-colors">Markets</a>
              <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
            </nav>
            <button className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors">
              Connect Wallet
            </button>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 max-w-6xl">{children}</main>
      </body>
    </html>
  );
}
