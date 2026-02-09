# auction.ai - Modern Auction Marketplace

A production-ready, scalable auction marketplace built with Next.js, Supabase, and Stripe Connect.

## Features

- ✅ User authentication (buyers & sellers)
- ✅ Listings with images and metadata
- ✅ Time-based auction system
- ✅ Bid validation & increments
- ✅ Soft-close / anti-sniping logic
- ✅ Real-time bid updates (Supabase WebSockets)
- ✅ Marketplace payments (Stripe Connect)
- ✅ Platform fees & seller payouts
- ✅ Admin tools for moderation

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Payments**: Stripe Connect
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd auction-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Fill in your environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret
- `NEXT_PUBLIC_APP_URL`: Your app URL (e.g., http://localhost:3000)
- `PLATFORM_FEE_PERCENTAGE`: Platform fee percentage (default: 5)

4. Set up the database:
   - Go to your Supabase dashboard
   - Run the SQL from `supabase/schema.sql` in the SQL editor
   - Enable real-time for `listings` and `bids` tables in the Supabase dashboard

5. Set up Stripe:
   - Create a Stripe account
   - Get your API keys from the Stripe dashboard
   - Set up webhooks pointing to `https://your-domain.com/api/stripe/webhook`
   - Configure webhook events: `account.updated`, `payment_intent.succeeded`

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── dashboard/         # User dashboard
│   ├── listings/          # Listing pages
│   └── login/register/    # Auth pages
├── components/            # React components
│   ├── auction/          # Auction-specific components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── lib/                  # Utility functions
│   ├── supabase/        # Supabase clients
│   └── stripe.ts        # Stripe utilities
├── supabase/            # Database schema
└── types/               # TypeScript types
```

## Key Features Explained

### Real-Time Bidding
Uses Supabase real-time subscriptions to update bids and auction status instantly across all clients.

### Soft-Close / Anti-Sniping
When a bid is placed within the soft-close extension window (default: 5 minutes), the auction end time is automatically extended to prevent last-second sniping.

### Bid Validation
- Minimum bid increments based on current price
- Prevents bidding on own listings
- Validates auction is still active
- Race condition protection via database constraints

### Stripe Connect
- Sellers complete Stripe onboarding to receive payouts
- Platform fees are automatically calculated and deducted
- Secure payment processing with Stripe Payment Intents
- Automatic transfers to seller accounts

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Make sure to set all environment variables in your hosting platform:
- All Supabase keys
- All Stripe keys
- `NEXT_PUBLIC_APP_URL`: Your production URL
- `CRON_SECRET`: Secret for cron job authentication (if using)

### Cron Jobs

Set up a cron job to call `/api/auctions/end` periodically (e.g., every minute) to automatically end expired auctions. Use a service like Vercel Cron or a separate cron service.

## Security Considerations

- Row Level Security (RLS) enabled on all tables
- API routes protected with authentication
- Stripe webhooks verified with signature
- Input validation on all forms
- SQL injection protection via Supabase

## License

MIT

## Support

For issues or questions, please open an issue in the repository.