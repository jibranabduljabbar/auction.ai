export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    full_name: string | null;
                    role: 'buyer' | 'seller' | 'admin';
                    stripe_account_id: string | null;
                    stripe_account_onboarding_complete: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    full_name?: string | null;
                    role?: 'buyer' | 'seller' | 'admin';
                    stripe_account_id?: string | null;
                    stripe_account_onboarding_complete?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    full_name?: string | null;
                    role?: 'buyer' | 'seller' | 'admin';
                    stripe_account_id?: string | null;
                    stripe_account_onboarding_complete?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            listings: {
                Row: {
                    id: string;
                    seller_id: string;
                    title: string;
                    description: string;
                    starting_price: number;
                    current_price: number;
                    reserve_price: number | null;
                    image_urls: string[];
                    category: string;
                    condition: 'new' | 'used' | 'refurbished';
                    start_time: string;
                    end_time: string;
                    status: 'draft' | 'active' | 'ended' | 'cancelled';
                    winner_id: string | null;
                    soft_close_extension: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    seller_id: string;
                    title: string;
                    description: string;
                    starting_price: number;
                    current_price: number;
                    reserve_price?: number | null;
                    image_urls: string[];
                    category: string;
                    condition?: 'new' | 'used' | 'refurbished';
                    start_time: string;
                    end_time: string;
                    status?: 'draft' | 'active' | 'ended' | 'cancelled';
                    winner_id?: string | null;
                    soft_close_extension?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    seller_id?: string;
                    title?: string;
                    description?: string;
                    starting_price?: number;
                    current_price?: number;
                    reserve_price?: number | null;
                    image_urls?: string[];
                    category?: string;
                    condition?: 'new' | 'used' | 'refurbished';
                    start_time?: string;
                    end_time?: string;
                    status?: 'draft' | 'active' | 'ended' | 'cancelled';
                    winner_id?: string | null;
                    soft_close_extension?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            bids: {
                Row: {
                    id: string;
                    listing_id: string;
                    bidder_id: string;
                    amount: number;
                    is_winning: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    listing_id: string;
                    bidder_id: string;
                    amount: number;
                    is_winning?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    listing_id?: string;
                    bidder_id?: string;
                    amount?: number;
                    is_winning?: boolean;
                    created_at?: string;
                };
            };
            transactions: {
                Row: {
                    id: string;
                    listing_id: string;
                    buyer_id: string;
                    seller_id: string;
                    amount: number;
                    platform_fee: number;
                    seller_payout: number;
                    stripe_payment_intent_id: string | null;
                    stripe_transfer_id: string | null;
                    status: 'pending' | 'completed' | 'failed' | 'refunded';
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    listing_id: string;
                    buyer_id: string;
                    seller_id: string;
                    amount: number;
                    platform_fee: number;
                    seller_payout: number;
                    stripe_payment_intent_id?: string | null;
                    stripe_transfer_id?: string | null;
                    status?: 'pending' | 'completed' | 'failed' | 'refunded';
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    listing_id?: string;
                    buyer_id?: string;
                    seller_id?: string;
                    amount?: number;
                    platform_fee?: number;
                    seller_payout?: number;
                    stripe_payment_intent_id?: string | null;
                    stripe_transfer_id?: string | null;
                    status?: 'pending' | 'completed' | 'failed' | 'refunded';
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            user_role: 'buyer' | 'seller' | 'admin';
            listing_status: 'draft' | 'active' | 'ended' | 'cancelled';
            transaction_status: 'pending' | 'completed' | 'failed' | 'refunded';
            item_condition: 'new' | 'used' | 'refurbished';
        };
    };
}