import { ConnectWallet } from "@/components/ConnectWallet";
import { CreditScore } from "@/components/CreditScore";
import { FundMe } from "@/components/FundMe";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-black">
      <h1 className="text-5xl font-light tracking-tight">piggybag</h1>
      <div className="mt-10 flex flex-col items-center">
        <ConnectWallet />
        <CreditScore />
        <FundMe />
      </div>
    </main>
  );
}
