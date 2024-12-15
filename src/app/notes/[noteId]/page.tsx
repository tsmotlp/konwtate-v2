'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { NoteEditor } from '@/components/note/editor';
import { Toolbar } from '@/components/note/toolbar';
import { Tag } from '@/components/Tag';
import { TagCreator } from '@/components/TagCreator';
import { toast } from 'sonner';

interface Note {
    id: string;
    name: string;
    content: string;
    tags: { tag: { id: string; name: string } }[];
    updatedAt: string;
}

export default function NotePage() {
    const { noteId } = useParams();
    const [note, setNote] = useState<Note | null>(null);
    const [relatedPapers, setRelatedPapers] = useState<any[]>([]);
    const [relatedNotes, setRelatedNotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchRelatedContent = useCallback(async () => {
        try {
            const response = await fetch(`/api/notes/${noteId}/related`);
            const data = await response.json();
            setRelatedPapers(data.relatedPapers);
            setRelatedNotes(data.relatedNotes);
        } catch (error) {
            console.error('获取相关内容失败:', error);
        }
    }, [noteId]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/notes/${noteId}`);
                const data = await response.json();
                setNote(data);
                await fetchRelatedContent();
            } catch (error) {
                console.error('获取笔记失败:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [noteId, fetchRelatedContent]);

    const handleDeleteTag = async (tagId: string) => {
        try {
            const response = await fetch(`/api/tags/${tagId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            toast.success(data.message || '标签删除成功');
        } catch (error) {
            console.error('Error deleting tag:', error);
            toast.error(error instanceof Error ? error.message : '删除标签失败');
        }
    };

    if (loading) return <div className="container mx-auto p-6">加载中...</div>;
    if (!note) return <div className="container mx-auto p-6">笔记未找到</div>;

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* 顶部导航栏 */}
            <div className="sticky top-0 bg-background z-10 px-6 flex items-center justify-between h-16 border-b border-gray-200 dark:border-gray-800">
                <button onClick={() => router.push('/')} className="text-blue-500 hover:underline">
                    返回主页面
                </button>
                <div className="flex flex-col items-center">
                    <h1 className="text-lg font-bold">{note.name}</h1>
                    <p className="text-sm text-gray-500">
                        {new Date(note.updatedAt).toLocaleDateString('zh-CN')}
                    </p>
                </div>
                <div className="w-[100px]"></div>
            </div>

            {/* 主要内容区域 */}
            <div className="flex-1 px-6 py-4 overflow-hidden">
                <div className="grid lg:grid-cols-3 grid-cols-1 gap-6 h-full">
                    {/* 编辑器区域 */}
                    <div className="lg:col-span-2 flex flex-col gap-y-2 min-w-0 w-full">
                        <Toolbar />
                        <div className="flex-1 w-full">
                            <NoteEditor />
                        </div>
                    </div>

                    {/* 右侧信息面板 */}
                    <div className="h-full overflow-y-auto pr-2 space-y-4">
                        {/* 笔记标签卡片 */}
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold whitespace-nowrap">标签</h2>
                                <div className="w-[120px]">
                                    <TagCreator
                                        noteId={note.id}
                                        onTagCreated={() => {
                                            // 重新获取笔记数据以更新标签
                                            const fetchData = async () => {
                                                try {
                                                    const response = await fetch(`/api/notes/${noteId}`);
                                                    const data = await response.json();
                                                    setNote(data);
                                                    await fetchRelatedContent();
                                                } catch (error) {
                                                    console.error('获取数据失败:', error);
                                                }
                                            };
                                            fetchData();
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {note.tags?.length > 0 ? (
                                    note.tags.map(({ tag }) => (
                                        <Tag
                                            key={tag.id}
                                            id={tag.id}
                                            name={tag.name}
                                            onDelete={() => handleDeleteTag(tag.id)}
                                        />
                                    ))
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">暂无标签</p>
                                )}
                            </div>
                        </Card>

                        {/* 相关论文卡片 */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4">相关论文</h2>
                            <div className="space-y-2">
                                {relatedPapers.length > 0 ? (
                                    relatedPapers.map((paper) => (
                                        <div
                                            key={paper.id}
                                            onClick={() => router.push(`/papers/${paper.id}`)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-2 w-full min-w-0">
                                                <span className="text-gray-500">📄</span>
                                                <span className="text-sm text-blue-600 truncate min-w-0 flex-1">
                                                    {paper.name}
                                                </span>
                                            </div>
                                            {paper.tags && paper.tags.length > 0 && (
                                                <div className="flex gap-1.5 flex-wrap mt-1.5">
                                                    {paper.tags.slice(0, 3).map(({ tag }: { tag: { id: string; name: string } }) => (
                                                        <Tag
                                                            key={tag.id}
                                                            id={tag.id}
                                                            name={tag.name}
                                                            size="sm"
                                                        />
                                                    ))}
                                                    {paper.tags.length > 3 && (
                                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                                            +{paper.tags.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-4">
                                        暂无相关论文
                                    </p>
                                )}
                            </div>
                        </Card>

                        {/* 相关笔记卡片 */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4">相关笔记</h2>
                            <div className="space-y-2">
                                {relatedNotes.length > 0 ? (
                                    relatedNotes.map((relatedNote) => (
                                        <div
                                            key={relatedNote.id}
                                            onClick={() => router.push(`/notes/${relatedNote.id}`)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-2 w-full min-w-0">
                                                <span className="text-gray-500">📝</span>
                                                <span className="text-sm text-emerald-600 truncate min-w-0 flex-1">
                                                    {relatedNote.name}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
                                                {relatedNote.content}
                                            </p>
                                            {relatedNote.tags && relatedNote.tags.length > 0 && (
                                                <div className="flex gap-1.5 flex-wrap mt-1.5">
                                                    {relatedNote.tags.slice(0, 3).map(({ tag }: { tag: { id: string; name: string } }) => (
                                                        <Tag
                                                            key={tag.id}
                                                            id={tag.id}
                                                            name={tag.name}
                                                            size="sm"
                                                        />
                                                    ))}
                                                    {relatedNote.tags.length > 3 && (
                                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                                            +{relatedNote.tags.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-4">
                                        暂无相关笔记
                                    </p>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
} 