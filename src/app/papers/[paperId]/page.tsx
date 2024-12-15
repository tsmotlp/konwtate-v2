'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import PDFViewer from '@/components/pdf-viewer';
import { Paper } from '@prisma/client';
import { NoteCreator } from '@/components/note-creator';
import { Toolbar } from '@/components/note/toolbar';
import { NoteEditor } from '@/components/note/editor';
import { Tag } from '@/components/Tag';
import { TagCreator } from '@/components/TagCreator';
import { toast } from 'sonner';

export default function PaperPage() {
    const { paperId } = useParams();
    const [paper, setPaper] = useState<Paper & {
        tags: { tag: { id: string; name: string } }[];
        notes: { note: { id: string; name: string; content: string } }[];
    } | null>(null);
    const [relatedPapers, setRelatedPapers] = useState<(Paper & {
        tags: { tag: { id: string; name: string } }[];
    })[]>([]);
    const [relatedNotes, setRelatedNotes] = useState<{
        id: string;
        name: string;
        content: string;
        tags: { tag: { id: string; name: string } }[];
    }[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [selectedNote, setSelectedNote] = useState<{
        id: string;
        name: string;
        content: string;
    } | null>(null);

    const fetchRelatedContent = useCallback(async () => {
        try {
            const response = await fetch(`/api/papers/${paperId}/related`);
            const data = await response.json();
            setRelatedPapers(data.relatedPapers);
            setRelatedNotes(data.relatedNotes);
        } catch (error) {
            console.error('获取相关内容失败:', error);
        }
    }, [paperId]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/papers/${paperId}`);
                const data = await response.json();
                setPaper(data);
                await fetchRelatedContent();
            } catch (error) {
                console.error('获取数据失败:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [paperId, fetchRelatedContent]);

    const handleNoteClick = (note: {
        id: string;
        name: string;
        content: string;
    }) => {
        setSelectedNote(note);
    };

    const handleRemoveTag = async (tagId: string) => {
        try {
            // 获取当前 paper 的所有 tag IDs，除了要移除的那个
            const currentTagIds = paper?.tags
                .map(({ tag }) => tag.id)
                .filter(id => id !== tagId) || [];

            // 调用 API 更新 paper 的 tags
            const response = await fetch(`/api/papers/${paperId}`, {
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

            // 更新本地 state
            setPaper(prevPaper => {
                if (!prevPaper) return null;
                return {
                    ...prevPaper,
                    tags: prevPaper.tags.filter(({ tag }) => tag.id !== tagId)
                };
            });

            toast.success('标签移除成功');
            
            // 重新获取相关内容
            await fetchRelatedContent();
        } catch (error) {
            console.error('Error removing tag:', error);
            toast.error(error instanceof Error ? error.message : '移除标签失败');
        }
    };

    if (loading) return <div className="container mx-auto p-6">加载中...</div>;
    if (!paper) return <div className="container mx-auto p-6">论文未找到</div>;

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Navbar */}
            <div className="sticky top-0 bg-background z-10 px-6 flex items-center justify-between h-16 border-b border-gray-200 dark:border-gray-800">
                <button onClick={() => router.push('/')} className="text-blue-500 hover:underline">
                    返回主页面
                </button>
                <div className="flex flex-col items-center">
                    <h1 className="text-lg font-bold">{paper.name}</h1>
                </div>
                <div className="w-[100px]"></div>
            </div>

            {/* 主要内容区域 */}
            <div className="flex-1 px-6 py-4 overflow-hidden">
                <div className="grid grid-cols-3 gap-6 h-full">
                    {/* PDF 查看器区域 */}
                    <Card className="col-span-2 overflow-hidden">
                        <PDFViewer paper={paper} />
                    </Card>

                    {/* 右侧面板 - 根据是否选中note显示不同内容 */}
                    <div className="h-full overflow-y-auto pr-2 space-y-4">
                        {/* 论文标签 */}
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold whitespace-nowrap">标签</h2>
                                <div className="w-[120px]">
                                    <TagCreator
                                        paperId={paper.id}
                                        onTagCreated={() => {
                                            // 添加加载状态
                                            setLoading(true);
                                            const fetchData = async () => {
                                                try {
                                                    const response = await fetch(`/api/papers/${paperId}`);
                                                    if (!response.ok) {
                                                        throw new Error("获取论文数据失败");
                                                    }
                                                    const data = await response.json();
                                                    setPaper(data);
                                                    await fetchRelatedContent();
                                                } catch (error) {
                                                    console.error('获取数据失败:', error);
                                                    toast.error("更新论文数据失败");
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
                                {paper.tags?.length > 0 ? (
                                    paper.tags.map(({ tag }) => (
                                        <Tag
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

                        {selectedNote ? (
                            // 显示选中的note编辑器
                            <div className="h-full flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    {/* 左侧标题 */}
                                    <h2 className="text-lg font-semibold truncate max-w-[200px]">{selectedNote.name}</h2>

                                    {/* 中间空白区域 */}
                                    <div className="flex-1"></div>

                                    {/* 右侧按钮组 */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setSelectedNote(null)}
                                            className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 
                                                     dark:bg-gray-800 dark:hover:bg-gray-700"
                                        >
                                            返回相关内容
                                        </button>
                                        <button
                                            onClick={() => router.push(`/notes/${selectedNote.id}`)}
                                            className="px-3 py-1 text-sm rounded-md bg-blue-500 text-white 
                                                     hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                                        >
                                            打开笔记页面
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <Toolbar />
                                    <div className="flex-1 mt-4">
                                        <NoteEditor />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // 显示原来的相关内容
                            <>
                                {/* 相关笔记卡片 */}
                                <Card>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-lg font-semibold">相关笔记</h2>
                                            <NoteCreator
                                                paperId={paper.id}
                                                availableTags={paper.tags?.map(({ tag }) => ({
                                                    id: tag.id,
                                                    name: tag.name
                                                })) || []}
                                                redirectToNote={false}
                                                onNoteCreated={fetchRelatedContent}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            {relatedNotes.length > 0 ? (
                                                relatedNotes.map((note) => (
                                                    <div
                                                        key={note.id}
                                                        onClick={() => handleNoteClick(note)}
                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer group"
                                                    >
                                                        <div className="flex items-center gap-2 w-full min-w-0">
                                                            <span className="text-gray-500 dark:text-gray-400">📄</span>
                                                            <span className="text-sm truncate min-w-0 flex-1 text-emerald-600 dark:text-emerald-400">
                                                                {note.name}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">
                                                            {note.content}
                                                        </p>
                                                        {note.tags && note.tags.length > 0 && (
                                                            <div className="flex gap-1.5 flex-wrap mt-1.5">
                                                                {note.tags.slice(0, 3).map(({ tag }) => (
                                                                    <Tag
                                                                        key={tag.id}
                                                                        id={tag.id}
                                                                        name={tag.name}
                                                                        size="sm"
                                                                        showActions={false}
                                                                    />
                                                                ))}
                                                                {note.tags.length > 3 && (
                                                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                                                        +{note.tags.length - 3}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                                    {paper.tags?.length > 0 ? '暂无相关笔记' : '添加标签以查看相关笔记'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Card>

                                {/* 相关论文卡片 */}
                                <Card>
                                    <div className="p-6">
                                        <h2 className="text-lg font-semibold mb-4">相关论文</h2>
                                        <div className="space-y-2">
                                            {relatedPapers.length > 0 ? (
                                                relatedPapers.map((relatedPaper) => (
                                                    <div
                                                        key={relatedPaper.id}
                                                        onClick={() => router.push(`/papers/${relatedPaper.id}`)}
                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer group"
                                                    >
                                                        <div className="flex items-center gap-2 w-full min-w-0">
                                                            <span className="text-gray-500 dark:text-gray-400">📄</span>
                                                            <span className="text-sm truncate min-w-0 flex-1 text-blue-600 dark:text-blue-400">
                                                                {relatedPaper.name}
                                                            </span>
                                                        </div>
                                                        {relatedPaper.tags && relatedPaper.tags.length > 0 && (
                                                            <div className="flex gap-1.5 flex-wrap mt-1.5">
                                                                {relatedPaper.tags.slice(0, 3).map(({ tag }) => (
                                                                    <Tag
                                                                        key={tag.id}
                                                                        id={tag.id}
                                                                        name={tag.name}
                                                                        size="sm"
                                                                        showActions={false}
                                                                    />
                                                                ))}
                                                                {relatedPaper.tags.length > 3 && (
                                                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                                                        +{relatedPaper.tags.length - 3}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                                    {paper.tags?.length > 0 ? '暂无相关论文' : '添加标签以查看相关论文'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 