import { NextResponse } from 'next/server';
import { getRelatedNotes } from '@/lib/db/note';

export async function GET(
    request: Request,
    { params }: { params: { paperId: string } }
) {
    try {
        const paperId = params.paperId;
        const relatedNotes = await getRelatedNotes(paperId);
        return NextResponse.json(relatedNotes);
    } catch (error) {
        console.error('Error fetching related notes:', error);
        return NextResponse.json(
            { error: "Failed to fetch related notes" },
            { status: 500 }
        );
    }
}