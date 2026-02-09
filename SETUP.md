# Setup Guide for auction.ai

This guide will walk you through setting up the auction.ai marketplace from scratch.

## Step 1: Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and API keys

2. **Set Up Database Schema**
   - In your Supabase dashboard, go to SQL Editor
   - Copy and paste the entire contents of `supabase/schema.sql`
   - Run the SQL script
   - This will create all tables, indexes, triggers, and RLS policies
   
   ⚠️ **CRITICAL: Fix Registration Trigger**
   - After running the schema, you MUST run the updated trigger function
   - See `DATABASE_SETUP.md` for the exact SQL commands
   - Without this, user registration will fail with "Database error saving new user"

3. **Enable Real-time**
   - Go to Database > Replication in Supabase dashboard
   - Enable replication for:
     - `listings` table
     - `bids` table
   - This enables WebSocket subscriptions for real-time updates

4. **Configure Authentication**
   - Go to Authentication > Settings
   - Configure email settings (or use Supabase's default)
   - Set up email templates if needed

## Step 2: Stripe Setup

1. **Create Stripe Account**
   - Go to [stripe.com](https://stripe.com)
   - Create an account (or use existing)
   - Get your API keys from Dashboard > Developers > API keys

2. **Set Up Webhooks**
   - Go to Developers > Webhooks in Stripe dashboard
   - Click "Add endpoint"
   - Endpoint URL: `https://your-domain.com/api/stripe/webhook`
   - Events to listen for:
     - `account.updated`
     - `payment_intent.succeeded`
   - Copy the webhook signing secret

3. **Test Mode vs Live Mode**
   - Use test mode keys during development
   - Switch to live mode keys for production
   - Test mode allows you to use test card numbers

## Step 3: Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
PLATFORM_FEE_PERCENTAGE=5

# Optional: For cron jobs
CRON_SECRET=your_random_secret_string
```

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your app.

## Step 6: Create Admin User

1. Register a new account through the UI
2. In Supabase dashboard, go to Authentication > Users
3. Find your user and note the user ID
4. In SQL Editor, run:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'your-user-id';
```

## Step 7: Set Up Cron Job (Production)

To automatically end expired auctions, set up a cron job that calls:

```
POST https://your-domain.com/api/auctions/end
Authorization: Bearer YOUR_CRON_SECRET
```

**Options:**
- **Vercel Cron**: Add `vercel.json` with cron configuration
- **External Service**: Use a service like cron-job.org or EasyCron
- **Server**: Set up a cron job on your server

Example `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/auctions/end",
    "schedule": "*/1 * * * *"
  }]
}
```

## Step 8: Image Upload (Optional)

Currently, the app uses image URLs. For production, consider:

1. **Supabase Storage**
   - Set up Supabase Storage bucket
   - Create upload API route
   - Update listing creation form

2. **Cloudinary**
   - Sign up for Cloudinary
   - Use their upload widget
   - Store URLs in database

3. **AWS S3**
   - Set up S3 bucket
   - Create presigned URLs for uploads
   - Store URLs in database

## Step 9: Testing

### Test User Flows

1. **Seller Flow**
   - Register as seller
   - Complete Stripe onboarding
   - Create a listing
   - View listing in dashboard

2. **Buyer Flow**
   - Register as buyer
   - Browse listings
   - Place bids
   - View bid history

3. **Auction Flow**
   - Create listing with end time in near future
   - Place multiple bids
   - Verify real-time updates
   - Test soft-close extension
   - Complete payment after auction ends

### Test Stripe

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`

## Step 10: Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy

### Other Platforms

- **Netlify**: Similar to Vercel
- **Railway**: Supports cron jobs
- **AWS/GCP**: Full control, more setup required

## Troubleshooting

### Real-time not working
- Check Supabase replication is enabled
- Verify WebSocket connections in browser console
- Check network tab for WebSocket errors

### Stripe webhooks failing
- Verify webhook secret is correct
- Check Stripe dashboard for webhook logs
- Ensure endpoint is publicly accessible

### Database errors
- Verify RLS policies are correct
- Check user authentication status
- Review Supabase logs

### Images not loading
- Check image URLs are valid
- Verify CORS settings if using external images
- Consider implementing image upload

## Next Steps

- Add email notifications
- Implement advanced search/filtering
- Add user reviews/ratings
- Create mobile app
- Add analytics
- Implement fraud detection
- Set up monitoring/logging