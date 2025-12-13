'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import WalletButton from './components/WalletButton';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Dither = dynamic(() => import('./components/Dither'), { ssr: false });

export default function Home() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Dithered Waves Background - Full Screen */}
      <div className="fixed inset-0 z-0">
        <Dither
          waveSpeed={0.05}
          waveFrequency={0.6}
          waveAmplitude={0.2}
          waveColor={[0.8, 0.4, 1.0]}
          colorNum={4}
          pixelSize={2}
          disableAnimation={false}
          enableMouseInteraction={true}
          mouseRadius={0.3}
        />
      </div>

      {/* Navigation - Logo Only */}
      <nav className="relative z-10 w-full px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-white/10 backdrop-blur-sm border-2 border-white/20 shadow-lg">
              <Image 
                src="/monoken-logo.png" 
                alt="Monoken Logo" 
                width={80} 
                height={80}
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold text-white tracking-tight pointer-events-none drop-shadow-lg">Monoken</h1>
              <p className="text-sm text-purple-200/80 pointer-events-none">Powered by Monad</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Centered */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-150px)] px-4 pointer-events-none">
        <div className="text-center space-y-8 max-w-5xl">
          <div className="inline-block px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-4">
            <p className="text-sm text-white/90 font-medium">🎉 The Future of Event Experiences</p>
          </div>
          
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white drop-shadow-2xl leading-tight">
            Events Reimagined with
            <br />
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              Blockchain Technology
            </span>
          </h2>
          
          <p className="text-lg md:text-xl lg:text-2xl text-white/85 max-w-3xl mx-auto leading-relaxed font-light">
            A comprehensive event ecosystem on Monad. Beyond ticketing- claim NFT rewards, verify authentic merchandise, and trade tickets in a fair, regulated marketplace.
          </p>
          
          {/* Action Buttons */}
          <div className="pt-8 pointer-events-auto flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => router.push('/events')}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-semibold text-lg transition transform hover:scale-105 shadow-lg"
            >
              🎫 Browse Events
            </button>
            <WalletButton />
          </div>
        </div>
      </div>
    </main>
  );
}
