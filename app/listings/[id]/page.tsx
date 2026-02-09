import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { BidForm } from '@/components/auction/bid-form';
import { BidHistory } from '@/components/auction/bid-history';
import { LiveAuction } from '@/components/auction/live-auction';
import { Clock, Tag, User, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ListingDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const supabase = await createClient();

    const { data: listing } = await supabase
        .from('listings')
        .select(`
      *,
      seller:profiles!listings_seller_id_fkey(full_name, email),
      winner:profiles!listings_winner_id_fkey(full_name, email)
    `)
        .eq('id', params.id)
        .single();

    if (!listing) {
        notFound();
    }

    const listingData = listing as any;
    const isActive = listingData.status === 'active' && new Date(listingData.end_time) > new Date();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {listingData.image_urls && listingData.image_urls.length > 0 && (
                            <div className="space-y-4">
                                <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-2 bg-gray-100 dark:bg-gray-800 shadow-lg">
                                    <img
                                        src={listingData.image_urls[0]}
                                        alt={listingData.title}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                {listingData.image_urls.length > 1 && (
                                    <div className="grid grid-cols-4 gap-3">
                                        {listingData.image_urls.slice(1).map((url: string, idx: number) => (
                                            <div
                                                key={idx}
                                                className="relative aspect-square overflow-hidden rounded-xl border-2 bg-gray-100 dark:bg-gray-800 cursor-pointer hover:border-primary transition-colors"
                                            >
                                                <img
                                                    src={url}
                                                    alt={`${listingData.title} ${idx + 2}`}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <Card className="border-2">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-3xl mb-2">{listingData.title}</CardTitle>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Tag className="h-4 w-4" />
                                            <span>{listingData.category}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">Description</h3>
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                        {listingData.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-6 pt-6 border-t">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Condition</p>
                                        <p className="font-semibold capitalize text-lg">{listingData.condition}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Seller</p>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-500" />
                                            <p className="font-semibold text-lg">
                                                {(listingData.seller as any)?.full_name || (listingData.seller as any)?.email || 'Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {isActive && <LiveAuction listingId={listingData.id} initialEndTime={listingData.end_time} />}

                        <Card className="border-2 border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    {listingData.status === 'ended' ? 'Final Price' : 'Current Bid'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-5xl font-bold text-primary mb-6">
                                    {formatCurrency(listingData.current_price)}
                                </div>
                                {listingData.status === 'active' && (
                                    <div className="space-y-3 text-sm pt-4 border-t">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Starting Price</span>
                                            <span className="font-semibold">{formatCurrency(listingData.starting_price)}</span>
                                        </div>
                                        {listingData.reserve_price && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Reserve Price</span>
                                                <span className="font-semibold">{formatCurrency(listingData.reserve_price)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Auction Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {listingData.status === 'active' ? (
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ends</p>
                                            <p className="text-lg font-semibold">
                                                {format(new Date(listingData.end_time), 'MMM d, yyyy h:mm a')}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-primary/10 rounded-lg">
                                            <p className="text-sm font-medium text-primary">
                                                {formatDistanceToNow(new Date(listingData.end_time), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                ) : listingData.status === 'ended' ? (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ended</p>
                                        <p className="text-lg font-semibold mb-4">
                                            {format(new Date(listingData.end_time), 'MMM d, yyyy h:mm a')}
                                        </p>
                                        {listingData.winner && (
                                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                                    Winner: {(listingData.winner as any).full_name || (listingData.winner as any).email}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-600 dark:text-gray-400">Status: {listingData.status}</p>
                                )}
                            </CardContent>
                        </Card>

                        {isActive && <BidForm listingId={listingData.id} currentPrice={listingData.current_price} onBidPlaced={() => { }} />}

                        <BidHistory listingId={listingData.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}