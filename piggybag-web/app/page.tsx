import { ConnectWallet } from "@/components/ConnectWallet";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black">
      <h1 className="text-5xl font-light tracking-tight">piggybag</h1>
      <div className="mt-10">
        <ConnectWallet />
      </div>
    </main>
  );
}
