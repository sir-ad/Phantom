
import { NextResponse } from 'next/server';
import { getMemoryManager } from '@phantom-pm/core';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const decodedId = decodeURIComponent(params.id);
        const manager = await getMemoryManager();
        const entry = await manager.readEntry(decodedId);

        if (!entry) {
            return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
        }

        return NextResponse.json(entry);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
