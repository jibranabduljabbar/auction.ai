import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createClient();

        const { data: expiredListings } = await supabase
            .from('listings')
            .select('id, current_price, reserve_price, winner_id')
            .eq('status', 'active')
            .lte('end_time', new Date().toISOString());

        if (!expiredListings || expiredListings.length === 0) {
            return NextResponse.json({ message: 'No expired auctions' });
        }

        for (const listing of expiredListings as Array<{ id: string; current_price: number; reserve_price: number | null; winner_id: string | null }>) {
            const { data: winningBid } = await supabase
                .from('bids')
                .select('bidder_id')
                .eq('listing_id', listing.id)
                .eq('is_winning', true)
                .single();

            const reserveMet = !listing.reserve_price || listing.current_price >= listing.reserve_price;

            if (winningBid && reserveMet) {
                const updateData: any = {
                    status: 'ended',
                    winner_id: (winningBid as any).bidder_id,
                };
                await (supabase.from('listings') as any).update(updateData).eq('id', listing.id);
            } else {
                const updateData: any = {
                    status: 'ended',
                };
                await (supabase.from('listings') as any).update(updateData).eq('id', listing.id);
            }
        }

        return NextResponse.json({
            message: `Ended ${expiredListings.length} auctions`,
            count: expiredListings.length,
        });
    } catch (error: any) {
        console.error('Error ending auctions:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to end auctions' },
            { status: 500 }
        );
    }
}