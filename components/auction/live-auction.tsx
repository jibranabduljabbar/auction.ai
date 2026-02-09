'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow, format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { Zap, Clock } from 'lucide-react';

interface LiveAuctionProps {
    listingId: string;
    initialEndTime: string;
}

export function LiveAuction({ listingId, initialEndTime }: LiveAuctionProps) {
    const [endTime, setEndTime] = useState(initialEndTime);
    const [currentPrice, setCurrentPrice] = useState(0);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const { data } = await supabase
                .from('listings')
                .select('current_price, end_time')
                .eq('id', listingId)
                .single();

            if (data) {
                const dataTyped = data as any;
                setCurrentPrice(dataTyped.current_price);
                setEndTime(dataTyped.end_time);
            }
        };

        fetchData();

        const channel = supabase
            .channel(`listing:${listingId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'listings',
                    filter: `id=eq.${listingId}`,
                },
                (payload) => {
                    const newData = payload.new as any;
                    if (newData.current_price) {
                        setCurrentPrice(newData.current_price);
                    }
                    if (newData.end_time) {
                        setEndTime(newData.end_time);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [listingId, supabase]);

    const timeRemaining = formatDistanceToNow(new Date(endTime), { addSuffix: true });

    return (
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-blue-50 dark:from-primary/10 dark:to-gray-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                    <Zap className="h-5 w-5 text-primary" />
                    Live Auction
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Bid</p>
                        <p className="text-3xl font-bold text-primary">{formatCurrency(currentPrice)}</p>
                    </div>
                    <div className="p-4 bg-primary/10 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-4 w-4 text-primary" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Time Remaining</p>
                        </div>
                        <p className="text-lg font-semibold text-primary">{timeRemaining}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}