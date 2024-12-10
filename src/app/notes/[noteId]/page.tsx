'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

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
        <div className="container mx-auto p-6">
            <Card className="p-6">
                <h1 className="text-2xl font-bold mb-4">{note.title}</h1>

                <div className="flex flex-wrap gap-2 mb-4">
                    {note.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                            #{tag}
                        </span>
                    ))}
                </div>

                <div className="prose dark:prose-invert max-w-none mb-6">
                    {note.content}
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                    最后修改: {new Date(note.lastModified).toLocaleDateString()}
                </div>
            </Card>
        </div>
    );
} 