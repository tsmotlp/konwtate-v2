import { NextResponse } from 'next/server';
import { getNote, updateNote, deleteNote } from '@/lib/db/note';

export async function GET(
    request: Request,
    { params }: { params: { noteId: string } }
) {
    const noteId = await params.noteId;

    try {
        const note = await getNote(noteId);

        if (!note) {
            return NextResponse.json(
                { error: "Note not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(note);
    } catch (error) {
        console.error('Error fetching note:', error);
        return NextResponse.json(
            { error: "Failed to fetch note" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { noteId: string } }
) {
    try {
        const noteId = params.noteId;
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
            const currentNote = await getNote(noteId);
            if (!currentNote) {
                return NextResponse.json(
                    { error: "笔记不存在" },
                    { status: 404 }
                );
            }

            const currentTagIds = currentNote.tags.map(t => t.tag.id);
            const updatedNote = await updateNote(noteId, {
                addTagIds: body.tagIds.filter((id: string) => !currentTagIds.includes(id)),
                removeTagIds: currentTagIds.filter(id => !body.tagIds.includes(id))
            });

            // 获取更新后的笔记（包含标签信息）
            // const noteWithTags = await getNote(noteId);
            // return NextResponse.json(noteWithTags);
            return NextResponse.json(updatedNote);
        }

        // 处理其他字段的更新
        const updatedNote = await updateNote(noteId, body);
        return NextResponse.json(updatedNote);
    } catch (error) {
        console.error('更新笔记失败:', error);
        return NextResponse.json(
            { error: "更新笔记失败" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { noteId: string } }
) {
    const noteId = await params.noteId;

    try {
        await deleteNote(noteId);
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting note:', error);
        return NextResponse.json(
            { error: "Failed to delete note" },
            { status: 500 }
        );
    }
}