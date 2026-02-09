import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { full_name, role } = body;

        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();

        if (existingProfile) {
            const { error: updateError } = await ((supabase.from('profiles') as any)
                .update({
                    full_name,
                    role,
                })
                .eq('id', user.id));

            if (updateError) {
                return NextResponse.json(
                    { error: updateError.message },
                    { status: 400 }
                );
            }

            return NextResponse.json({ success: true, message: 'Profile updated' });
        }

        const profileData: any = {
            id: user.id,
            email: user.email || '',
            full_name,
            role: role || 'buyer',
        };

        const { error: insertError } = await ((supabase.from('profiles') as any)
            .insert(profileData));

        if (insertError) {
            console.error('Profile creation error:', insertError);
            return NextResponse.json(
                { error: insertError.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true, message: 'Profile created' });
    } catch (error: any) {
        console.error('Profile API error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}