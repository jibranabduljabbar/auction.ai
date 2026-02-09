import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount / 100);
}

export function calculateBidIncrement(currentBid: number): number {
    if (currentBid < 1000) return 50;
    if (currentBid < 5000) return 100;
    if (currentBid < 10000) return 250;
    if (currentBid < 25000) return 500;
    if (currentBid < 50000) return 1000;
    if (currentBid < 100000) return 2500;
    if (currentBid < 250000) return 5000;
    return 10000;
}

export function calculateNextMinBid(currentBid: number): number {
    return currentBid + calculateBidIncrement(currentBid);
}

export function calculatePlatformFee(amount: number): number {
    const feePercentage = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '5');
    return Math.round(amount * (feePercentage / 100));
}

export function calculateSellerPayout(amount: number): number {
    return amount - calculatePlatformFee(amount);
}