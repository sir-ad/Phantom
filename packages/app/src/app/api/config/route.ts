
import { NextResponse } from 'next/server';
import { getConfig, PhantomConfig } from '@phantom-pm/core';

export async function GET() {
    try {
        const config = getConfig().get();
        // Return safe config (exclude sensitive if needed, though this is local)
        return NextResponse.json(config);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const configManager = getConfig();

        // Update valid keys
        Object.keys(body).forEach((key) => {
            // simplified update logic, in real app usage validation is needed
            configManager.set(key as keyof PhantomConfig, body[key]);
        });

        return NextResponse.json({ success: true, config: configManager.get() });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
