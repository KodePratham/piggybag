'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, useChainId } from 'wagmi';
import { formatEther, parseEther, createPublicClient, http } from 'viem';
import { CONTRACT_ADDRESS, ADMIN_ADDRESS, EVENT_TICKETING_ABI } from '../config/contract';
import { monadTestnet } from '../config/wagmi';
import WalletButton from '../components/WalletButton';
import { useRouter } from 'next/navigation';

interface Event {
  id: string | bigint;
  name: string;
  description: string;
  location: string;
  date: string | bigint;
  ticketPrice: string | bigint;
  totalTickets: string | bigint;
  ticketsSold: string | bigint;
  isActive: boolean;
}

export default function EventsPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [userTickets, setUserTickets] = useState<bigint[]>([]);
  const [eventIds, setEventIds] = useState<bigint[]>([]);
  const [loading, setLoading] = useState(true);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const isAdmin = address && ADMIN_ADDRESS && address.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
  const isCorrectNetwork = chainId === monadTestnet.id;

  // Fetch event IDs directly using public client
  useEffect(() => {
    const fetchEventIds = async () => {
      try {
        const client = createPublicClient({
          chain: monadTestnet,
          transport: http(),
        });

        const ids = await client.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: EVENT_TICKETING_ABI,
          functionName: 'getAllEvents',
        }) as bigint[];

        console.log("Fetched event IDs:", ids);
        setEventIds(ids);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching event IDs:", error);
        setLoading(false);
      }
    };

    fetchEventIds();
  }, []);

  // Get user tickets
  const { data: userTicketIds, refetch: refetchUserTickets } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: EVENT_TICKETING_ABI,
    functionName: 'getUserTickets',
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    if (userTicketIds) {
      setUserTickets(userTicketIds as bigint[]);
    }
  }, [userTicketIds]);

  useEffect(() => {
    const fetchEvents = async () => {
      console.log("Event IDs:", eventIds);
      
      if (!eventIds || eventIds.length === 0) {
        console.log("No event IDs found");
        setEvents([]);
        return;
      }

      const eventPromises = eventIds.map(async (eventId) => {
        try {
          console.log(`Fetching event ${eventId}...`);
          const result = await fetch('/api/getEvent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId: eventId.toString() }),
          });
          
          if (!result.ok) {
            console.error(`API error for event ${eventId}:`, result.status);
            return null;
          }
          
          const eventData = await result.json();
          console.log(`Event ${eventId} data:`, eventData);
          
          if (eventData.error) {
            console.error(`Event ${eventId} error:`, eventData.error);
            return null;
          }
          
          return eventData;
        } catch (error) {
          console.error(`Error fetching event ${eventId}:`, error);
          return null;
        }
      });

      const fetchedEvents = await Promise.all(eventPromises);
      const validEvents = fetchedEvents.filter((e): e is Event => e !== null && e.id);
      console.log("Valid events:", validEvents);
      setEvents(validEvents);
    };

    fetchEvents();
  }, [eventIds]);

  useEffect(() => {
    if (isSuccess) {
      alert('Ticket purchased successfully!');
      // Refetch event IDs
      window.location.reload();
    }
  }, [isSuccess]);

  const handlePurchaseTicket = async (eventId: bigint, ticketPrice: bigint) => {
    if (!isConnected) {
      alert('Please connect your wallet');
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
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: EVENT_TICKETING_ABI,
        functionName: 'purchaseTicket',
        args: [eventId],
        value: ticketPrice,
      });
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      alert('Error purchasing ticket. Check console for details.');
    }
  };

  const handleToggleStatus = async (eventId: bigint) => {
    if (!isAdmin) {
      alert('Only admin can toggle event status');
      return;
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: EVENT_TICKETING_ABI,
        functionName: 'toggleEventStatus',
        args: [eventId],
      });
    } catch (error) {
      console.error('Error toggling event status:', error);
      alert('Error toggling event status. Check console for details.');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800">
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">🎉 Events</h1>
              {isAdmin && (
                <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-full text-yellow-300 text-sm">
                  Admin
                </span>
              )}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition"
              >
                Home
              </button>
              {isAdmin && (
                <button
                  onClick={() => router.push('/admin')}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition"
                >
                  Admin Panel
                </button>
              )}
              <WalletButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Wrong Network Warning */}
      {isConnected && !isCorrectNetwork && (
        <div className="bg-yellow-500/20 border-b border-yellow-500/50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="text-yellow-300 font-semibold">Wrong Network</p>
                  <p className="text-yellow-200/80 text-sm">Please switch to Monad Testnet to purchase tickets</p>
                </div>
              </div>
              <button
                onClick={() => switchChain({ chainId: monadTestnet.id })}
                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg text-black font-semibold transition"
              >
                Switch to Monad Testnet
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* User Tickets Section */}
        {isConnected && userTickets.length > 0 && (
          <div className="mb-8 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">🎫 My Tickets ({userTickets.length})</h2>
            <p className="text-white/80">You own {userTickets.length} ticket(s)</p>
          </div>
        )}

        {/* Events Grid */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-6">Available Events</h2>
          
          {events.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-12 text-center">
              <p className="text-white/80 text-lg">No events available yet</p>
              {isAdmin && (
                <button
                  onClick={() => router.push('/admin')}
                  className="mt-4 px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition"
                >
                  Create First Event
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event.id.toString()}
                  className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6 hover:bg-white/15 transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white">{event.name}</h3>
                    {event.isActive ? (
                      <span className="px-2 py-1 bg-green-500/20 border border-green-500/50 rounded text-green-300 text-xs">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-xs">
                        Inactive
                      </span>
                    )}
                  </div>
                  
                  <p className="text-white/70 text-sm mb-4 line-clamp-3">{event.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-white/80 text-sm">
                      <span className="mr-2">📍</span>
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-white/80 text-sm">
                      <span className="mr-2">📅</span>
                      <span>{new Date(Number(event.date) * 1000).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center text-white/80 text-sm">
                      <span className="mr-2">💰</span>
                      <span>{formatEther(BigInt(event.ticketPrice))} MON</span>
                    </div>
                    <div className="flex items-center text-white/80 text-sm">
                      <span className="mr-2">🎫</span>
                      <span>{event.ticketsSold.toString()} / {event.totalTickets.toString()} sold</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => handlePurchaseTicket(BigInt(event.id), BigInt(event.ticketPrice))}
                      disabled={
                        !isConnected ||
                        !event.isActive ||
                        BigInt(event.ticketsSold) >= BigInt(event.totalTickets) ||
                        isPending ||
                        isConfirming
                      }
                      className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition"
                    >
                      {!isConnected
                        ? 'Connect Wallet'
                        : !event.isActive
                        ? 'Event Inactive'
                        : event.ticketsSold >= event.totalTickets
                        ? 'Sold Out'
                        : isPending || isConfirming
                        ? 'Processing...'
                        : 'Buy Ticket'}
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => handleToggleStatus(BigInt(event.id))}
                        className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition"
                      >
                        {event.isActive ? 'Deactivate' : 'Activate'} Event
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {hash && (
          <div className="mt-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
            <p className="text-white text-sm">
              Transaction Hash: <span className="font-mono break-all">{hash}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
