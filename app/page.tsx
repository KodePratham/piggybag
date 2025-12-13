import React from 'react';
import WalletButton from './components/WalletButton';

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        {/* Hero Section */}
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-[#6e54ff]">
          Monoken
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
          The next generation of decentralized token management.
        </p>
        
        {/* CTA */}
        <div className="pt-8">
          <WalletButton />
        </div>
      </div>
    </main>
  );
}
