import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MyBidsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: bids } = await supabase
        .from('bids')
        .select(`
      *,
      listing:listings!bids_listing_id_fkey(id, title, image_urls, end_time, status, current_price)
    `)
        .eq('bidder_id', user.id)
        .order('created_at', { ascending: false });

    const bidsData = (bids || []) as Array<{
        id: string;
        amount: number;
        is_winning: boolean;
        created_at: string;
        listing?: {
            id: string;
            title: string;
            image_urls: string[];
            end_time: string;
            status: string;
            current_price: number;
        } | null;
    }>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">My Bids</h1>
                <p className="text-white">Track all your bids and auction activity</p>
            </div>

            {!bidsData || bidsData.length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-white mb-4">You haven't placed any bids yet.</p>
                        <Link href="/listings">
                            <Button>Browse Auctions</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {bidsData.map((bid) => (
                        <Card key={bid.id}>
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4 flex-1">
                                        {bid.listing?.image_urls && bid.listing.image_urls.length > 0 && (
                                            <div className="relative h-24 w-24 overflow-hidden rounded-lg">
                                                <img
                                                    src={bid.listing.image_urls[0]}
                                                    alt={bid.listing.title}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <Link href={`/listings/${bid.listing?.id}`}>
                                                <h3 className="font-semibold text-lg hover:text-primary mb-2">
                                                    {bid.listing?.title}
                                                </h3>
                                            </Link>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-600">Your Bid:</span>
                                                    <span className={`font-semibold ${bid.is_winning ? 'text-primary' : ''}`}>
                                                        {formatCurrency(bid.amount)}
                                                    </span>
                                                    {bid.is_winning && (
                                                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                                                            Winning
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-600">Current Price:</span>
                                                    <span>{formatCurrency(bid.listing?.current_price || 0)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-600">Status:</span>
                                                    <span className="capitalize">{bid.listing?.status}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-600">Placed:</span>
                                                    <span>{format(new Date(bid.created_at), 'MMM d, yyyy h:mm a')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Link href={`/listings/${bid.listing?.id}`}>
                                        <Button variant="outline" size="sm">
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            View
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}