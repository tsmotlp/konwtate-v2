import { NextResponse } from 'next/server';
import { getRelatedContent } from '@/lib/db/paper';

export async function GET(
    request: Request,
    { params }: { params: { paperId: string } }
) {
    try {
        const paperId = await params.paperId;
        const relatedContent = await getRelatedContent(paperId);
        return NextResponse.json(relatedContent);
    } catch (error) {
        return NextResponse.json(
            { error: "获取相关内容失败" },
            { status: 500 }
        );
    }
} 