# CRE8 Truck Club Website - Claude Code Instructions

## Deployment Workflow

**IMPORTANT: Always commit and push changes after every modification.**

After making any code changes:
1. `git add -A`
2. `git commit -m "Description of changes"`
3. `git push`

This ensures Vercel automatically deploys updates. Never leave changes uncommitted.

## Project Overview

- **Framework**: Next.js 16 with TypeScript and Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe (checkout, membership dues)
- **Email**: SendGrid
- **Hosting**: Vercel (auto-deploys from GitHub master branch)

## Key URLs

- Production: https://cre8truckclub.vercel.app
- GitHub: https://github.com/red-tn/CRE8

## Environment Variables (Vercel)

Required in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SENDGRID_API_KEY`
- `NEXT_PUBLIC_APP_URL` (set to https://cre8truckclub.vercel.app)
- `SESSION_SECRET`

## Key Features

- Member signup with invite codes ($50/year dues)
- Merch store with Stripe checkout and FedEx shipping
- Member dashboard with profile editing and media uploads
- Public member profile pages at `/member/[id]`
- Admin panel at `/admin` for managing members, products, events, orders
- Fleet gallery showing member trucks

## File Structure

- `/src/app/` - Next.js App Router pages
- `/src/app/api/` - API routes
- `/src/components/` - Reusable UI components
- `/src/lib/` - Utilities (auth, supabase, stripe, email)
- `/src/store/` - Zustand state stores (cart, auth)
