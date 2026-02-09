import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gavel, Clock, Shield, Zap, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createClient();

  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, current_price, image_urls, end_time, status')
    .eq('status', 'active')
    .order('end_time', { ascending: true })
    .limit(6);

  const listingsData = (listings || []) as Array<{
    id: string;
    title: string;
    current_price: number;
    image_urls: string[];
    end_time: string;
    status: string;
  }>;

  return (
    <div className="min-h-full">
      <section className="relative bg-gradient-to-br from-primary/10 via-blue-50 to-purple-50 dark:from-primary/5 dark:via-gray-900 dark:to-gray-800 py-24 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-2xl mb-8 shadow-lg backdrop-blur-sm">
              <Gavel className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
              Welcome to <span className="block">auction.ai</span>
            </h1>
            <p className="text-xl md:text-1xl text-gray-700 dark:text-gray-200 mb-4 max-w-2xl mx-auto font-medium">
              A modern auction marketplace built for speed, trust, and scalability.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-xl mx-auto">
              Bid on unique items or sell your own in real-time auctions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/listings">
                <Button size="lg" className="text-base px-8 py-7 shadow-xl hover:shadow-2xl font-semibold h-14">
                  Browse Auctions
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="text-base px-8 py-7 border-2 font-semibold h-14 hover:bg-primary/5">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose auction.ai?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Built with cutting-edge technology for the best auction experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-all group">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Real-Time Bidding</CardTitle>
                <CardDescription>
                  Watch bids update live as they happen with WebSocket technology
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-all group">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Anti-Sniping</CardTitle>
                <CardDescription>
                  Soft-close system extends auctions when bids come in at the last minute
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-all group">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Secure Payments</CardTitle>
                <CardDescription>
                  Stripe Connect ensures safe transactions between buyers and sellers
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-all group">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <Gavel className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Trusted Platform</CardTitle>
                <CardDescription>
                  Built with marketplace best practices for fraud prevention and security
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {listingsData && listingsData.length > 0 && (
        <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Auctions</h2>
                <p className="text-gray-600 dark:text-gray-400">Discover unique items up for bid</p>
              </div>
              <Link href="/listings">
                <Button variant="outline" className="hidden md:flex">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listingsData.map((listing) => (
                <Link key={listing.id} href={`/listings/${listing.id}`}>
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer h-full flex flex-col">
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
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-primary">
                            ${(listing.current_price / 100).toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500">Current Bid</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8 md:hidden">
              <Link href="/listings">
                <Button variant="outline" className="w-full">
                  View All Auctions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}