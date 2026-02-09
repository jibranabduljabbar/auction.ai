'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

export default function StripeReturnPage() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push('/login');
                    return;
                }

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('stripe_account_onboarding_complete')
                    .eq('id', user.id)
                    .maybeSingle();

                const profileData = profile as any;
                if (profileData?.stripe_account_onboarding_complete) {
                    setStatus('success');
                } else {
                    setStatus('error');
                }
            } catch (error) {
                setStatus('error');
            }
        };

        checkStatus();
    }, [supabase, router]);

    return (
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-200px)]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {status === 'loading' && <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />}
                        {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                        Stripe Account Setup
                    </CardTitle>
                    <CardDescription>
                        {status === 'loading' && 'Checking your account status...'}
                        {status === 'success' && 'Your Stripe account has been successfully set up!'}
                        {status === 'error' && 'There was an issue setting up your account. Please try again.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {status === 'success' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                You can now receive payouts from your auction sales. Funds will be transferred to your connected bank account.
                            </p>
                            <Button onClick={() => router.push('/dashboard')} className="w-full">
                                Go to Dashboard
                            </Button>
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Please complete all required information in the Stripe onboarding process.
                            </p>
                            <Button onClick={() => router.push('/dashboard/stripe/onboard')} className="w-full">
                                Try Again
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}