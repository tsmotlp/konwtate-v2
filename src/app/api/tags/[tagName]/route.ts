import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { tagName: string } }
) {
    try {
        // 这里替换为实际的数据获取逻辑
        const documents = [
            {
                id: "1",
                title: "示例论文1",
                type: "paper",
                excerpt: "这是一篇示例论文...",
                lastModified: new Date().toISOString()
            },
            {
                id: "2",
                title: "示例笔记1",
                type: "note",
                excerpt: "这是一篇示例笔记...",
                lastModified: new Date().toISOString()
            }
        ];

        return NextResponse.json({ documents });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch documents" },
            { status: 500 }
        );
    }
} 