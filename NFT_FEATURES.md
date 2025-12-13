# 🎨 AI-Generated NFT Ticket Feature

## Overview
Each ticket purchased on Monoken is now a unique NFT with AI-generated artwork powered by **Pollinations AI**.

## How It Works

### 1. AI Art Generation
When a user purchases a ticket, the system automatically generates a unique NFT avatar using:
- **Pollinations AI API**: `https://image.pollinations.ai/prompt/`
- **Dynamic Prompt**: Based on event name and ticket ID
- **Deterministic Seed**: Uses ticket ID to ensure consistent artwork
- **High Quality**: 400x400px resolution with vibrant, abstract designs

### 2. NFT Display Components

#### User Tickets Page (`/events`)
- **Hero Image**: AI-generated NFT artwork at the top of each ticket card
- **NFT Badge**: Displays ticket number overlay on artwork
- **QR Code**: Below the NFT for verification
- **Event Details**: Full ticket information

#### Admin Panel (`/admin`)
- **Ticket Gallery**: Grid view of all sold tickets with NFT avatars
- **Compact Cards**: Smaller NFT previews (32px height) with QR codes
- **Detail Modal**: Large NFT artwork view when clicking a ticket
- **Buyer Information**: Track who purchased which NFT ticket

### 3. Technical Implementation

```typescript
// Generate unique AI NFT avatar
const nftPrompt = encodeURIComponent(
  `unique digital art NFT ticket avatar for ${eventName}, vibrant colors, modern abstract design, ticket #${ticketId}`
);
const nftImageUrl = `https://image.pollinations.ai/prompt/${nftPrompt}?width=400&height=400&seed=${ticketId}`;
```

**Key Features:**
- ✅ URL-encoded prompts for special characters
- ✅ Ticket ID as seed for consistency
- ✅ Event-specific prompts for unique designs
- ✅ Lazy loading for performance
- ✅ Gradient fallback while loading

### 4. User Experience

**For Event Attendees:**
1. Purchase a ticket → Receive unique NFT artwork
2. Each ticket is visually distinct and collectible
3. NFT serves as digital memorabilia
4. QR code embedded for easy verification

**For Event Organizers:**
1. Visual ticket gallery in admin panel
2. Easy identification of tickets by artwork
3. Professional NFT presentation
4. Enhanced brand value

## Benefits

### 🎨 Unique Identity
Every ticket has distinctive AI-generated artwork - no two tickets look the same.

### 🔒 Blockchain Verified
NFT artwork is tied to on-chain ticket ID, ensuring authenticity.

### 📱 Mobile Friendly
Optimized image loading and responsive design for all devices.

### 💾 Permanent
Artwork is deterministically generated from ticket ID - it never changes.

### 🎁 Collectible
Users build a visual collection of attended events.

## API Details

**Pollinations AI Endpoint:**
```
GET https://image.pollinations.ai/prompt/{encoded_prompt}?width={w}&height={h}&seed={s}
```

**Parameters:**
- `prompt`: URL-encoded description of desired artwork
- `width`: Image width (400px for tickets)
- `height`: Image height (400px for tickets)  
- `seed`: Deterministic seed (ticket ID) for consistent generation

**Response:**
- Direct image URL (JPEG/PNG)
- No API key required
- Free to use
- CDN cached

## Future Enhancements

- [ ] Add rarity levels based on ticket numbers
- [ ] Custom art styles per event type
- [ ] Animated NFT tickets
- [ ] User-selectable art themes
- [ ] NFT metadata storage on IPFS
- [ ] OpenSea integration for secondary market
- [ ] Ticket transfer functionality
- [ ] Achievement badges for multiple events

## Code Locations

- **Events Page**: `app/events/page.tsx` (lines 325-380)
- **Admin Panel**: `app/admin/page.tsx` (lines 570-695)
- **README**: `README.md` (NFT Features section)

---

**Powered by Pollinations AI** - Making every ticket a unique work of art! 🎨
