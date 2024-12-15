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
    const noteId = await params.noteId;

    try {
        const body = await request.json();
        const {
            name,
            content,
            addTagIds,
            removeTagIds,
            addPaperIds,
            removePaperIds
        } = body;

        const updatedNote = await updateNote(noteId, {
            name,
            content,
            addTagIds,
            removeTagIds,
            addPaperIds,
            removePaperIds
        });

        return NextResponse.json(updatedNote);
    } catch (error) {
        console.error('Error updating note:', error);
        return NextResponse.json(
            { error: "Failed to update note" },
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