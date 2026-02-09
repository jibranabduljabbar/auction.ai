import { createClient } from '@/lib/supabase/server';
import { createPaymentIntent } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json(
                { error: 'Stripe is not configured. Please add Stripe keys to your environment variables.' },
                { status: 503 }
            );
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { listingId } = await req.json();

        if (!listingId) {
            return NextResponse.json({ error: 'Listing ID required' }, { status: 400 });
        }

        const { data: listing, error: listingError } = await supabase
            .from('listings')
            .select('id, current_price, status, winner_id, seller_id')
            .eq('id', listingId)
            .single();

        if (listingError || !listing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        const listingData = listing as any;

        if (listingData.status !== 'ended') {
            return NextResponse.json({ error: 'Auction has not ended' }, { status: 400 });
        }

        if (listingData.winner_id !== user.id) {
            return NextResponse.json({ error: 'You are not the winner' }, { status: 403 });
        }

        const { data: existingTransaction } = await supabase
            .from('transactions')
            .select('id, status')
            .eq('listing_id', listingId)
            .eq('buyer_id', user.id)
            .single();

        if (existingTransaction) {
            const transactionData = existingTransaction as any;
            if (transactionData.status === 'completed') {
                return NextResponse.json({ error: 'Payment already completed' }, { status: 400 });
            }
            return NextResponse.json({ transactionId: transactionData.id });
        }

        const paymentIntent = await createPaymentIntent(
            listingData.current_price,
            user.id,
            listingId,
            {}
        );

        const { data: transaction } = await supabase
            .from('transactions')
            .insert({
                listing_id: listingId,
                buyer_id: user.id,
                seller_id: listingData.seller_id,
                amount: listingData.current_price,
                platform_fee: 0,
                seller_payout: 0,
                stripe_payment_intent_id: paymentIntent.id,
                status: 'pending',
            } as any)
            .select()
            .single();

        if (!transaction) {
            return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
        }

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            transactionId: (transaction as any).id,
        });
    } catch (error: any) {
        console.error('Error creating payment intent:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create payment intent' },
            { status: 500 }
        );
    }
}