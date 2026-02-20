import { NextResponse } from 'next/server';
import { runAgentCommunicator } from '@phantom-pm/modules';
import * as modulesPkg from '@phantom-pm/modules';

const API_KEY = process.env.PHANTOM_API_KEY || 'phantom-local-dev-key';

export async function POST(request: Request) {
    try {
        // 1. Security Check
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== API_KEY) {
            // In dev mode, we might want to be lenient, but for audit compliance we enforce it.
            // For now, we'll allow it if env is development, but log a warning.
            if (process.env.NODE_ENV === 'development') {
                console.warn('[API] Warning: Unauthorized request allowed in Dev mode.');
            } else {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        const { message } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // 2. Rate Limiting (Simple in-memory for now, ideally Redis)
        // Skipped for now to avoid external deps, but noted in audit.

        console.log(`[API] Chat request: ${message}`);

        const result = await runAgentCommunicator(
            { _: ['chat'], query: message },
            modulesPkg
        );

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('[API] Chat error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
