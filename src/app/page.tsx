import Link from "next/link";
import { Suspense } from "react";

import { MarketingNav } from "@/components/layout/MarketingNav";
import { PricingCards } from "@/components/payment/PricingCards";
import { HomeClient } from "./HomeClient";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100">
      <Suspense fallback={null}>
        <HomeClient />
      </Suspense>
      <MarketingNav />

      <main>
        <section className="flex min-h-screen flex-col items-center justify-center px-6 pb-20 pt-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs text-cyan-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_6px_rgba(34,211,238,0.9)]" />
            Powered by Kish Tech · Trusted by 1000s
          </div>
          <h1 className="mt-7 max-w-4xl text-balance text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl">
            Your Personal
            <br />
            <span className="text-cyan-300">Neural OS</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base font-light leading-relaxed text-slate-400 sm:text-lg">
            The most powerful AI assistant with live web search, image analysis, document reading, 5 specialized modes
            and email-verified accounts.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/chat"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 px-7 py-3.5 text-sm font-bold text-black shadow-[0_0_18px_rgba(34,211,238,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(34,211,238,0.55)]"
            >
              Open Chat →
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-transparent px-7 py-3.5 text-sm font-medium text-slate-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
            >
              See Pricing
            </a>
          </div>

          <div className="mt-14 flex max-w-3xl flex-wrap justify-center gap-2">
            {[
              ["#22d3ee", "Web Search"],
              ["#f472b6", "Image Analysis"],
              ["#4ade80", "File Reading"],
              ["#a78bfa", "Memory"],
              ["#fb923c", "Custom Persona"],
              ["#22d3ee", "5 AI Modes"],
              ["#4ade80", "OTP Verified"],
            ].map(([color, label]) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-slate-400"
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: color as string }} />
                {label}
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-20">
          <div className="font-mono text-xs tracking-[0.2em] text-cyan-300">CAPABILITIES</div>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">Everything You Need</h2>
          <p className="mt-3 max-w-xl text-slate-400">One AI, unlimited possibilities.</p>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "🔍",
                name: "Live Web Search",
                desc: "Real-time answers from the internet. News, sports, stocks, research — always current.",
                badge: "PRO",
              },
              {
                icon: "🖼️",
                name: "Image Analysis",
                desc: "Upload any photo. Kish describes, analyzes, and answers questions with remarkable accuracy.",
                badge: "PRO",
              },
              {
                icon: "📄",
                name: "Document Reading",
                desc: "Upload text, code, CSV and more. Get summaries, answers, and insights instantly.",
                badge: "PRO",
              },
              {
                icon: "🧠",
                name: "Full Memory",
                desc: "Kish remembers everything in the session and builds on context intelligently.",
                badge: "ALL PLANS",
              },
              {
                icon: "⚙️",
                name: "Custom Persona",
                desc: "Make Kish your company assistant, a doctor, a teacher — any personality you need.",
                badge: "PRO",
              },
              {
                icon: "🔐",
                name: "Email OTP Security",
                desc: "Every account verified via email OTP. Secure, no spam, no fake accounts.",
                badge: "ALL PLANS",
              },
            ].map((f) => (
              <div
                key={f.name}
                className="rounded-2xl border border-white/10 bg-white/5 p-7 transition hover:-translate-y-1 hover:border-cyan-400/25"
              >
                <div className="text-3xl">{f.icon}</div>
                <div className="mt-4 text-base font-semibold">{f.name}</div>
                <div className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</div>
                <div className="mt-3 inline-block rounded border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 font-mono text-[10px] text-cyan-300">
                  {f.badge}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-24" id="pricing">
          <div className="font-mono text-xs tracking-[0.2em] text-cyan-300">PRICING</div>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">Simple & Transparent</h2>
          <p className="mt-3 max-w-xl text-slate-400">Pay with card or M-Pesa. Cancel anytime.</p>
          <PricingCards />
        </section>

        <footer className="border-t border-white/10 px-8 py-10 text-center">
          <p className="font-mono text-xs text-slate-600">
            © {new Date().getFullYear()} Kish AI · Built with Claude API · Stripe + M-Pesa · Secure OTP Auth
          </p>
          <div className="mt-4 flex justify-center gap-4 text-xs text-slate-500">
            <Link className="hover:text-cyan-300" href="/support">
              Support
            </Link>
            <Link className="hover:text-cyan-300" href="/billing">
              Billing
            </Link>
            <Link className="hover:text-cyan-300" href="/admin">
              Admin
            </Link>
            <a className="hover:text-cyan-300" href="/legacy/index.html">
              Legacy UI
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
