import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        return (
            <button
                className={cn(
                    'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]',
                    {
                        'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg': variant === 'default',
                        'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md': variant === 'destructive',
                        'border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm': variant === 'outline',
                        'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
                        'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
                        'text-primary underline-offset-4 hover:underline': variant === 'link',
                    },
                    {
                        'h-10 px-4 py-2': size === 'default',
                        'h-9 rounded-md px-3 text-xs': size === 'sm',
                        'h-12 rounded-lg px-8 text-base': size === 'lg',
                        'h-10 w-10': size === 'icon',
                    },
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button };