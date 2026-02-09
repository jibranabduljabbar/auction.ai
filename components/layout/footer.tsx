import Link from 'next/link';
import { Gavel } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t bg-gray-50 dark:bg-gray-900 mt-auto">
            <div className="container mx-auto px-4 py-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div>
                        <Link href="/" className="flex items-center space-x-3 mb-6 group">
                            <div className="p-2.5 bg-gradient-to-br from-primary to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
                                <Gavel className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                                    auction.ai
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium -mt-1">
                                    Modern Marketplace
                                </span>
                            </div>
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                            Modern auction marketplace built for speed, trust, and scalability.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold mb-5 text-foreground text-base">Marketplace</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/listings" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors font-medium">
                                    Browse Auctions
                                </Link>
                            </li>
                            <li>
                                <Link href="/listings/create" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors font-medium">
                                    Sell Items
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold mb-5 text-foreground text-base">Account</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors font-medium">
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/bids" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors font-medium">
                                    My Bids
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/listings" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors font-medium">
                                    My Listings
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold mb-5 text-foreground text-base">Support</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/help" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors font-medium">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors font-medium">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors font-medium">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        &copy; {new Date().getFullYear()} auction.ai. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}