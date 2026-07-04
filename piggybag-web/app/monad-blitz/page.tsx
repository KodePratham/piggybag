import Image from "next/image";
import { ConnectWallet } from "@/components/ConnectWallet";
import { BlitzApplyForm } from "@/components/BlitzApplyForm";
import { AddBlitzToWallet } from "@/components/AddBlitzToWallet";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="pb-label">{children}</p>;
}

export default function MonadBlitzPage() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="border-b border-[var(--line)]">
        <div className="pb-wrap pb-section-hero">
          <div className="pb-hero-stack">
            <div className="flex items-center justify-center gap-4">
              <Image
                src="/blitzcoin.png"
                alt="$BLITZ"
                width={48}
                height={48}
                className="rounded-full"
                priority
              />
              <SectionLabel>Monad Blitz rewards</SectionLabel>
            </div>

            <h1 className="pb-display">
              Apply with your Monad Blitz project to get{" "}
              <span className="pb-accent">exciting rewards</span>.
            </h1>

            <p className="pb-lead">
              Built something for Monad Blitz? Submit your project — one per wallet — and
              receive 10,000 $BLITZ memecoins instantly. The PiggyBag agent will share a
              compliment on your build.
            </p>

            <p className="text-sm text-[#8a8794]">
              Monad testnet required · One project per wallet · 10,000 $BLITZ per submission
            </p>

            <AddBlitzToWallet />
          </div>
        </div>
      </section>

      <section>
        <div className="pb-wrap pb-section">
          <div className="pb-section-head">
            <SectionLabel>Submit project</SectionLabel>
            <h2 className="pb-h2">Claim your $BLITZ</h2>
            <p className="pb-body">
              Connect your wallet, share your GitHub repo and project details. The agent
              will compliment your project and tokens land in your wallet on submit.
            </p>
          </div>

          <div className="pb-section-body w-full max-w-[480px] space-y-6">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <ConnectWallet />
              <span className="text-sm text-[#8a8794]">Monad testnet required</span>
            </div>
            <BlitzApplyForm />
          </div>
        </div>
      </section>
    </div>
  );
}
