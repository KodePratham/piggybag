import { ConnectWallet } from "@/components/ConnectWallet";
import { FundingAgent } from "@/components/FundingAgent";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-black">
      <h1 className="text-5xl font-light tracking-tight">piggybag</h1>
      <p className="mt-3 max-w-sm text-center text-sm text-black/60">
        An AI agent that funds early-stage builders on Monad testnet.
      </p>
      <div className="mt-10 flex flex-col items-center">
        <ConnectWallet />
        <FundingAgent />
      </div>
    </main>
  );
}
