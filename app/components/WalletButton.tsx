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
        <div className="bg-purple-50 border-2 border-[#6e54ff] px-4 py-2 rounded-full">
          <span className="text-[#6e54ff] font-semibold">{formatAddress(address)}</span>
        </div>
        <button
          onClick={() => disconnect()}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full font-semibold hover:bg-gray-300 transition-all"
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
        className="bg-[#6e54ff] text-white px-8 py-4 rounded-full text-lg font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
      >
        Connect Wallet
      </button>
      <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
