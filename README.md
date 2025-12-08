# CRE8 Truck Club Website

Official website for CRE8 Truck Club - The edgiest truck club for enthusiasts driving Chevy, Ford, Dodge, Toyota, and Nissan pickups.

**Live Site:** https://cre8truckclub.vercel.app

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Custom session-based auth with Supabase
- **Payments:** Stripe (membership dues + merchandise)
- **Email:** SendGrid (dues reminders)
- **Hosting:** Vercel

## Features

### Public Pages
- Home page with hero, brand showcase, fleet preview, product strip, and events
- About page with club story, values, and FAQ
- Events page with upcoming/past events
- Shop with product catalog
- Fleet gallery

### Member Features
- Invite-code based signup
- Member dashboard with dues status, truck info, and upcoming events
- Profile management with photo/video uploads
- RSVP system for events (Going/Maybe/Can't Go with guest count)
- Member pricing on merchandise

### Admin Panel
- Member management (activate/deactivate, admin toggle)
- Product management with image upload, variants, and inventory
- Event management with image upload
- Order management with status tracking
- Invite code generation
- Dues reminder system

## Truck Makes Supported

- Chevy (Silverado, Colorado, S-10, C/K, Avalanche)
- Ford (F-150, F-250, F-350, Ranger, Maverick, Lightning)
- Dodge (Ram 1500/2500/3500, Dakota)
- Toyota (Tacoma, Tundra, T100, Hilux)
- Nissan (Titan, Titan XD, Frontier, Hardbody)

## Recent Updates

### Events System
- Image upload for events in admin panel (replaces URL input)
- Clickable events with RSVP modal for logged-in members
- RSVP options: Going, Maybe, Can't Go with guest count
- Member-only events redirect non-members to signup
- RSVP status badges on event cards
- Same RSVP modal available in member dashboard

### Truck Support
- Added Toyota and Nissan as supported truck makes
- Make/model dependent dropdowns in signup and profile
- Models auto-populate based on selected make

### Shop Improvements
- Category-specific sizes (Apparel: S-2XL, Hats: Snapback/Fitted sizes)
- Variant-based inventory tracking
- Stock quantity display on product cards
- Uniform product card heights
- Image gallery with multiple product images

### Location
- Club is based in Middle Tennessee (Nashville area)

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# SendGrid
SENDGRID_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
JWT_SECRET=
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   ├── dashboard/         # Member dashboard
│   ├── events/            # Events page
│   ├── shop/              # Shop pages
│   └── ...
├── components/            # React components
│   ├── layout/           # Header, Footer
│   └── ui/               # Button, Card, Input, etc.
├── lib/                   # Utilities and helpers
│   ├── auth.ts           # Authentication helpers
│   ├── supabase/         # Supabase clients
│   ├── stripe.ts         # Stripe configuration
│   └── utils.ts          # General utilities
├── store/                 # Zustand stores
│   ├── auth.ts           # Auth state
│   └── cart.ts           # Cart state
└── types/                 # TypeScript types
    └── index.ts          # All type definitions
```

## Database Tables

- `members` - Member profiles and truck info
- `membership_dues` - Dues payment records
- `invite_codes` - Signup invite codes
- `products` - Shop products
- `product_variants` - Size/color variants with inventory
- `orders` - Customer orders
- `order_items` - Order line items
- `events` - Club events
- `event_rsvps` - Event RSVP records
- `member_media` - Member uploaded photos/videos
- `fleet_gallery` - Featured truck photos

---

Built with Next.js and deployed on Vercel.
