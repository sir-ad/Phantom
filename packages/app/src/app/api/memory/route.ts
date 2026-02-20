
import { NextResponse } from 'next/server';
import { getMemoryManager } from '@phantom-pm/core';

export async function GET() {
    try {
        const manager = await getMemoryManager();
        const files = await manager.listEntries();
        return NextResponse.json({ files });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { filename, content } = body;

        if (!filename || !content) {
            return NextResponse.json({ error: 'Filename and content required' }, { status: 400 });
        }

        const manager = await getMemoryManager();
        await manager.writeEntry(filename, content);

        return NextResponse.json({ success: true, filename });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
