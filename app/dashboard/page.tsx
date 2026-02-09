import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Gavel, TrendingUp, Package, CreditCard } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

    let profileData = (profile || null) as any;

    if (!profile && !profileError) {
        const insertData: any = {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || null,
            role: (user.user_metadata?.role as 'buyer' | 'seller' | 'admin') || 'buyer',
        };

        const { data: newProfile, error: insertError } = await ((supabase.from('profiles') as any)
            .insert(insertData)
            .select()
            .single());

        if (insertError || !newProfile) {
            console.error('Profile creation error:', insertError);
            redirect('/register?error=profile_creation_failed');
        }

        profileData = (newProfile || null) as any;
    }

    const [listingsResult, bidsResult, transactionsResult] = await Promise.all([
        supabase
            .from('listings')
            .select('id, status, current_price')
            .eq('seller_id', user.id),
        supabase
            .from('bids')
            .select('id, amount, is_winning')
            .eq('bidder_id', user.id),
        supabase
            .from('transactions')
            .select('id, amount, status')
            .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`),
    ]);

    const listings = (listingsResult.data || []) as Array<{ status: string }>;
    const bids = (bidsResult.data || []) as Array<{ is_winning: boolean }>;
    const transactions = (transactionsResult.data || []) as Array<{
        status: string;
        amount?: number;
        buyer_id?: string;
    }>;

    const activeListings = listings.filter(l => l.status === 'active').length;
    const totalEarnings = transactions
        .filter(t => t.status === 'completed' && profileData?.role === 'seller')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
    const winningBids = bids.filter(b => b.is_winning).length;
    const totalSpent = transactions
        .filter(t => t.status === 'completed' && t.buyer_id === user.id)
        .reduce((sum, t) => sum + (t.amount || 0), 0);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
                <p className="text-white">Welcome back, {profileData?.full_name || user.email}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeListings}</div>
                        <p className="text-xs text-muted-foreground">
                            {listings.length} total listings
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Winning Bids</CardTitle>
                        <Gavel className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{winningBids}</div>
                        <p className="text-xs text-muted-foreground">
                            {bids.length} total bids
                        </p>
                    </CardContent>
                </Card>

                {profileData?.role === 'seller' && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
                            <p className="text-xs text-muted-foreground">
                                From completed sales
                            </p>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
                        <p className="text-xs text-muted-foreground">
                            On purchases
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {(profileData?.role === 'seller' || profileData?.role === 'admin') && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Seller Tools</CardTitle>
                            <CardDescription>Manage your listings and sales</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Link href="/listings/create">
                                <Button className="w-full" variant="outline">
                                    Create New Listing
                                </Button>
                            </Link>
                            <Link href="/dashboard/listings">
                                <Button className="w-full" variant="outline">
                                    My Listings
                                </Button>
                            </Link>
                            {profileData?.role === 'seller' &&
                                !profileData?.stripe_account_onboarding_complete &&
                                process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
                                    <Link href="/dashboard/stripe/onboard">
                                        <Button className="w-full" variant="outline">
                                            Complete Stripe Setup
                                        </Button>
                                    </Link>
                                )}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Buyer Tools</CardTitle>
                        <CardDescription>Track your bids and purchases</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 flex flex-col">
                        <Link href="/dashboard/bids">
                            <Button className="w-full" variant="outline">
                                My Bids
                            </Button>
                        </Link>
                        <Link href="/dashboard/purchases">
                            <Button className="w-full" variant="outline">
                                My Purchases
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}