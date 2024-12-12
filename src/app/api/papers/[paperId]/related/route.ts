import { NextResponse } from 'next/server';
import { getRelatedPapers } from '@/lib/db/paper';

export async function GET(
    request: Request,
    { params }: { params: { paperId: string } }
) {
    try {
        const paperId = params.paperId;
        const relatedPapers = await getRelatedPapers(paperId);
        return NextResponse.json(relatedPapers);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch related papers" },
            { status: 500 }
        );
    }
} 