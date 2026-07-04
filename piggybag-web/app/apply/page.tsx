import { ConnectWallet } from "@/components/ConnectWallet";
import { FundingAgent } from "@/components/FundingAgent";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="pb-label">{children}</p>;
}

export default function ApplyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="border-b border-[var(--line)]">
        <div className="pb-wrap pb-section-hero">
          <div className="pb-hero-stack">
            <SectionLabel>Apply for funding</SectionLabel>

            <h1 className="pb-display">
              Tell us what you&apos;re building. Get funded in{" "}
              <span className="pb-accent">minutes</span>.
            </h1>

            <p className="pb-lead">
              Connect your wallet, share your GitHub and project details. The PiggyBag
              agent will ask a few follow-up questions and send MON if approved.
            </p>

            <p className="text-sm text-[#8a8794]">
              Monad testnet required · 1–5 MON per approved project
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="pb-wrap pb-section">
          <div className="pb-section-head">
            <SectionLabel>Start your application</SectionLabel>
            <h2 className="pb-h2">Ready to get funded?</h2>
            <p className="pb-body">
              Connect your wallet to start. The agent takes it from there.
            </p>
          </div>

          <div className="pb-section-body w-full max-w-[480px] space-y-6">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <ConnectWallet />
              <span className="text-sm text-[#8a8794]">Monad testnet required</span>
            </div>
            <FundingAgent />
          </div>
        </div>
      </section>
    </div>
  );
}
