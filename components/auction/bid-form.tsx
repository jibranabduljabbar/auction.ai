'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, calculateNextMinBid } from '@/lib/utils';
import { Gavel, TrendingUp } from 'lucide-react';

interface BidFormProps {
    listingId: string;
    currentPrice: number;
    onBidPlaced: () => void;
}

export function BidForm({ listingId, currentPrice, onBidPlaced }: BidFormProps) {
    const [bidAmount, setBidAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, [supabase]);

    useEffect(() => {
        const nextMinBid = calculateNextMinBid(currentPrice);
        setBidAmount((nextMinBid / 100).toFixed(2));
    }, [currentPrice]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!user) {
                throw new Error('You must be logged in to place a bid');
            }

            const amount = Math.round(parseFloat(bidAmount) * 100);
            const nextMinBid = calculateNextMinBid(currentPrice);

            if (amount < nextMinBid) {
                throw new Error(`Minimum bid is ${formatCurrency(nextMinBid)}`);
            }

            const { data: listing, error: listingError } = await supabase
                .from('listings')
                .select('status, end_time, seller_id')
                .eq('id', listingId)
                .single();

            if (listingError) throw listingError;

            const listingData = listing as any;
            if (listingData.status !== 'active') {
                throw new Error('This auction is no longer active');
            }

            if (new Date(listingData.end_time) <= new Date()) {
                throw new Error('This auction has ended');
            }

            if (listingData.seller_id === user.id) {
                throw new Error('You cannot bid on your own listing');
            }

            const { data: currentBids } = await supabase
                .from('bids')
                .select('amount, bidder_id')
                .eq('listing_id', listingId)
                .eq('is_winning', true)
                .single();

            const currentBidsData = currentBids as any;
            if (currentBidsData && amount <= currentBidsData.amount) {
                throw new Error(`Your bid must be higher than ${formatCurrency(currentBidsData.amount)}`);
            }

            if (currentBidsData) {
                const updateData: any = { is_winning: false };
                await ((supabase.from('bids') as any).update(updateData).eq('listing_id', listingId).eq('is_winning', true));
            }

            const bidData: any = {
                listing_id: listingId,
                bidder_id: user.id,
                amount,
                is_winning: true,
            };
            const { error: bidError } = await (supabase.from('bids') as any).insert(bidData);

            if (bidError) throw bidError;

            const priceUpdate: any = { current_price: amount };
            const { error: updateError } = await ((supabase.from('listings') as any).update(priceUpdate).eq('id', listingId));

            if (updateError) throw updateError;

            const { data: listingData2 } = await supabase
                .from('listings')
                .select('end_time, soft_close_extension')
                .eq('id', listingId)
                .single();

            if (listingData2) {
                const listingData2Typed = listingData2 as any;
                const timeUntilEnd = new Date(listingData2Typed.end_time).getTime() - Date.now();
                const extensionSeconds = listingData2Typed.soft_close_extension || 300;

                if (timeUntilEnd <= extensionSeconds * 1000) {
                    const newEndTime = new Date(Date.now() + extensionSeconds * 1000);
                    const endTimeUpdate: any = { end_time: newEndTime.toISOString() };
                    await ((supabase.from('listings') as any).update(endTimeUpdate).eq('id', listingId));
                }
            }

            setBidAmount('');
            onBidPlaced();
        } catch (error: any) {
            setError(error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <Card className="border-2">
                <CardContent className="pt-6 text-center py-8">
                    <Gavel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                        Please log in to place a bid
                    </p>
                </CardContent>
            </Card>
        );
    }

    const nextMinBid = calculateNextMinBid(currentPrice);

    return (
        <Card className="border-2 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Gavel className="h-5 w-5 text-primary" />
                    Place a Bid
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-destructive/10 border-2 border-destructive/20 text-destructive p-4 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-3">
                        <Label htmlFor="bidAmount" className="text-base font-semibold">Your Bid</Label>
                        <div className="flex items-center space-x-3">
                            <span className="text-3xl font-bold text-primary">$</span>
                            <Input
                                id="bidAmount"
                                type="number"
                                step="0.01"
                                min={nextMinBid / 100}
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                                required
                                className="text-2xl h-16 font-bold text-center"
                            />
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <p className="text-sm font-medium text-primary">
                                Minimum bid: {formatCurrency(nextMinBid)}
                            </p>
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 text-base font-semibold" size="lg" disabled={loading}>
                        {loading ? 'Placing Bid...' : 'Place Bid'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}