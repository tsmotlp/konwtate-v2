import { NextResponse } from 'next/server';
import { getPaper, updatePaper, deletePaper } from '@/lib/db/paper';

// GET 路由
export async function GET(
    request: Request,
    { params }: { params: { paperId: string } }
) {
    const paperId = params.paperId;
    try {
        const paper = await getPaper(paperId);
        if (!paper) {
            return NextResponse.json(
                { error: "Paper not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(paper);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch paper" },
            { status: 500 }
        );
    }
}

// PATCH 路由
export async function PATCH(
    request: Request,
    { params }: { params: { paperId: string } }
) {
    try {
        const paperId = params.paperId;
        const body = await request.json();

        // 如果请求包含 tagIds，则更新标签
        if (body.tagIds) {
            const updatedPaper = await updatePaper(paperId, {
                // 将新的标签 ID 数组设置为要添加的标签
                addTagIds: body.tagIds,
                // 获取当前论文的所有标签，并将不在新数组中的标签设置为要移除的标签
                removeTagIds: (await getPaper(paperId))?.tags
                    .map(t => t.tagId)
                    .filter(id => !body.tagIds.includes(id)) || []
            });

            // 获取更新后的论文（包含标签信息）
            const paperWithTags = await getPaper(paperId);
            return NextResponse.json(paperWithTags);
        }

        // 处理其他字段的更新
        const updatedPaper = await updatePaper(paperId, body);
        return NextResponse.json(updatedPaper);
    } catch (error) {
        console.error('更新论文失败:', error);
        return NextResponse.json(
            { error: "更新论文失败" },
            { status: 500 }
        );
    }
}

// DELETE 路由
export async function DELETE(
    request: Request,
    { params }: { params: { paperId: string } }
) {
    try {
        const paperId = params.paperId;
        await deletePaper(paperId);
        return NextResponse.json({ message: "Paper deleted successfully" });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete paper" },
            { status: 500 }
        );
    }
} 