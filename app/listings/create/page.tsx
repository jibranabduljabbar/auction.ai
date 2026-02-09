'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Image, DollarSign, Calendar, Tag, Package } from 'lucide-react';

const CATEGORIES = [
    'Electronics',
    'Collectibles',
    'Art',
    'Jewelry',
    'Fashion',
    'Home & Garden',
    'Sports',
    'Toys & Games',
    'Books',
    'Other',
];

export default function CreateListingPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startingPrice: '',
        reservePrice: '',
        category: '',
        condition: 'used' as 'new' | 'used' | 'refurbished',
        startTime: '',
        endTime: '',
        imageUrls: '',
        softCloseExtension: '300',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('You must be logged in');

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .maybeSingle();

            const profileData = profile as any;
            if (!profileData) {
                throw new Error('Profile not found. Please complete your registration.');
            }
            if (profileData.role !== 'seller' && profileData.role !== 'admin') {
                throw new Error('Only sellers can create listings');
            }

            const imageUrlsArray = formData.imageUrls
                .split(',')
                .map(url => url.trim())
                .filter(url => url.length > 0);

            if (imageUrlsArray.length === 0) {
                throw new Error('At least one image URL is required');
            }

            const startingPrice = Math.round(parseFloat(formData.startingPrice) * 100);
            const reservePrice = formData.reservePrice
                ? Math.round(parseFloat(formData.reservePrice) * 100)
                : null;

            if (startingPrice <= 0) {
                throw new Error('Starting price must be greater than 0');
            }

            const startTime = new Date(formData.startTime);
            const endTime = new Date(formData.endTime);

            if (endTime <= startTime) {
                throw new Error('End time must be after start time');
            }

            if (endTime <= new Date()) {
                throw new Error('End time must be in the future');
            }

            const insertData: any = {
                seller_id: user.id,
                title: formData.title,
                description: formData.description,
                starting_price: startingPrice,
                current_price: startingPrice,
                reserve_price: reservePrice,
                image_urls: imageUrlsArray,
                category: formData.category,
                condition: formData.condition,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                status: 'active',
                soft_close_extension: parseInt(formData.softCloseExtension),
            };
            const { error: insertError } = await (supabase.from('listings') as any).insert(insertData);

            if (insertError) throw insertError;

            router.push('/dashboard/listings');
        } catch (error: any) {
            setError(error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-white rounded-lg">
                            <Plus className="h-6 w-6 text-black" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Create New Listing</h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                List an item for auction
                            </p>
                        </div>
                    </div>
                </div>

                <Card className="border-2 shadow-xl">
                    <CardHeader>
                        <CardTitle>Listing Details</CardTitle>
                        <CardDescription>Fill in all the information about your item</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-destructive/10 border-2 border-destructive/20 text-destructive p-4 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-base font-semibold">Title *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    placeholder="e.g., Vintage Rolex Watch"
                                    className="h-12"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-base font-semibold">Description *</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    rows={6}
                                    placeholder="Describe your item in detail..."
                                    className="resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="startingPrice" className="text-base font-semibold flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        Starting Price ($) *
                                    </Label>
                                    <Input
                                        id="startingPrice"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={formData.startingPrice}
                                        onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                                        required
                                        className="h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reservePrice" className="text-base font-semibold flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        Reserve Price ($) - Optional
                                    </Label>
                                    <Input
                                        id="reservePrice"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.reservePrice}
                                        onChange={(e) => setFormData({ ...formData, reservePrice: e.target.value })}
                                        className="h-12"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-base font-semibold flex items-center gap-2">
                                        <Tag className="h-4 w-4" />
                                        Category *
                                    </Label>
                                    <Select
                                        id="category"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        required
                                        className="h-12"
                                    >
                                        <option value="">Select a category</option>
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="condition" className="text-base font-semibold flex items-center gap-2">
                                        <Package className="h-4 w-4" />
                                        Condition *
                                    </Label>
                                    <Select
                                        id="condition"
                                        value={formData.condition}
                                        onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                                        required
                                        className="h-12"
                                    >
                                        <option value="new">New</option>
                                        <option value="used">Used</option>
                                        <option value="refurbished">Refurbished</option>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="startTime" className="text-base font-semibold flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Start Time *
                                    </Label>
                                    <Input
                                        id="startTime"
                                        type="datetime-local"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        required
                                        className="h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="endTime" className="text-base font-semibold flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        End Time *
                                    </Label>
                                    <Input
                                        id="endTime"
                                        type="datetime-local"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        required
                                        className="h-12"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="imageUrls" className="text-base font-semibold flex items-center gap-2">
                                    <Image className="h-4 w-4" />
                                    Image URLs (comma-separated) *
                                </Label>
                                <Input
                                    id="imageUrls"
                                    value={formData.imageUrls}
                                    onChange={(e) => setFormData({ ...formData, imageUrls: e.target.value })}
                                    required
                                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                                    className="h-12"
                                />
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Enter image URLs separated by commas. You can upload images to a service like Imgur or Cloudinary.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="softCloseExtension" className="text-base font-semibold">
                                    Soft-Close Extension (seconds)
                                </Label>
                                <Input
                                    id="softCloseExtension"
                                    type="number"
                                    min="0"
                                    value={formData.softCloseExtension}
                                    onChange={(e) => setFormData({ ...formData, softCloseExtension: e.target.value })}
                                    className="h-12"
                                />
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    If a bid is placed within this many seconds before the auction ends, the auction will be extended.
                                    Default: 300 seconds (5 minutes).
                                </p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    className="flex-1 h-12"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1 h-12 text-base font-semibold" disabled={loading}>
                                    {loading ? 'Creating Listing...' : 'Create Listing'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}