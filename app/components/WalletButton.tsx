'use client';

import React, { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import WalletModal from './WalletModal';

export default function WalletButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="bg-white/90 backdrop-blur-sm border-2 border-white/50 px-6 py-3 rounded-full shadow-lg">
          <span className="text-purple-600 font-semibold text-lg">{formatAddress(address)}</span>
        </div>
        <button
          onClick={() => disconnect()}
          className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-all shadow-lg"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-white text-purple-600 px-12 py-4 rounded-full text-lg font-bold hover:bg-purple-50 transition-all shadow-2xl hover:scale-105"
      >
        Connect Wallet
      </button>
      <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
