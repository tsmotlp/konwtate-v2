import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { paperId: string } }
) {
    try {
        // 这里替换为实际的数据获取逻辑
        const paper = {
            id: params.paperId,
            title: "示例论文",
            abstract: "这是论文摘要...",
            tags: ["机器学习", "深度学习"],
            pdfUrl: "/sample.pdf", // 替换为实际的 PDF URL
            lastModified: new Date().toISOString()
        };

        return NextResponse.json(paper);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch paper" },
            { status: 500 }
        );
    }
} 