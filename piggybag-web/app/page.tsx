import Link from "next/link";
import { ConnectWallet } from "@/components/ConnectWallet";
import { FundingAgent } from "@/components/FundingAgent";
import { Logo } from "@/components/Logo";

const stats = [
  { value: "1–5 MON", label: "Per check, on-chain" },
  { value: "Minutes", label: "From apply to funded" },
  { value: "24/7", label: "Autonomous agent" },
  { value: "0", label: "Gatekeepers" },
];

const steps = [
  {
    n: "01",
    title: "Connect your wallet",
    body: "Sign in with your Monad testnet wallet. Your on-chain history is your track record.",
  },
  {
    n: "02",
    title: "Share your project",
    body: "Drop your GitHub and a short description of what you're building. That's the whole application.",
  },
  {
    n: "03",
    title: "Talk to the agent",
    body: "The PiggyBag agent asks a few sharp follow-up questions to understand your idea and your credibility.",
  },
  {
    n: "04",
    title: "Get funded instantly",
    body: "If approved, MON lands in your wallet immediately — sent from the agent's on-chain treasury.",
  },
];

const features = [
  {
    title: "AI-driven funding",
    body: "An autonomous agent evaluates every application and deploys capital without slow, manual review cycles.",
  },
  {
    title: "On-chain credit",
    body: "Wallet history and activity surface trustworthy builders and reduce guesswork — no warm intros required.",
  },
  {
    title: "Early-stage focus",
    body: "Built for prototypes, MVPs, and teams that need their first check, not their Series A.",
  },
  {
    title: "Transparent by default",
    body: "Every decision and every transfer happens on-chain. You can verify the treasury and every check.",
  },
];

const fundList = [
  "Prototypes and weekend hacks with a clear idea",
  "MVPs that need their first bit of capital to ship",
  "Solo builders and small teams on Monad",
  "Open-source tools and public-good infrastructure",
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="pb-label">{children}</p>;
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="border-b border-[var(--line)]">
        <div className="pb-wrap pb-section-hero">
          <div className="max-w-2xl pb-hero-stack">
            <SectionLabel>An AI agent that funds builders on Monad</SectionLabel>

            <h1 className="pb-display">
              Your first check, written by an <span className="pb-accent">agent</span>.
            </h1>

            <p className="pb-lead max-w-xl">
              PiggyBag replaces gatekeepers with an autonomous agent that reads your
              on-chain track record and funds early-stage products — in minutes, not
              months.
            </p>

            <div className="pb-hero-actions flex flex-wrap items-center gap-4">
              <Link href="#apply" className="pb-btn pb-btn-primary">
                Apply for funding
              </Link>
              <Link href="#how-it-works" className="pb-btn pb-btn-secondary">
                How it works
              </Link>
            </div>

            <p className="text-sm text-[#8a8794]">
              Live on Monad testnet · No pitch deck required
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-[var(--line)]">
        <div className="pb-wrap py-16 md:py-20">
          <dl className="grid grid-cols-2 gap-x-10 gap-y-10 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                  {stat.value}
                </dt>
                <dd className="mt-2 text-sm text-[#8a8794]">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 border-b border-[var(--line)]">
        <div className="pb-wrap pb-section">
          <div className="pb-section-head">
            <SectionLabel>How it works</SectionLabel>
            <h2 className="pb-h2">From idea to funded in four steps.</h2>
            <p className="pb-body">
              The whole process is a conversation. No forms to fill out for weeks, no
              committees to wait on.
            </p>
          </div>

          <ol className="pb-section-body grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-14">
            {steps.map((step) => (
              <li key={step.n}>
                <span className="text-sm font-medium tabular-nums text-[var(--brand)]">
                  {step.n}
                </span>
                <h3 className="mt-3 text-base font-semibold text-[var(--foreground)]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#55535f]">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Why PiggyBag */}
      <section className="border-b border-[var(--line)]">
        <div className="pb-wrap pb-section">
          <div className="pb-section-head">
            <SectionLabel>Why PiggyBag</SectionLabel>
            <h2 className="pb-h2">Capital that moves at the speed of building.</h2>
          </div>

          <dl className="pb-section-body grid gap-10 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-12">
            {features.map((feature) => (
              <div key={feature.title}>
                <dt className="text-base font-semibold text-[var(--foreground)]">
                  {feature.title}
                </dt>
                <dd className="mt-3 text-sm leading-relaxed text-[#55535f]">
                  {feature.body}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* What we fund */}
      <section id="what-we-fund" className="scroll-mt-20 border-b border-[var(--line)]">
        <div className="pb-wrap pb-section">
          <div className="grid gap-14 md:grid-cols-2 md:gap-20">
            <div className="pb-section-head max-w-md">
              <SectionLabel>What we fund</SectionLabel>
              <h2 className="pb-h2">Built for the earliest stage.</h2>
              <p className="pb-body">
                We back people at the moment it&apos;s hardest to get money — before the
                traction, before the round, when all you have is code and conviction.
              </p>
            </div>

            <ul className="space-y-5 text-sm leading-relaxed text-[#55535f]">
              {fundList.map((item) => (
                <li key={item} className="flex gap-4">
                  <span className="mt-2.5 h-1 w-1 flex-none rounded-full bg-[var(--brand)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Apply */}
      <section id="apply" className="scroll-mt-20 border-b border-[var(--line)]">
        <div className="pb-wrap pb-section">
          <div className="pb-section-head">
            <SectionLabel>Apply</SectionLabel>
            <h2 className="pb-h2">Ready to get funded?</h2>
            <p className="pb-body">
              Connect your wallet to start your application. The agent will take it from
              there.
            </p>
          </div>

          <div className="pb-section-body max-w-[560px] space-y-8">
            <div className="flex flex-wrap items-center gap-5">
              <ConnectWallet />
              <span className="text-sm text-[#8a8794]">Monad testnet required</span>
            </div>
            <FundingAgent />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-[var(--line)]">
        <div className="pb-wrap pb-section">
          <div className="pb-section-head">
            <h2 className="pb-h2">Stop pitching. Start building.</h2>
            <p className="pb-body">
              PiggyBag is the simplest path from idea to funded product. Your on-chain
              history is your application.
            </p>
            <Link href="#apply" className="pb-btn pb-btn-primary inline-flex">
              Apply for funding
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="pb-wrap flex flex-col gap-3 py-14 sm:flex-row sm:items-center sm:justify-between">
          <Logo linked={false} size={24} />
          <p className="text-sm text-[#8a8794]">
            An AI agent that funds early-stage builders on Monad testnet.
          </p>
        </div>
      </footer>
    </div>
  );
}
