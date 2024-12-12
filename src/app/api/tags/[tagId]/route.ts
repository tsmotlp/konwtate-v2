import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { updateTag, deleteTag } from '@/lib/db/tag';

const prisma = new PrismaClient();

export async function GET(
    request: Request,
    { params }: { params: { tagId: string } }
) {
    try {
        const { tagId } = params;

        // 获取标签相关的所有论文和笔记
        const [papers, notes] = await Promise.all([
            prisma.paper.findMany({
                where: {
                    tags: {
                        some: {
                            tagId
                        }
                    }
                },
                select: {
                    id: true,
                    name: true,
                    url: true,
                    annotations: true,
                    updatedAt: true
                }
            }),
            prisma.note.findMany({
                where: {
                    tags: {
                        some: {
                            tagId
                        }
                    }
                },
                select: {
                    id: true,
                    name: true,
                    content: true,
                    updatedAt: true
                }
            })
        ]);

        // 转换为统一的文档格式
        const documents = [
            ...papers.map(paper => ({
                id: paper.id,
                title: paper.name,
                type: 'paper' as const,
                excerpt: paper.annotations?.slice(0, 200) || '',
                lastModified: paper.updatedAt.toISOString()
            })),
            ...notes.map(note => ({
                id: note.id,
                title: note.name,
                type: 'note' as const,
                excerpt: note.content?.slice(0, 200) || '',
                lastModified: note.updatedAt.toISOString()
            }))
        ].sort((a, b) => 
            new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
        );

        return NextResponse.json({ documents });
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json(
            { error: "Failed to fetch documents" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { tagId: string } }
) {
    try {
        const { tagId } = params;
        const { name } = await request.json();

        if (!name || typeof name !== 'string') {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        const updatedTag = await updateTag(tagId, name);
        return NextResponse.json(updatedTag);
    } catch (error) {
        if (error instanceof Error && error.message === '标签名称已存在') {
            return NextResponse.json(
                { error: "Tag name already exists" },
                { status: 409 }
            );
        }
        console.error('Error updating tag:', error);
        return NextResponse.json(
            { error: "Failed to update tag" },
            { status: 500 }
        );
    }
}

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
            { error: "Failed to delete tag" },
            { status: 500 }
        );
    }
} 