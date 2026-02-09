'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { CreditCard } from 'lucide-react';

interface WinnerPaymentProps {
    listingId: string;
    amount: number;
}

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    : null;

export function WinnerPayment({ listingId, amount }: WinnerPaymentProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePayment = async () => {
        setLoading(true);
        setError('');

        try {
            if (!stripePromise) {
                throw new Error('Stripe is not configured. Please contact support.');
            }

            const response = await fetch('/api/payments/create-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listingId }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create payment');
            }

            const { clientSecret } = await response.json();

            const stripe = await stripePromise;
            if (!stripe) throw new Error('Stripe failed to load');

            throw new Error('Payment method collection not implemented. Please use Stripe Elements in production.');

            window.location.href = '/dashboard/purchases';
        } catch (error: any) {
            setError(error.message || 'An error occurred');
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Complete Your Purchase</CardTitle>
                <CardDescription>You won this auction! Complete payment to receive your item.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount</span>
                        <span className="text-2xl font-bold">{formatCurrency(amount)}</span>
                    </div>
                </div>

                <Button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {loading ? 'Processing...' : 'Pay Now'}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                    Secure payment powered by Stripe
                </p>
            </CardContent>
        </Card>
    );
}