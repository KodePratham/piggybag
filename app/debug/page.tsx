'use client';

import { useEffect, useState } from 'react';
import { createPublicClient, http } from 'viem';
import { monadTestnet } from '../config/wagmi';
import { CONTRACT_ADDRESS, EVENT_TICKETING_ABI } from '../config/contract';

export default function DebugPage() {
  const [debug, setDebug] = useState<any>({});

  useEffect(() => {
    const testContract = async () => {
      const client = createPublicClient({
        chain: monadTestnet,
        transport: http(),
      });

      try {
        // Test 1: Get all events
        const eventIds = await client.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: EVENT_TICKETING_ABI,
          functionName: 'getAllEvents',
        });

        setDebug((prev: any) => ({ ...prev, eventIds, eventIdsSuccess: true }));

        // Test 2: Get event details
        if (eventIds && (eventIds as bigint[]).length > 0) {
          const eventData = await client.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: EVENT_TICKETING_ABI,
            functionName: 'getEvent',
            args: [(eventIds as bigint[])[0]],
          });

          setDebug((prev: any) => ({ ...prev, eventData, eventDataSuccess: true }));
        }
      } catch (error: any) {
        setDebug((prev: any) => ({ ...prev, error: error.message }));
      }
    };

    testContract();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">🔍 Debug Page</h1>
        
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Contract Info</h2>
          <div className="space-y-2 text-white/80 font-mono text-sm">
            <p><strong>Contract Address:</strong> {CONTRACT_ADDRESS}</p>
            <p><strong>Chain:</strong> {monadTestnet.name} (ID: {monadTestnet.id})</p>
            <p><strong>RPC:</strong> {monadTestnet.rpcUrls.default.http[0]}</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6 mt-6">
          <h2 className="text-xl font-bold text-white mb-4">Test Results</h2>
          <pre className="text-white/80 font-mono text-xs overflow-auto bg-black/20 p-4 rounded">
            {JSON.stringify(debug, (key, value) =>
              typeof value === 'bigint' ? value.toString() : value
            , 2)}
          </pre>
        </div>

        <div className="mt-6 flex gap-4">
          <a href="/events" className="px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition">
            Go to Events
          </a>
          <a href="/admin" className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition">
            Go to Admin
          </a>
        </div>
      </div>
    </div>
  );
}
