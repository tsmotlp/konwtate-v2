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

        // 验证请求体不为空
        if (!body) {
            return NextResponse.json(
                { error: "请求体不能为空" },
                { status: 400 }
            );
        }

        // 如果请求包含 tagIds，则更新标签
        if (body.tagIds) {
            const currentPaper = await getPaper(paperId);
            if (!currentPaper) {
                return NextResponse.json(
                    { error: "论文不存在" },
                    { status: 404 }
                );
            }

            const currentTagIds = currentPaper.tags.map(t => t.tag.id);
            const updatedPaper = await updatePaper(paperId, {
                addTagIds: body.tagIds.filter((id: string) => !currentTagIds.includes(id)),
                removeTagIds: currentTagIds.filter(id => !body.tagIds.includes(id))
            });

            // // 获取更新后的论文（包含标签信息）
            // const paperWithTags = await getPaper(paperId);
            // return NextResponse.json(paperWithTags);
            return NextResponse.json(updatedPaper); 
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