'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Gavel, User, Mail, Lock, Briefcase } from 'lucide-react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        role: 'buyer' as 'buyer' | 'seller',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        role: formData.role,
                    },
                },
            });

            if (authError) {
                console.error('Auth error:', authError);
                throw authError;
            }

            if (!authData.user) {
                throw new Error('User creation failed. Please try again.');
            }

            await new Promise(resolve => setTimeout(resolve, 1500));

            const profileResponse = await fetch('/api/profiles/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    full_name: formData.fullName,
                    role: formData.role,
                }),
            });

            if (!profileResponse.ok) {
                const errorData = await profileResponse.json();
                throw new Error(errorData.error || 'Profile creation failed. Please try logging in.');
            }

            router.push('/dashboard');
            router.refresh();
        } catch (error: any) {
            setError(error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4">
            <Card className="w-full max-w-md border-2 shadow-2xl">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit">
                        <Gavel className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-3xl mb-2">Create Account</CardTitle>
                        <CardDescription className="text-base">
                            Join auction.ai to start bidding or selling
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-destructive/10 border-2 border-destructive/20 text-destructive p-4 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-base font-semibold flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Full Name
                            </Label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                                className="h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-base font-semibold flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-base font-semibold flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                minLength={6}
                                className="h-12"
                            />
                            <p className="text-xs text-gray-500">Minimum 6 characters</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-base font-semibold flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                I want to
                            </Label>
                            <Select
                                id="role"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'buyer' | 'seller' })}
                                className="h-12 bg-[#1b2636]"
                            >
                                <option value="buyer">Buy Items (Bidder)</option>
                                <option value="seller">Sell Items (Seller)</option>
                            </Select>
                        </div>
                        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                            {loading ? 'Creating account...' : 'Create Account'}
                        </Button>
                        <div className="text-center text-sm pt-2">
                            <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
                            <Link href="/login" className="text-primary font-semibold hover:underline">
                                Sign in
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}