import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Eye, Edit } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MyListingsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: listings } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

    const listingsData = (listings || []) as Array<{
        id: string;
        title: string;
        description: string;
        image_urls: string[];
        status: string;
        current_price: number;
        end_time: string;
    }>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold mb-2">My Listings</h1>
                    <p className="text-gray-600">Manage your auction listings</p>
                </div>
                <Link href="/listings/create">
                    <Button>Create New Listing</Button>
                </Link>
            </div>

            {!listingsData || listingsData.length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-gray-600 mb-4">You haven't created any listings yet.</p>
                        <Link href="/listings/create">
                            <Button>Create Your First Listing</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listingsData.map((listing) => (
                        <Card key={listing.id}>
                            {listing.image_urls && listing.image_urls.length > 0 && (
                                <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                                    <img
                                        src={listing.image_urls[0]}
                                        alt={listing.title}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="line-clamp-2">{listing.title}</CardTitle>
                                <CardDescription>
                                    Status: <span className="capitalize">{listing.status}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Current Price</span>
                                        <span className="font-semibold">{formatCurrency(listing.current_price)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Ends</span>
                                        <span className="text-sm">
                                            {format(new Date(listing.end_time), 'MMM d, h:mm a')}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link href={`/listings/${listing.id}`} className="flex-1">
                                        <Button variant="outline" className="w-full" size="sm">
                                            <Eye className="h-4 w-4 mr-2" />
                                            View
                                        </Button>
                                    </Link>
                                    {listing.status === 'draft' && (
                                        <Link href={`/listings/${listing.id}/edit`} className="flex-1">
                                            <Button variant="outline" className="w-full" size="sm">
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}