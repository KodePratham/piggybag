# 🚀 Quick Start Guide - Monoken Ticketing System

## Prerequisites

✅ Node.js or Bun installed  
✅ MetaMask wallet  
✅ MON testnet tokens (from Monad faucet)

## Step-by-Step Setup

### 1️⃣ Install Dependencies

```bash
bun install
```

### 2️⃣ Create Environment File

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Add your wallet's private key (from MetaMask -> Account Details -> Export Private Key)
PRIVATE_KEY=your-private-key-here

# These are pre-configured for Monad Testnet
MONAD_RPC_URL=https://testnet.monad.xyz
```

⚠️ **NEVER commit your `.env.local` file!**

### 3️⃣ Compile Contract

```bash
bun run compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

### 4️⃣ Test Contract (Optional)

```bash
bun run test
```

### 5️⃣ Deploy to Monad Testnet

```bash
bun run deploy
```

Expected output:
```
Deploying EventTicketing contract to Monad Testnet...
Deploying contracts with the account: 0x1234...
Account balance: 1.5 MON
EventTicketing deployed to: 0xABCD...
Admin address: 0x1234...

📝 Add these to your .env.local file:
NEXT_PUBLIC_CONTRACT_ADDRESS=0xABCD...
NEXT_PUBLIC_ADMIN_ADDRESS=0x1234...
```

### 6️⃣ Update Environment

Copy the contract address and admin address from deployment output to `.env.local`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xABCD...
NEXT_PUBLIC_ADMIN_ADDRESS=0x1234...
```

### 7️⃣ Run Development Server

```bash
bun run dev
```

Visit: **http://localhost:3000**

## 🎯 Using the Application

### For Admin (Contract Deployer):

1. **Connect Wallet** - Click "Connect Wallet" button
2. **Go to Admin Panel** - Click "Admin Panel" or visit `/admin`
3. **Create Event**:
   - Fill in event details
   - Set ticket price (in MON)
   - Set total tickets available
   - Click "Create Event"
   - Approve transaction in MetaMask
4. **Manage Events** - Toggle active/inactive, withdraw funds

### For Users (Ticket Buyers):

1. **Connect Wallet** - Click "Connect Wallet" button
2. **Browse Events** - Click "Browse Events" or visit `/events`
3. **Purchase Ticket**:
   - View event details
   - Click "Buy Ticket"
   - Approve transaction in MetaMask
4. **View Your Tickets** - See "My Tickets" section at top

## 🔍 Verify Contract (Optional)

```bash
npx hardhat verify --network monadTestnet YOUR_CONTRACT_ADDRESS
```

## 🌐 Add Monad Testnet to MetaMask

1. Open MetaMask
2. Click network dropdown
3. Click "Add Network" → "Add a network manually"
4. Enter:
   - **Network Name**: Monad Testnet
   - **RPC URL**: https://testnet.monad.xyz
   - **Chain ID**: 10143
   - **Currency Symbol**: MON
   - **Block Explorer**: https://explorer.testnet.monad.xyz
5. Click "Save"

## 💰 Get Testnet MON

Visit Monad testnet faucet to get free test tokens.

## 🆘 Troubleshooting

### "Insufficient funds" error
- Get MON from testnet faucet
- Make sure you're on Monad Testnet in MetaMask

### "Only admin can call this function"
- Only the wallet that deployed the contract can access `/admin`
- Check `NEXT_PUBLIC_ADMIN_ADDRESS` matches your wallet

### "Contract not deployed"
- Make sure you ran `bun run deploy`
- Check `.env.local` has `NEXT_PUBLIC_CONTRACT_ADDRESS`

### Transaction fails
- Check you have enough MON for gas
- Make sure event is active
- Check ticket price is correct

## 📚 Key Files

- `contracts/EventTicketing.sol` - Smart contract
- `app/admin/page.tsx` - Admin panel
- `app/events/page.tsx` - Events listing
- `app/config/contract.ts` - Contract ABI & address
- `hardhat.config.ts` - Network configuration

## 🎉 Next Steps

1. Create your first event via `/admin`
2. Test purchasing tickets
3. Customize the UI in the `app/` directory
4. Deploy to production when ready

---

**Need help?** Check `DEPLOYMENT_GUIDE.md` for detailed documentation.
