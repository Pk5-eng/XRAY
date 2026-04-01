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
      <body className="antialiased bg-zinc-950 text-zinc-100">
        {children}
      </body>
    </html>
  );
}
