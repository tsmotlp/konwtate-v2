'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { NoteEditor } from '@/components/note/editor';
import { Toolbar } from '@/components/note/toolbar';
import { TagComponent } from '@/components/Tag';
import { TagCreator } from '@/components/TagCreator';
import { toast } from 'sonner';
import { Paper, Tag, Note } from '@prisma/client';
import { ContentListItem } from '@/components/ContentListItem';


export default function NotePage() {
    const { noteId } = useParams();
    const [note, setNote] = useState<Note & {
        tags: {
            tag: Tag;
        }[];
    } | null>(null);
    const [relatedPapers, setRelatedPapers] = useState<(Paper & {
        tags: {
            tag: Tag;
        }[];
    })[]>([]);
    const [relatedNotes, setRelatedNotes] = useState<(Note & {
        tags: {
            tag: Tag;
        }[];
    })[]>([]);
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

    useEffect(() => {
        fetchData();
    }, [noteId, fetchRelatedContent]);

    const handleRemoveTag = async (tagId: string) => {
        try {
            const currentTagIds = note?.tags
                .map(({ tag }) => tag.id)
                .filter(id => id !== tagId) || [];

            const response = await fetch(`/api/notes/${noteId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tagIds: currentTagIds
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            setNote(prevNote => {
                if (!prevNote) return null;
                return {
                    ...prevNote,
                    tags: prevNote.tags.filter(({ tag }) => tag.id !== tagId)
                };
            });

            toast.success('标签移除成功');
            await fetchData();
            await fetchRelatedContent();
        } catch (error) {
            console.error('Error removing tag:', error);
            toast.error(error instanceof Error ? error.message : '移除标签失败');
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
                            <NoteEditor
                                initialContent={note.content ? JSON.parse(note.content) : ''}
                                noteId={note.id}
                                containerHeight="calc(100vh - 136px)"
                            />
                        </div>
                    </div>

                    {/* 右侧信息面板 */}
                    <div className="h-full overflow-y-auto pr-2 space-y-4">
                        {/* 笔记标签卡片 */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold whitespace-nowrap">标签</h2>
                                <div className="w-[120px]">
                                    <TagCreator
                                        noteId={note.id}
                                        onTagCreated={() => {
                                            // 添加加载状态
                                            setLoading(true);
                                            const fetchData = async () => {
                                                try {
                                                    const response = await fetch(`/api/notes/${noteId}`);
                                                    if (!response.ok) {
                                                        throw new Error("获取笔记数据失败");
                                                    }
                                                    const data = await response.json();
                                                    setNote(data);
                                                    await fetchRelatedContent();
                                                } catch (error) {
                                                    console.error('获取数据失败:', error);
                                                    toast.error("更新笔记数据失败");
                                                } finally {
                                                    setLoading(false);
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
                                        <TagComponent
                                            key={tag.id}
                                            id={tag.id}
                                            name={tag.name}
                                            size="sm"
                                            showActions={true}
                                            onRemove={() => handleRemoveTag(tag.id)}
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
                                        <ContentListItem
                                            key={paper.id}
                                            id={paper.id}
                                            type="paper"
                                            title={paper.name}
                                            tags={paper.tags.map(({ tag }) => tag)}
                                            updatedAt={paper.updatedAt}
                                            onClick={() => router.push(`/papers/${paper.id}`)}
                                            onUpdate={fetchRelatedContent}
                                        />
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
                                        <ContentListItem
                                            key={relatedNote.id}
                                            id={relatedNote.id}
                                            type="note"
                                            title={relatedNote.name}
                                            tags={relatedNote.tags.map(({ tag }) => tag)}
                                            updatedAt={relatedNote.updatedAt}
                                            onClick={() => router.push(`/notes/${relatedNote.id}`)}
                                            onUpdate={fetchRelatedContent}
                                        />
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