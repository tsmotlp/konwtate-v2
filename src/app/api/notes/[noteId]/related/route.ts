import { NextResponse } from 'next/server';
import { getRelatedContent } from '@/lib/db/note';

export async function GET(
    request: Request,
    { params }: { params: { noteId: string } }
) {
    try {
        const noteId = await params.noteId;
        const relatedContent = await getRelatedContent(noteId);
        return NextResponse.json(relatedContent);
    } catch (error) {
        return NextResponse.json(
            { error: "获取相关内容失败" },
            { status: 500 }
        );
    }
}