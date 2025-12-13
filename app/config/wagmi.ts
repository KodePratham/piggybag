import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, metaMask, coinbaseWallet } from 'wagmi/connectors'

// Monad Testnet Chain Configuration
export const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
    public: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://explorer.testnet.monad.xyz' },
  },
  testnet: true,
} as const

export const config = createConfig({
  chains: [monadTestnet, sepolia, mainnet],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({ appName: 'Monoken' }),
  ],
  transports: {
    [monadTestnet.id]: http(),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
})

