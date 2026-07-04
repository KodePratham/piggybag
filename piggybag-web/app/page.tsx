import Image from "next/image";
import Link from "next/link";
import { AddBlitzToWallet } from "@/components/AddBlitzToWallet";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="pb-label">{children}</p>;
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <section>
        <div className="pb-wrap pb-section-hero">
          <div className="pb-hero-stack">
            <SectionLabel>An AI agent that funds builders on Monad</SectionLabel>

            <h1 className="pb-display">
              Your first check, written by an <span className="pb-accent">agent</span>.
            </h1>

            <p className="pb-lead">
              PiggyBag replaces gatekeepers with an autonomous agent that reads your
              on-chain track record and funds early-stage products — in minutes, not
              months.
            </p>

            <div className="pb-hero-actions flex flex-wrap items-center">
              <Link href="/apply" className="pb-btn pb-btn-primary">
                Apply for funding
              </Link>
            </div>

            <p className="text-sm text-[#8a8794]">
              Live on Monad testnet · No pitch deck required
            </p>
          </div>
        </div>
      </section>

      <section id="claim-blitz" className="border-t border-[var(--line)]">
        <div className="pb-wrap pb-section">
          <div className="flex flex-col items-center gap-5 text-center">
            <Image
              src="/blitzcoin.png"
              alt="$BLITZ"
              width={56}
              height={56}
              className="rounded-full"
            />
            <div>
              <SectionLabel>Monad Blitz</SectionLabel>
              <h2 className="pb-h2 mt-1">Claim your $BLITZ</h2>
              <p className="pb-body mt-2">
                Built for Monad Blitz? Submit your hackathon project and receive
                10,000 $BLITZ memecoins instantly.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Link href="/monad-blitz" className="pb-btn pb-btn-primary">
                Claim 10,000 $BLITZ
              </Link>
              <AddBlitzToWallet />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
