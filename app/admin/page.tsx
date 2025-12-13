'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt, useSwitchChain, useChainId } from 'wagmi';
import { parseEther, formatEther, createPublicClient, http } from 'viem';
import { CONTRACT_ADDRESS, ADMIN_ADDRESS, EVENT_TICKETING_ABI } from '../config/contract';
import { monadTestnet } from '../config/wagmi';
import WalletButton from '../components/WalletButton';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

interface TicketPurchase {
  ticketId: bigint;
  eventId: bigint;
  buyer: string;
  eventName: string;
  eventDate: bigint;
  purchasedAt: number;
}

interface Event {
  id: bigint;
  name: string;
  description: string;
  location: string;
  date: bigint;
  ticketPrice: bigint;
  totalTickets: bigint;
  ticketsSold: bigint;
  isActive: boolean;
}

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

  const [allTickets, setAllTickets] = useState<TicketPurchase[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketPurchase | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'tickets' | 'events'>('create');

  // Check if user is admin
  const isAdmin = address && ADMIN_ADDRESS && address.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
  const isCorrectNetwork = chainId === monadTestnet.id;

  // Get contract balance
  const { data: contractBalance } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: EVENT_TICKETING_ABI,
    functionName: 'getContractBalance',
  });

  // Fetch all events and tickets
  useEffect(() => {
    const fetchAllData = async () => {
      if (!isAdmin) return;

      try {
        const client = createPublicClient({
          chain: monadTestnet,
          transport: http(),
        });

        // Fetch all event IDs
        const eventIds = await client.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: EVENT_TICKETING_ABI,
          functionName: 'getAllEvents',
        }) as bigint[];

        // Fetch event details
        const eventPromises = eventIds.map(async (id) => {
          const eventData = await client.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: EVENT_TICKETING_ABI,
            functionName: 'getEvent',
            args: [id],
          }) as readonly [bigint, string, string, string, bigint, bigint, bigint, bigint, boolean];

          return {
            id,
            name: eventData[1],
            description: eventData[2],
            location: eventData[3],
            date: eventData[4],
            ticketPrice: eventData[5],
            totalTickets: eventData[6],
            ticketsSold: eventData[7],
            isActive: eventData[8],
          };
        });

        const fetchedEvents = await Promise.all(eventPromises);
        setEvents(fetchedEvents);

        // Fetch all tickets from all events
        const allTicketPromises: Promise<TicketPurchase | null>[] = [];
        
        for (const event of fetchedEvents) {
          if (event.ticketsSold > BigInt(0)) {
            // For each sold ticket, we need to find the owner
            // We'll iterate through ticket IDs (this is a simplified approach)
            const ticketCount = Number(event.ticketsSold);
            
            for (let i = 1; i <= ticketCount; i++) {
              allTicketPromises.push(
                (async () => {
                  try {
                    // Get ticket details - this is a simplified version
                    // In a real app, you'd have a better way to track ticket ownership
                    const ticketId = BigInt(i);
                    
                    return {
                      ticketId,
                      eventId: event.id,
                      buyer: 'Unknown', // Contract doesn't expose owner mapping
                      eventName: event.name,
                      eventDate: event.date,
                      purchasedAt: Date.now(),
                    };
                  } catch (error) {
                    return null;
                  }
                })()
              );
            }
          }
        }

        const tickets = (await Promise.all(allTicketPromises)).filter((t): t is TicketPurchase => t !== null);
        setAllTickets(tickets);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchAllData();
  }, [isAdmin, isSuccess]);

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
      <div className="min-h-screen w-full relative">
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "radial-gradient(125% 125% at 50% 10%, #1f2937 40%, #7c3aed 100%)",
          }}
        />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg border border-white/20">
            <h1 className="text-2xl font-bold text-white mb-4">⚠️ Contract Not Deployed</h1>
            <p className="text-white/80">Please deploy the contract first and add the address to .env</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen w-full relative">
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "radial-gradient(125% 125% at 50% 10%, #1f2937 40%, #7c3aed 100%)",
          }}
        />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg border border-white/20 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Connect Wallet</h1>
            <p className="text-white/80 mb-6">Please connect your wallet to access admin panel</p>
            <WalletButton />
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen w-full relative">
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "radial-gradient(125% 125% at 50% 10%, #1f2937 40%, #7c3aed 100%)",
          }}
        />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg border border-white/20 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">🚫 Access Denied</h1>
            <p className="text-white/80 mb-4">Only admin can access this page</p>
            <p className="text-sm text-white/60 mb-6">Your address: {address}</p>
            <button
              onClick={() => router.push('/events')}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition"
            >
              Go to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative">
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 10%, #1f2937 40%, #7c3aed 100%)",
        }}
      />
      <div className="relative z-10">
        <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">🎫 Admin Panel</h1>
            <div className="flex gap-4 items-center">
              <button
                onClick={() => router.push('/events')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition"
              >
                View Events
              </button>
              <WalletButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'create'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-600/50 text-white hover:bg-purple-600/70'
            }`}
          >
            ➕ Create Event
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'events'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-600/50 text-white hover:bg-purple-600/70'
            }`}
          >
            📊 Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'tickets'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-600/50 text-white hover:bg-purple-600/70'
            }`}
          >
            🎫 All Tickets ({allTickets.length})
          </button>
        </div>

        {/* Contract Balance */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Contract Balance</h2>
          <p className="text-3xl font-bold text-white">
            {contractBalance ? formatEther(contractBalance as bigint) : '0'} MON
          </p>
          <button
            onClick={handleWithdraw}
            disabled={isPending || !contractBalance || contractBalance === BigInt(0)}
            className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition"
          >
            {isPending ? 'Withdrawing...' : 'Withdraw Funds'}
          </button>
        </div>

        {/* Create Event Tab */}
        {activeTab === 'create' && (
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
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition"
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
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6">
            <h2 className="text-2xl font-semibold text-white mb-6">All Events</h2>
            
            {events.length === 0 ? (
              <p className="text-white/70">No events created yet.</p>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id.toString()}
                    className="bg-white/5 border border-white/20 rounded-lg p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">{event.name}</h3>
                        <p className="text-white/70 text-sm mt-1">{event.description}</p>
                      </div>
                      {event.isActive ? (
                        <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded text-green-300 text-sm">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm">
                          Inactive
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-white/50">Location</p>
                        <p className="text-white font-semibold">{event.location}</p>
                      </div>
                      <div>
                        <p className="text-white/50">Date</p>
                        <p className="text-white font-semibold">
                          {new Date(Number(event.date) * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/50">Price</p>
                        <p className="text-white font-semibold">{formatEther(event.ticketPrice)} MON</p>
                      </div>
                      <div>
                        <p className="text-white/50">Tickets</p>
                        <p className="text-white font-semibold">
                          {event.ticketsSold.toString()} / {event.totalTickets.toString()}
                        </p>
                      </div>
                    </div>
                    
                    {/* Revenue for this event */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-white/50 text-sm">Revenue Generated</p>
                      <p className="text-2xl font-bold text-green-400">
                        {formatEther(event.ticketPrice * event.ticketsSold)} MON
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">All Tickets Sold</h2>
              <p className="text-white/70">Total: {allTickets.length}</p>
            </div>
            
            {allTickets.length === 0 ? (
              <p className="text-white/70">No tickets sold yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allTickets.map((ticket) => {
                  const qrData = JSON.stringify({
                    ticketId: ticket.ticketId.toString(),
                    eventId: ticket.eventId.toString(),
                    buyer: ticket.buyer,
                    eventName: ticket.eventName,
                    contract: CONTRACT_ADDRESS,
                  });
                  
                  return (
                    <div
                      key={`${ticket.eventId}-${ticket.ticketId}`}
                      className="bg-white rounded-lg p-4 cursor-pointer hover:shadow-xl transition"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="flex justify-center mb-3 bg-white p-2 rounded">
                        <QRCodeSVG 
                          value={qrData} 
                          size={120}
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                      <div className="border-t border-gray-200 pt-3">
                        <p className="font-bold text-gray-800 text-sm mb-1">{ticket.eventName}</p>
                        <p className="text-xs text-gray-600">Ticket #{ticket.ticketId.toString()}</p>
                        <p className="text-xs text-gray-600">Event #{ticket.eventId.toString()}</p>
                        <p className="text-xs text-gray-500 mt-2 truncate" title={ticket.buyer}>
                          👤 {ticket.buyer.slice(0, 6)}...{ticket.buyer.slice(-4)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Ticket Detail Modal */}
            {selectedTicket && (
              <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setSelectedTicket(null)}
              >
                <div
                  className="bg-white rounded-lg p-8 max-w-md w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">Ticket Details</h3>
                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="flex justify-center mb-6">
                    <QRCodeSVG 
                      value={JSON.stringify({
                        ticketId: selectedTicket.ticketId.toString(),
                        eventId: selectedTicket.eventId.toString(),
                        buyer: selectedTicket.buyer,
                        eventName: selectedTicket.eventName,
                        contract: CONTRACT_ADDRESS,
                      })} 
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Event Name</p>
                      <p className="font-semibold text-gray-800">{selectedTicket.eventName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ticket ID</p>
                      <p className="font-semibold text-gray-800">#{selectedTicket.ticketId.toString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Event ID</p>
                      <p className="font-semibold text-gray-800">#{selectedTicket.eventId.toString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Buyer Address</p>
                      <p className="font-mono text-xs text-gray-800 break-all">{selectedTicket.buyer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Event Date</p>
                      <p className="font-semibold text-gray-800">
                        {new Date(Number(selectedTicket.eventDate) * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
