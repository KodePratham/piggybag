import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { monadTestnet } from '@/app/config/wagmi';
import { CONTRACT_ADDRESS, EVENT_TICKETING_ABI } from '@/app/config/contract';

export async function POST(request: NextRequest) {
  try {
    const { eventId } = await request.json();
    
    console.log("API: Fetching event", eventId);
    console.log("API: Contract address", CONTRACT_ADDRESS);

    if (!CONTRACT_ADDRESS) {
      console.error("API: Contract not deployed");
      return NextResponse.json({ error: 'Contract not deployed' }, { status: 500 });
    }

    const client = createPublicClient({
      chain: monadTestnet,
      transport: http(),
    });

    const result = await client.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: EVENT_TICKETING_ABI,
      functionName: 'getEvent',
      args: [BigInt(eventId)],
    }) as any;
    
    console.log("API: Raw result", result);

    // Handle both array and object responses and convert BigInt to string
    const eventData = Array.isArray(result) ? {
      id: result[0].toString(),
      name: result[1],
      description: result[2],
      location: result[3],
      date: result[4].toString(),
      ticketPrice: result[5].toString(),
      totalTickets: result[6].toString(),
      ticketsSold: result[7].toString(),
      isActive: result[8],
    } : {
      id: result.id.toString(),
      name: result.name,
      description: result.description,
      location: result.location,
      date: result.date.toString(),
      ticketPrice: result.ticketPrice.toString(),
      totalTickets: result.totalTickets.toString(),
      ticketsSold: result.ticketsSold.toString(),
      isActive: result.isActive,
    };
    
    console.log("API: Formatted event data", eventData);

    return NextResponse.json(eventData);
  } catch (error) {
    console.error('API: Error fetching event:', error);
    return NextResponse.json({ error: 'Failed to fetch event', details: String(error) }, { status: 500 });
  }
}
