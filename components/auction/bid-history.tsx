'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Gavel, User, Clock } from 'lucide-react';

interface BidHistoryProps {
    listingId: string;
}

export function BidHistory({ listingId }: BidHistoryProps) {
    const [bids, setBids] = useState<any[]>([]);
    const supabase = createClient();

    useEffect(() => {
        const fetchBids = async () => {
            const { data } = await supabase
                .from('bids')
                .select('*, bidder:profiles!bids_bidder_id_fkey(full_name, email)')
                .eq('listing_id', listingId)
                .order('created_at', { ascending: false })
                .limit(20);

            if (data) {
                setBids(data);
            }
        };

        fetchBids();

        const channel = supabase
            .channel(`bids:${listingId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'bids',
                    filter: `listing_id=eq.${listingId}`,
                },
                (payload) => {
                    fetchBids();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [listingId, supabase]);

    if (bids.length === 0) {
        return (
            <Card className="border-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gavel className="h-5 w-5" />
                        Bid History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <Gavel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 font-medium">No bids yet</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Be the first to bid!</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Gavel className="h-5 w-5" />
                    Bid History
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {bids.map((bid, index) => (
                        <div
                            key={bid.id}
                            className={`flex justify-between items-center p-4 border-2 rounded-lg transition-all ${bid.is_winning
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 rounded-lg ${bid.is_winning ? 'bg-primary/10' : 'bg-gray-100 dark:bg-gray-800'
                                        }`}>
                                        <span className="font-bold text-lg">
                                            #{bids.length - index}
                                        </span>
                                    </div>
                                    <div>
                                        <p className={`font-bold text-lg ${bid.is_winning ? 'text-primary' : ''
                                            }`}>
                                            {formatCurrency(bid.amount)}
                                        </p>
                                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                            <User className="h-3 w-3" />
                                            <span>{bid.bidder?.full_name || bid.bidder?.email || 'Anonymous'}</span>
                                        </div>
                                    </div>
                                </div>
                                {bid.is_winning && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                                        Winning Bid
                                    </span>
                                )}
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                    <Clock className="h-3 w-3" />
                                    <span>{format(new Date(bid.created_at), 'MMM d, h:mm a')}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}