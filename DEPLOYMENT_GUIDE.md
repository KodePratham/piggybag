# 🎫 Monoken - Event Ticketing System on Monad

A decentralized event ticketing platform built on Monad Testnet with Hardhat and Next.js.

## 🌟 Features

- **Admin Panel** (`/admin`):
  - Create events with name, description, location, date, and ticket price
  - Set total number of tickets available
  - Toggle event active/inactive status
  - Withdraw contract balance
  - Only accessible to contract deployer (admin address)

- **Events Page** (`/events`):
  - Browse all available events
  - View event details (location, date, price, tickets sold)
  - Purchase tickets with MON tokens
  - View your owned tickets
  - Real-time ticket availability

- **Smart Contract Features**:
  - Secure ticket purchasing with automatic refunds
  - Event management (create, activate/deactivate)
  - Ticket ownership tracking
  - Admin-only functions for event creation and management

## 🚀 Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add:

```env
# Your Monad Testnet private key (get from MetaMask)
PRIVATE_KEY=your-private-key-here

# Monad Testnet RPC (default is fine)
MONAD_RPC_URL=https://testnet.monad.xyz

# Optional: Etherscan API key for contract verification
ETHERSCAN_API_KEY=your-api-key
```

### 3. Compile Smart Contract

```bash
bun run compile
```

### 4. Deploy to Monad Testnet

Make sure you have MON testnet tokens in your wallet first!

```bash
bun run deploy
```

After deployment, you'll see output like:
```
EventTicketing deployed to: 0x1234...
Admin address: 0xabcd...

📝 Add these to your .env.local file:
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234...
NEXT_PUBLIC_ADMIN_ADDRESS=0xabcd...
```

### 5. Update Environment Variables

Add the contract address and admin address to `.env.local`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234...
NEXT_PUBLIC_ADMIN_ADDRESS=0xabcd...
```

### 6. Run Development Server

```bash
bun run dev
```

Visit `http://localhost:3000`

## 📝 Smart Contract

### EventTicketing.sol

Main functions:
- `createEvent()` - Admin creates new event
- `purchaseTicket()` - Users buy tickets
- `toggleEventStatus()` - Admin activates/deactivates events
- `useTicket()` - Admin marks tickets as used
- `withdrawFunds()` - Admin withdraws contract balance
- `getAllEvents()` - Get all event IDs
- `getEvent()` - Get event details
- `getUserTickets()` - Get user's tickets

### Contract Verification (Optional)

After deployment, verify your contract:

```bash
npx hardhat verify --network monadTestnet YOUR_CONTRACT_ADDRESS
```

## 🔐 Admin Access

Only the wallet that deployed the contract can:
- Create events (`/admin`)
- Toggle event status
- Mark tickets as used
- Withdraw funds

## 🛠️ Tech Stack

- **Blockchain**: Monad Testnet
- **Smart Contracts**: Solidity 0.8.28
- **Development**: Hardhat
- **Frontend**: Next.js 14, React 18
- **Web3**: Wagmi, Viem
- **Styling**: TailwindCSS
- **3D Graphics**: Three.js, React Three Fiber

## 📱 Pages

- `/` - Home page with project info
- `/events` - Browse and purchase tickets
- `/admin` - Admin panel (restricted)

## 🧪 Testing

Run contract tests:

```bash
bun run test
```

## 📦 Project Structure

```
├── app/
│   ├── admin/           # Admin panel
│   ├── events/          # Events listing & ticket purchase
│   ├── api/             # API routes
│   ├── config/          # Contract ABI & wagmi config
│   └── components/      # React components
├── contracts/
│   └── EventTicketing.sol  # Main smart contract
├── scripts/
│   └── deploy.ts        # Deployment script
├── test/
│   └── EventTicketing.ts   # Contract tests
└── hardhat.config.ts    # Hardhat configuration
```

## 🌐 Monad Testnet

- Chain ID: `10143`
- RPC: `https://testnet.monad.xyz`
- Explorer: `https://explorer.testnet.monad.xyz`
- Currency: `MON`

### Get Testnet MON

Visit the Monad testnet faucet to get test tokens.

### Add Monad to MetaMask

1. Open MetaMask
2. Click "Add Network"
3. Enter:
   - Network Name: Monad Testnet
   - RPC URL: https://testnet.monad.xyz
   - Chain ID: 10143
   - Currency Symbol: MON
   - Block Explorer: https://explorer.testnet.monad.xyz

## 🔒 Security

- Admin functions protected by `onlyAdmin` modifier
- Ticket purchases validated for price and availability
- Automatic refund for overpayment
- Event date validation (must be future)

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

---

Built with ❤️ on Monad
