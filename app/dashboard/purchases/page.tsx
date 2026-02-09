import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MyPurchasesPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: transactions } = await supabase
        .from('transactions')
        .select(`
      *,
      listing:listings!transactions_listing_id_fkey(id, title, image_urls)
    `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

    const transactionsData = (transactions || []) as Array<{
        id: string;
        amount: number;
        status: string;
        created_at: string;
        listing?: {
            id: string;
            title: string;
            image_urls: string[];
        } | null;
    }>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">My Purchases</h1>
                <p className="text-gray-600">View your completed purchases</p>
            </div>

            {!transactionsData || transactionsData.length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-gray-600 mb-4">You haven't made any purchases yet.</p>
                        <Link href="/listings">
                            <Button>Browse Auctions</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {transactionsData.map((transaction) => (
                        <Card key={transaction.id}>
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4 flex-1">
                                        {transaction.listing?.image_urls && transaction.listing.image_urls.length > 0 && (
                                            <div className="relative h-24 w-24 overflow-hidden rounded-lg">
                                                <img
                                                    src={transaction.listing.image_urls[0]}
                                                    alt={transaction.listing.title}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <Link href={`/listings/${transaction.listing?.id}`}>
                                                <h3 className="font-semibold text-lg hover:text-primary mb-2">
                                                    {transaction.listing?.title}
                                                </h3>
                                            </Link>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-600">Amount:</span>
                                                    <span className="font-semibold">{formatCurrency(transaction.amount)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-600">Status:</span>
                                                    <span className={`capitalize ${transaction.status === 'completed' ? 'text-green-600' :
                                                        transaction.status === 'pending' ? 'text-yellow-600' :
                                                            'text-red-600'
                                                        }`}>
                                                        {transaction.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-600">Purchased:</span>
                                                    <span>{format(new Date(transaction.created_at), 'MMM d, yyyy h:mm a')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Link href={`/listings/${transaction.listing?.id}`}>
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