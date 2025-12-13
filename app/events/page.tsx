'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, useChainId } from 'wagmi';
import { formatEther, parseEther, createPublicClient, http } from 'viem';
import { CONTRACT_ADDRESS, ADMIN_ADDRESS, EVENT_TICKETING_ABI } from '../config/contract';
import { monadTestnet } from '../config/wagmi';
import WalletButton from '../components/WalletButton';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';

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

  const downloadTicket = useCallback((ticketId: string) => {
    const node = document.getElementById(`ticket-card-${ticketId}`);
    if (!node) return;

    toPng(node, { cacheBust: true, backgroundColor: '#ffffff' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `monoken-ticket-${ticketId}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Error generating ticket image:', err);
      });
  }, []);

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

  // Get user tickets - fetch directly instead of using useReadContract
  useEffect(() => {
    const fetchUserTickets = async () => {
      if (!address || !isConnected) {
        setUserTickets([]);
        return;
      }

      try {
        const client = createPublicClient({
          chain: monadTestnet,
          transport: http(),
        });

        const tickets = await client.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: EVENT_TICKETING_ABI,
          functionName: 'getUserTickets',
          args: [address],
        }) as bigint[];

        console.log("User ticket IDs (direct fetch):", tickets);
        setUserTickets(tickets || []);
      } catch (error) {
        console.error("Error fetching user tickets:", error);
        setUserTickets([]);
      }
    };

    fetchUserTickets();
  }, [address, isConnected]);

  // Fetch user ticket details
  const [ticketDetails, setTicketDetails] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (!userTickets || userTickets.length === 0) {
        setTicketDetails([]);
        return;
      }

      const client = createPublicClient({
        chain: monadTestnet,
        transport: http(),
      });

      const detailsPromises = userTickets.map(async (ticketId) => {
        try {
          const ticket = await client.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: EVENT_TICKETING_ABI,
            functionName: 'getTicket',
            args: [ticketId],
          }) as any;

          // Get event details for this ticket
          const event = await client.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: EVENT_TICKETING_ABI,
            functionName: 'getEvent',
            args: [ticket[1]], // eventId
          }) as any;

          return {
            ticketId,
            eventId: ticket[1],
            eventName: event[1],
            eventLocation: event[3],
            eventDate: event[4],
            isUsed: ticket[2],
          };
        } catch (error) {
          console.error(`Error fetching ticket ${ticketId}:`, error);
          return null;
        }
      });

      const details = await Promise.all(detailsPromises);
      setTicketDetails(details.filter(d => d !== null));
    };

    fetchTicketDetails();
  }, [userTickets]);

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
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition"
              >
                Home
              </button>
              {isAdmin && (
                <button
                  onClick={() => router.push('/admin')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition"
                >
                  Admin Panel
                </button>
              )}
              <WalletButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* User Tickets Section */}
        {isConnected && userTickets.length > 0 && (
          <div className="mb-8 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">🎫 My Tickets ({userTickets.length})</h2>
            
            {ticketDetails.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ticketDetails.map((ticket) => {
                  // Generate unique QR code data for each ticket
                  const qrData = JSON.stringify({
                    ticketId: ticket.ticketId.toString(),
                    eventId: ticket.eventId.toString(),
                    eventName: ticket.eventName,
                    contract: CONTRACT_ADDRESS,
                    timestamp: Date.now(),
                  });

                  const avatarUrl = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${ticket.ticketId.toString()}`;
                  
                  return (
                    <div
                      key={ticket.ticketId.toString()}
                      className="bg-white rounded-xl shadow-xl overflow-hidden transform transition hover:scale-[1.02]"
                    >
                      {/* Capture Area */}
                      <div id={`ticket-card-${ticket.ticketId.toString()}`} className="p-6 bg-white relative">
                        {/* Decorative top bar */}
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                        
                        {/* Avatar Header */}
                        <div className="flex items-center gap-4 mb-6 mt-2">
                          <div className="relative">
                            <div className="absolute inset-0 bg-purple-200 rounded-lg blur-sm transform rotate-3"></div>
                            <img 
                              src={avatarUrl} 
                              alt="Ticket Avatar" 
                              className="relative w-16 h-16 rounded-lg bg-gray-100 border-2 border-white shadow-sm"
                            />
                          </div>
                          <div>
                            <p className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-1">Web3 Ticket</p>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-1">{ticket.eventName}</h3>
                          </div>
                        </div>

                        {/* QR Code */}
                        <div className="flex justify-center mb-6 bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-200">
                          <QRCodeSVG 
                            value={qrData} 
                            size={180}
                            level="H"
                            includeMargin={true}
                            fgColor="#000000"
                            bgColor="#ffffff"
                          />
                        </div>
                        
                        {/* Ticket Info */}
                        <div className="space-y-3">
                          <div className="flex items-center text-gray-600 text-sm bg-gray-50 p-2 rounded-lg">
                            <span className="w-8 text-center text-lg">📍</span>
                            <span className="font-medium">{ticket.eventLocation}</span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm bg-gray-50 p-2 rounded-lg">
                            <span className="w-8 text-center text-lg">📅</span>
                            <span className="font-medium">
                              {new Date(Number(ticket.eventDate) * 1000).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 uppercase font-bold">Ticket ID</span>
                              <span className="text-sm font-mono text-gray-600">#{ticket.ticketId.toString()}</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] text-gray-400 uppercase font-bold">Event ID</span>
                              <span className="text-sm font-mono text-gray-600">#{ticket.eventId.toString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                        <button 
                          onClick={() => downloadTicket(ticket.ticketId.toString())}
                          className="w-full flex justify-center items-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg text-sm font-bold transition shadow-md hover:shadow-lg transform active:scale-95"
                        >
                          <span>📸</span> Download for Story
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-white/80">Loading ticket details...</p>
            )}
          </div>
        )}

        {/* Debug: Show if connected but no tickets */}
        {isConnected && userTickets.length === 0 && (
          <div className="mb-8 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6">
            <p className="text-white/80">You don't have any tickets yet. Purchase one below!</p>
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
                  className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition"
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
                      className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition"
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
                        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition"
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
    </div>
  );
}
