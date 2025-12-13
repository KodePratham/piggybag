'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt, useSwitchChain, useChainId } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { CONTRACT_ADDRESS, ADMIN_ADDRESS, EVENT_TICKETING_ABI } from '../config/contract';
import { monadTestnet } from '../config/wagmi';
import WalletButton from '../components/WalletButton';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    date: '',
    ticketPrice: '',
    totalTickets: '',
  });

  // Check if user is admin
  const isAdmin = address && ADMIN_ADDRESS && address.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
  const isCorrectNetwork = chainId === monadTestnet.id;

  // Get contract balance
  const { data: contractBalance } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: EVENT_TICKETING_ABI,
    functionName: 'getContractBalance',
  });

  useEffect(() => {
    if (isSuccess) {
      alert('Event created successfully!');
      setFormData({
        name: '',
        description: '',
        location: '',
        date: '',
        ticketPrice: '',
        totalTickets: '',
      });
    }
  }, [isSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      alert('Please connect your wallet');
      return;
    }

    if (!isAdmin) {
      alert('Only admin can create events');
      return;
    }

    if (!isCorrectNetwork) {
      alert('Please switch to Monad Testnet');
      try {
        await switchChain({ chainId: monadTestnet.id });
      } catch (error) {
        console.error('Failed to switch network:', error);
      }
      return;
    }

    try {
      const dateTimestamp = Math.floor(new Date(formData.date).getTime() / 1000);
      
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: EVENT_TICKETING_ABI,
        functionName: 'createEvent',
        args: [
          formData.name,
          formData.description,
          formData.location,
          BigInt(dateTimestamp),
          parseEther(formData.ticketPrice),
          BigInt(formData.totalTickets),
        ],
      });
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event. Check console for details.');
    }
  };

  const handleWithdraw = async () => {
    if (!isAdmin) {
      alert('Only admin can withdraw funds');
      return;
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: EVENT_TICKETING_ABI,
        functionName: 'withdrawFunds',
      });
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      alert('Error withdrawing funds. Check console for details.');
    }
  };

  if (!CONTRACT_ADDRESS) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg border border-white/20">
          <h1 className="text-2xl font-bold text-white mb-4">⚠️ Contract Not Deployed</h1>
          <p className="text-white/80">Please deploy the contract first and add the address to .env</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg border border-white/20 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Connect Wallet</h1>
          <p className="text-white/80 mb-6">Please connect your wallet to access admin panel</p>
          <WalletButton />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg border border-white/20 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">🚫 Access Denied</h1>
          <p className="text-white/80 mb-4">Only admin can access this page</p>
          <p className="text-sm text-white/60 mb-6">Your address: {address}</p>
          <button
            onClick={() => router.push('/events')}
            className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition"
          >
            Go to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800">
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">🎫 Admin Panel</h1>
            <div className="flex gap-4 items-center">
              <button
                onClick={() => router.push('/events')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition"
              >
                View Events
              </button>
              <WalletButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Contract Balance */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Contract Balance</h2>
          <p className="text-3xl font-bold text-white">
            {contractBalance ? formatEther(contractBalance as bigint) : '0'} MON
          </p>
          <button
            onClick={handleWithdraw}
            disabled={isPending || !contractBalance || contractBalance === BigInt(0)}
            className="mt-4 px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition"
          >
            {isPending ? 'Withdrawing...' : 'Withdraw Funds'}
          </button>
        </div>

        {/* Create Event Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6">
          <h2 className="text-2xl font-semibold text-white mb-6">Create New Event</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white mb-2">Event Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Summer Music Festival 2025"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Event description..."
                rows={4}
              />
            </div>

            <div>
              <label className="block text-white mb-2">Location *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Madison Square Garden, New York"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Event Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2">Ticket Price (MON) *</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  required
                  value={formData.ticketPrice}
                  onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.1"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Total Tickets *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.totalTickets}
                  onChange={(e) => setFormData({ ...formData, totalTickets: e.target.value })}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || isConfirming}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition transform hover:scale-105"
            >
              {isPending ? 'Creating...' : isConfirming ? 'Confirming...' : 'Create Event'}
            </button>
          </form>

          {hash && (
            <div className="mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
              <p className="text-white text-sm">
                Transaction Hash: <span className="font-mono break-all">{hash}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
