import { NextResponse } from 'next/server';
import { createTag, getAllTags, searchTags } from '@/lib/db/tag';

// GET 路由 - 获取所有标签或搜索标签
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const keyword = searchParams.get('keyword');

        if (keyword) {
            const tags = await searchTags(keyword);
            return NextResponse.json(tags);
        }

        const tags = await getAllTags();
        return NextResponse.json(tags);
    } catch (error) {
        console.error('Error fetching tags:', error);
        return NextResponse.json(
            { error: "Failed to fetch tags" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, paperId, noteId } = body;

        if (!name) {
            return NextResponse.json(
                { error: "标签名称不能为空" },
                { status: 400 }
            );
        }

        if (name.length > 50) {
            return NextResponse.json(
                { error: "标签名称不能超过50个字符" },
                { status: 400 }
            );
        }

        const tag = await createTag({
            name,
            paperId,
            noteId
        });

        return NextResponse.json({ message: "标签创建成功", tag }, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.message === '标签名称已存在') {
            return NextResponse.json(
                { error: "标签名称已存在" },
                { status: 409 }
            );
        }
        console.error('Error creating tag:', error);
        return NextResponse.json(
            { error: "创建标签失败" },
            { status: 500 }
        );
    }
} 