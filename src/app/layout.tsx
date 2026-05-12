import type { Metadata } from "next";
import { Oxanium, Fira_Code } from "next/font/google";

import "./globals.css";

import { Providers } from "./providers";

const oxanium = Oxanium({
  subsets: ["latin"],
  variable: "--font-oxanium",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kish AI — Your Personal Neural OS",
  description:
    "Kish AI is a modern AI assistant with verified accounts, Pro upgrades, and a premium chat experience.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${oxanium.variable} ${firaCode.variable} min-h-screen bg-[#060a12] font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
