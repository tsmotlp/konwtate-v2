import { NextResponse } from 'next/server';
import { getNote, updateNote } from '@/lib/db/note';

export async function GET(
    request: Request,
    { params }: { params: { noteId: string } }
) {
    try {
        const note = await getNote(params.noteId);
        if (!note) {
            return new NextResponse('Note not found', { status: 404 });
        }

        // 如果 content 是字符串，尝试解析为 JSON
        if (note.content) {
            try {
                note.content = JSON.parse(note.content);
            } catch (e) {
                console.warn('Failed to parse note content as JSON');
            }
        }

        return NextResponse.json(note);
    } catch (error) {
        console.error('获取笔记失败:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { noteId: string } }
) {
    try {
        const body = await request.json();
        const { content, name, tagIds } = body;

        const note = await updateNote(params.noteId, {
            content,  // updateNote 函数会处理序列化
            name,
            ...(tagIds && { addTagIds: tagIds })
        });

        return NextResponse.json(note);
    } catch (error) {
        console.error('更新笔记失败:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}