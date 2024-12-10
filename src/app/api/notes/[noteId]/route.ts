import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { noteId: string } }
) {
    try {
        // 这里替换为实际的数据获取逻辑
        const note = {
            id: params.noteId,
            title: "示例笔记",
            content: "这是笔记的内容...",
            tags: ["标签1", "标签2"],
            lastModified: new Date().toISOString(),
            references: [],
            backlinks: []
        };

        return NextResponse.json(note);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch note" },
            { status: 500 }
        );
    }
} 