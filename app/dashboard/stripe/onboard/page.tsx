'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function StripeOnboardPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const supabase = createClient();

    const handleOnboard = async () => {
        setLoading(true);
        setError('');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('You must be logged in');

            const response = await fetch('/api/stripe/create-account-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create account link');
            }

            const { url } = await response.json();
            window.location.href = url;
        } catch (error: any) {
            setError(error.message || 'An error occurred');
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Stripe Account Setup</CardTitle>
                    <CardDescription>
                        Complete your Stripe account setup to receive payouts from your sales
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <h3 className="font-semibold">Why do I need to set up Stripe?</h3>
                        <p className="text-sm text-gray-600">
                            To receive payments from your auction sales, you need to connect a Stripe account.
                            This allows us to securely transfer funds to your bank account.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold">What information will I need?</h3>
                        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                            <li>Business or personal information</li>
                            <li>Bank account details for payouts</li>
                            <li>Tax identification information</li>
                        </ul>
                    </div>

                    <Button
                        onClick={handleOnboard}
                        disabled={loading}
                        className="w-full"
                        size="lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Redirecting...
                            </>
                        ) : (
                            'Complete Stripe Setup'
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}