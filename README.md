# MonoKen - Event Ticketing on Monad Testnet

Decentralized event ticketing platform with NFT tickets on Monad blockchain.

## 🚀 Quick Start (From Scratch)

### 1. Clone & Install
```bash
git clone <your-repo>
cd monoken-dev
bun install  # or npm install
```

### 2. Configure Environment
Create `.env` file:
```env
PRIVATE_KEY=your_wallet_private_key_here
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
```

### 3. Get Monad Testnet MON
- Add Monad Testnet to MetaMask:
  - Network: Monad Testnet
  - RPC: https://testnet-rpc.monad.xyz
  - Chain ID: 41454
  - Currency: MON
- Get testnet MON from [Monad Faucet](https://testnet-faucet.monad.xyz)

### 4. Compile & Deploy Contract
```bash
bun run compile
bun run deploy
```
**Save the deployed contract address!**

### 5. Update Contract Address
Edit `app/config/contract.ts`:
```typescript
export const CONTRACT_ADDRESS = "0xYOUR_DEPLOYED_ADDRESS";
```

### 6. Run Application
```bash
bun run dev
```
Visit: http://localhost:3000

---

## 📋 How to Use

### **Admin** (at `/admin`)
- Connect wallet (must be deployer)
- Create events: name, date, location, price, max tickets
- View all events

### **Users** (at `/events`)
- Connect wallet
- Browse events
- Purchase tickets (minted as NFTs)

---

## 🏗️ Project Structure

```
contracts/EventTicketing.sol    # Main smart contract
app/admin/page.tsx              # Admin dashboard
app/events/page.tsx             # Public events page
app/config/contract.ts          # Contract ABI & address
hardhat.config.ts               # Hardhat config for Monad
```

---

## 🧪 Testing

```bash
bun run test
```

---

## 📝 Key Features

✅ Admin event creation  
✅ NFT-based tickets  
✅ Wallet authentication (owner-only admin)  
✅ Event browsing & ticket purchase  
✅ Deployed on Monad testnet  

---

## 🛠️ Tech Stack

- **Contracts**: Solidity, Hardhat
- **Frontend**: Next.js 14, TypeScript, Tailwind
- **Web3**: wagmi, viem, RainbowKit
- **Chain**: Monad Testnet

---

## 🔧 Available Commands

```bash
bun run compile    # Compile smart contracts
bun run deploy     # Deploy to Monad testnet
bun run test       # Run contract tests
bun run dev        # Start development server
```

---

## 📜 License
MIT
