'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, LogOut, Gavel, Plus, Settings, Menu, X, Search } from 'lucide-react';

export function Navbar() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();
    const supabase = createClient();
    console.log(profile)

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data: profileData, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .maybeSingle();

                if (error && error.code !== 'PGRST116') {
                    console.error('Profile fetch error:', error);
                }

                setProfile(profileData);
            }
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    setUser(session.user);
                    const { data: profileData, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .maybeSingle();

                    if (error && error.code !== 'PGRST116') {
                        console.error('Profile fetch error:', error);
                    }

                    setProfile(profileData);
                } else {
                    setUser(null);
                    setProfile(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    return (
        <nav className="border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur-md sticky top-0 z-50 shadow-sm border-gray-200 dark:border-gray-800">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="p-2.5 bg-gradient-to-br from-primary to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
                            <Gavel className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                                auction.ai
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium -mt-1">
                                Modern Marketplace
                            </span>
                        </div>
                    </Link>

                    <div className="hidden lg:flex items-center space-x-2">
                        <Link href="/listings">
                            <Button variant="ghost" className="cursor-pointer font-medium text-base px-4 h-11 hover:bg-primary/5 hover:text-primary transition-all">
                                Browse Auctions
                            </Button>
                        </Link>

                        {user ? (
                            <>
                                {(profile?.role === 'seller' || profile?.role === 'admin') && (
                                    <Link href="/listings/create">
                                        <Button variant="outline" size="sm" className="cursor-pointer font-semibold text-base px-5 h-11 border-2 hover:border-primary hover:bg-primary/5 transition-all">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Listing
                                        </Button>
                                    </Link>
                                )}

                                {profile?.role === 'admin' && (
                                    <Link href="/admin">
                                        <Button variant="outline" size="sm" className="cursor-pointer font-semibold text-base px-4 h-11 border-2 hover:border-primary hover:bg-primary/5 transition-all">
                                            <Settings className="h-4 w-4 mr-2" />
                                            Admin
                                        </Button>
                                    </Link>
                                )}

                                <Link href="/dashboard">
                                    <Button variant="ghost" size="sm" className="cursor-pointer font-medium text-base px-4 h-11 hover:bg-primary/5 hover:text-primary transition-all">
                                        <User className="h-4 w-4 mr-2" />
                                        <span className="max-w-[120px] truncate">
                                            {profile?.full_name || user.email?.split('@')[0]}
                                        </span>
                                    </Button>
                                </Link>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleSignOut}
                                    className="font-medium text-base px-4 h-11 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" className="cursor-pointer font-semibold text-base px-5 h-11 hover:bg-primary/5 hover:text-primary transition-all">
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button className="cursor-pointer font-semibold text-base px-6 h-11 shadow-lg hover:shadow-xl transition-all">
                                        Sign Up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    <button
                        className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-800 space-y-2 animate-in slide-in-from-top">
                        <Link href="/listings" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start font-semibold text-base h-12">
                                Browse Auctions
                            </Button>
                        </Link>
                        {user ? (
                            <>
                                {(profile?.role === 'seller' || profile?.role === 'admin') && (
                                    <Link href="/listings/create" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="outline" className="w-full justify-start font-semibold text-base h-12 border-2">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Listing
                                        </Button>
                                    </Link>
                                )}
                                {profile?.role === 'admin' && (
                                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="outline" className="w-full justify-start font-semibold text-base h-12 border-2">
                                            <Settings className="h-4 w-4 mr-2" />
                                            Admin
                                        </Button>
                                    </Link>
                                )}
                                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start font-semibold text-base h-12">
                                        <User className="h-4 w-4 mr-2" />
                                        Dashboard
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start font-semibold text-base h-12 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                                    onClick={() => {
                                        handleSignOut();
                                        setMobileMenuOpen(false);
                                    }}
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign Out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start font-semibold text-base h-12">
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                                    <Button className="w-full justify-start font-semibold text-base h-12">
                                        Sign Up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}