import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Gavel, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ListingsPage() {
    const supabase = await createClient();

    const { data: listings } = await supabase
        .from('listings')
        .select('id, title, description, current_price, image_urls, end_time, status, created_at')
        .eq('status', 'active')
        .order('end_time', { ascending: true });

    const listingsData = (listings || []) as Array<{
        id: string;
        title: string;
        description: string;
        current_price: number;
        image_urls: string[];
        end_time: string;
        status: string;
        created_at: string;
    }>;

    return (
        <div className="bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-12">
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <Gavel className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-2xl font-bold mb-2">Active Auctions</h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                Browse all active auctions and place your bids
                            </p>
                        </div>
                    </div>
                </div>

                {!listingsData || listingsData.length === 0 ? (
                    <Card className="max-w-2xl mx-auto">
                        <CardContent className="pt-12 pb-12 text-center">
                            <Gavel className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No Active Auctions</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                There are no active auctions at the moment. Check back soon!
                            </p>
                            <Link href="/listings/create">
                                <Button>Create Your First Auction</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listingsData.map((listing) => (
                            <Link key={listing.id} href={`/listings/${listing.id}`}>
                                <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer h-full flex flex-col border-2 hover:border-primary/50">
                                    {listing.image_urls && listing.image_urls.length > 0 && (
                                        <div className="relative h-64 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                                            <img
                                                src={listing.image_urls[0]}
                                                alt={listing.title}
                                                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    )}
                                    <CardHeader>
                                        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                                            {listing.title}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {listing.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex items-baseline justify-between">
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                                        Current Bid
                                                    </p>
                                                    <p className="text-3xl font-bold text-primary">
                                                        {formatCurrency(listing.current_price)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 pt-2 border-t">
                                                <Clock className="h-4 w-4" />
                                                <span className="font-medium">
                                                    Ends {formatDistanceToNow(new Date(listing.end_time), { addSuffix: true })}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}