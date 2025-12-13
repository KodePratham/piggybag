'use client';

import React from 'react';
import { useConnect } from 'wagmi';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connectors, connect, isPending } = useConnect();

  if (!isOpen) return null;

  const getWalletIcon = (name: string) => {
    if (name.toLowerCase().includes('metamask')) return '🦊';
    if (name.toLowerCase().includes('coinbase')) return '🔵';
    if (name.toLowerCase().includes('walletconnect')) return '🔗';
    return '👛';
  };

  const getWalletName = (name: string) => {
    if (name.toLowerCase().includes('metamask')) return 'MetaMask';
    if (name.toLowerCase().includes('coinbase')) return 'Coinbase Wallet';
    if (name.toLowerCase().includes('walletconnect')) return 'WalletConnect';
    if (name.toLowerCase().includes('injected')) return 'Browser Wallet';
    return name;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
        
        <h2 className="text-2xl font-bold text-[#6e54ff] mb-6">Connect Wallet</h2>
        
        <div className="space-y-3">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => {
                connect({ connector });
                onClose();
              }}
              disabled={isPending}
              className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-[#6e54ff] hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getWalletIcon(connector.name)}</span>
                <span className="font-semibold text-gray-800">
                  {getWalletName(connector.name)}
                </span>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-500 mt-6 text-center">
          By connecting your wallet, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
