import Stripe from 'stripe';

export const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2026-01-28.clover',
        typescript: true,
    })
    : null;

export async function createStripeAccount(email: string) {
    if (!stripe) throw new Error('Stripe is not configured');
    const account = await stripe.accounts.create({
        type: 'express',
        email,
        capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
        },
    });

    return account;
}

export async function createAccountLink(accountId: string, returnUrl: string) {
    if (!stripe) throw new Error('Stripe is not configured');
    const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: returnUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
    });

    return accountLink;
}

export async function createPaymentIntent(
    amount: number,
    buyerId: string,
    listingId: string,
    metadata: Record<string, string>
) {
    if (!stripe) throw new Error('Stripe is not configured');
    const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        metadata: {
            buyer_id: buyerId,
            listing_id: listingId,
            ...metadata,
        },
    });

    return paymentIntent;
}

export async function createTransfer(
    amount: number,
    destination: string,
    metadata: Record<string, string>
) {
    if (!stripe) throw new Error('Stripe is not configured');
    const transfer = await stripe.transfers.create({
        amount,
        currency: 'usd',
        destination,
        metadata,
    });

    return transfer;
}