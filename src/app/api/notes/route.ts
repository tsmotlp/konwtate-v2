import { NextResponse } from 'next/server';
import { createNote, getAllNotes, searchNotes } from '@/lib/db/note';

// GET 路由 - 获取所有笔记或搜索笔记
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const keyword = searchParams.get('keyword');

        if (keyword) {
            const notes = await searchNotes(keyword);
            return NextResponse.json(notes);
        }

        const notes = await getAllNotes();
        return NextResponse.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        return NextResponse.json(
            { error: "Failed to fetch notes" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, content, tagIds, paperIds } = body;

        // 验证必需的字段
        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        const note = await createNote({
            name,
            content,
            tagIds,
            paperIds
        });

        return NextResponse.json(note, { status: 201 });
    } catch (error) {
        console.error('Error creating note:', error);
        return NextResponse.json(
            { error: "Failed to create note" },
            { status: 500 }
        );
    }
} 