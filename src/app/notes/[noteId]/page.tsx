'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { NoteEditor } from '@/components/note/editor';
import { Toolbar } from '@/components/note/toolbar';

interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];
    lastModified: string;
    references: string[];
    backlinks: string[];
}

export default function NotePage() {
    const { noteId } = useParams();
    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const response = await fetch(`/api/notes/${noteId}`);
                const data = await response.json();
                setNote(data);
            } catch (error) {
                console.error('Error fetching note:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNote();
    }, [noteId]);

    if (loading) return <div className="container mx-auto p-6">加载中...</div>;
    if (!note) return <div className="container mx-auto p-6">笔记未找到</div>;

    return (
        <div className="min-h-screen bg-[#FAFBFD]">
            <Toolbar />
            <NoteEditor />
        </div>
    );
} 