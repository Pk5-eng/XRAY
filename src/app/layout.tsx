import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xray — AI Opportunity Intelligence",
  description: "An AI agent that researches and identifies high-value business opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-zinc-950 text-zinc-100 bg-grid min-h-screen">
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-950/20 via-transparent to-purple-950/10 pointer-events-none" />
        <div className="relative">
          {children}
        </div>
      </body>
    </html>
  );
}
