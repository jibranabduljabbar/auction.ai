import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { calculatePlatformFee, calculateSellerPayout } from '@/lib/utils';

export async function POST(req: Request) {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json(
            { error: 'Stripe is not configured' },
            { status: 503 }
        );
    }

    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        if (!stripe) {
            return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
        }
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error: any) {
        console.error('Webhook signature verification failed:', error.message);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const supabase = await createClient();

    try {
        switch (event.type) {
            case 'account.updated': {
                const account = event.data.object as Stripe.Account;
                const updateData: any = {
                    stripe_account_onboarding_complete: account.details_submitted,
                };
                await ((supabase.from('profiles') as any).update(updateData).eq('stripe_account_id', account.id));
                break;
            }

            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                const { listing_id, buyer_id } = paymentIntent.metadata;

                if (!listing_id || !buyer_id) {
                    console.error('Missing metadata in payment intent');
                    break;
                }

                const { data: listing } = await supabase
                    .from('listings')
                    .select('seller_id, current_price')
                    .eq('id', listing_id)
                    .single();

                if (!listing) {
                    console.error('Listing not found');
                    break;
                }

                const amount = paymentIntent.amount;
                const platformFee = calculatePlatformFee(amount);
                const sellerPayout = calculateSellerPayout(amount);

                const listingData = listing as any;
                const { data: transaction } = await supabase
                    .from('transactions')
                    .insert({
                        listing_id,
                        buyer_id,
                        seller_id: listingData.seller_id,
                        amount,
                        platform_fee: platformFee,
                        seller_payout: sellerPayout,
                        stripe_payment_intent_id: paymentIntent.id,
                        status: 'completed',
                    } as any)
                    .select()
                    .single();

                const { data: sellerProfile } = await supabase
                    .from('profiles')
                    .select('stripe_account_id')
                    .eq('id', listingData.seller_id)
                    .single();

                const sellerProfileData = sellerProfile as any;
                if (sellerProfileData?.stripe_account_id) {
                    try {
                        const transfer = await stripe.transfers.create({
                            amount: sellerPayout,
                            currency: 'usd',
                            destination: sellerProfileData.stripe_account_id,
                            metadata: {
                                transaction_id: (transaction as any).id,
                                listing_id,
                            },
                        });

                        const transferUpdate: any = { stripe_transfer_id: transfer.id };
                        await ((supabase.from('transactions') as any).update(transferUpdate).eq('id', (transaction as any).id));
                    } catch (transferError) {
                        console.error('Transfer failed:', transferError);
                    }
                }

                const listingUpdate: any = {
                    status: 'ended',
                    winner_id: buyer_id,
                };
                await ((supabase.from('listings') as any).update(listingUpdate).eq('id', listing_id));

                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook handler error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}