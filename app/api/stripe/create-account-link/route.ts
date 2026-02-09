import { createClient } from '@/lib/supabase/server';
import { createStripeAccount, createAccountLink } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST() {
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

        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_account_id, stripe_account_onboarding_complete')
            .eq('id', user.id)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        const profileData = profile as any;
        let accountId = profileData.stripe_account_id;

        if (!accountId) {
            const account = await createStripeAccount(user.email!);
            accountId = account.id;

            const updateData: any = { stripe_account_id: accountId };
            await ((supabase.from('profiles') as any).update(updateData).eq('id', user.id));
        }

        const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/stripe/return`;
        const accountLink = await createAccountLink(accountId, returnUrl);

        return NextResponse.json({ url: accountLink.url });
    } catch (error: any) {
        console.error('Error creating account link:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create account link' },
            { status: 500 }
        );
    }
}