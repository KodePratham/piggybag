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
- **Create Events**: Set name, date, location, price, and max tickets
- **View All Events**: See event details, revenue, and ticket sales
- **Manage Tickets**: View all sold tickets with QR codes and buyer information
- **Withdraw Funds**: Collect revenue from ticket sales

### **Users** (at `/events`)
- Connect wallet
- Browse available events
- Purchase tickets (minted as NFTs)
- **View Your Tickets**: Each ticket includes a unique QR code for verification
- Download or scan QR codes for event entry

---

## 🎫 QR Code Features

Every purchased ticket generates a **unique QR code** containing:
- Ticket ID
- Event ID
- Owner address
- Event name
- Contract address
- Timestamp

**Admin Benefits:**
- Track all ticket purchases
- View buyer information
- Scan QR codes for event entry verification
- Monitor ticket sales in real-time

**User Benefits:**
- Digital ticket with QR code
- Easy verification at events
- Permanent NFT ownership
- Beautiful ticket design with event details

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

✅ **Admin Dashboard**
  - Create and manage events
  - View all events with revenue tracking
  - Monitor all ticket sales and buyers
  - Withdraw collected funds
  
✅ **QR Code Ticketing**
  - Unique QR code for each ticket
  - Secure verification system
  - Beautiful ticket design
  
✅ **NFT-Based Tickets**
  - Tickets minted as NFTs
  - Permanent ownership record
  - Blockchain verification
  
✅ **User Features**
  - Browse available events
  - Purchase tickets with crypto
  - View digital tickets with QR codes
  - Wallet authentication

✅ **Deployed on Monad Testnet**

---

## 🛠️ Tech Stack

- **Contracts**: Solidity, Hardhat
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Web3**: wagmi, viem, RainbowKit
- **QR Codes**: qrcode.react
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
