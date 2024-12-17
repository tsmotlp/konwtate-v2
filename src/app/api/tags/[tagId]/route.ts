import { NextResponse } from 'next/server';
import { getTagStats, updateTag, deleteTag } from '@/lib/db/tag';

export async function GET(
    request: Request,
    { params }: { params: { tagId: string } }
) {
    try {
        const { tagId } = params;
        const data = await getTagStats(tagId);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching tag data:', error);
        return NextResponse.json(
            { error: "获取标签数据失败" },
            { status: 500 }
        );
    }
}

// 更新标签名称
export async function PATCH(
    request: Request,
    { params }: { params: { tagId: string } }
) {
    try {
        const { tagId } = params;
        const { name } = await request.json();

        if (!name || typeof name !== 'string') {
            return NextResponse.json(
                { error: "标签名称不能为空" },
                { status: 400 }
            );
        }

        const updatedTag = await updateTag(tagId, name);
        return NextResponse.json(updatedTag);
    } catch (error) {
        if (error instanceof Error && error.message === '标签名称已存在') {
            return NextResponse.json(
                { error: "标签名称已存在" },
                { status: 409 }
            );
        }
        console.error('Error updating tag:', error);
        return NextResponse.json(
            { error: "更新标签失败" },
            { status: 500 }
        );
    }
}

// 删除标签
export async function DELETE(
    request: Request,
    { params }: { params: { tagId: string } }
) {
    try {
        const { tagId } = params;
        await deleteTag(tagId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting tag:', error);
        return NextResponse.json(
            { error: "删除标签失败" },
            { status: 500 }
        );
    }
} 