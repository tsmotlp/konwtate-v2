'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import PDFViewer from '@/components/pdf-viewer';
import { Paper } from '@prisma/client';
import { NoteCreator } from '@/components/note-creator';

export default function PaperPage() {
    const { paperId } = useParams();
    const [paper, setPaper] = useState<Paper & {
        tags: { tag: { id: string; name: string } }[];
        notes: { note: { id: string; title: string; content: string } }[];
    } | null>(null);
    const [relatedPapers, setRelatedPapers] = useState<(Paper & {
        tags: { tag: { id: string; name: string } }[];
    })[]>([]);
    const [relatedNotes, setRelatedNotes] = useState<{
        id: string;
        title: string;
        content: string;
        tags: { tag: { id: string; name: string } }[];
    }[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // 获取相关论文
    const fetchRelatedPapers = useCallback(async () => {
        try {
            const response = await fetch(`/api/papers/${paperId}/related`);
            const data = await response.json();
            setRelatedPapers(data);
        } catch (error) {
            console.error('Error fetching related papers:', error);
        }
    }, [paperId]);

    const fetchRelatedNotes = useCallback(async () => {
        try {
            const response = await fetch(`/api/papers/${paperId}/related-notes`);
            const data = await response.json();
            setRelatedNotes(data);
        } catch (error) {
            console.error('Error fetching related notes:', error);
        }
    }, [paperId]);

    const refreshPaperData = useCallback(async () => {
        try {
            const response = await fetch(`/api/papers/${paperId}`);
            const data = await response.json();
            setPaper(data);
        } catch (error) {
            console.error('Error refreshing paper data:', error);
        }
    }, [paperId]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/papers/${paperId}`);
                const data = await response.json();
                setPaper(data);
                await Promise.all([
                    fetchRelatedPapers(),
                    fetchRelatedNotes()
                ]);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [paperId, fetchRelatedPapers, fetchRelatedNotes]);

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
                    <p className="text-sm text-gray-500">
                        {new Date(paper.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {paper.tags?.map(({ tag }) => (
                        <span key={tag.name} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                            #{tag.name}
                        </span>
                    ))}
                </div>
            </div>

            {/* 主要内容区域 */}
            <div className="flex-1 px-6 py-4 overflow-hidden">
                <div className="grid grid-cols-3 gap-6 h-full">
                    {/* PDF 查看器区域 */}
                    <Card className="col-span-2 overflow-hidden">
                        <div className="h-full">
                            <PDFViewer paper={paper} />
                        </div>
                    </Card>

                    {/* 右侧信息面板 - 独立滚动 */}
                    <div className="h-full overflow-y-auto pr-2 space-y-4">
                        {/* 相关笔记卡片 */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">相关笔记</h2>
                                <NoteCreator 
                                    paperId={paper.id} 
                                    availableTags={paper.tags?.map(({ tag }) => ({
                                        id: tag.id,
                                        name: tag.name
                                    })) || []} 
                                    redirectToNote={false}
                                    onNoteCreated={refreshPaperData}
                                />
                            </div>
                            <div className="space-y-2">
                                {relatedNotes.length > 0 ? (
                                    relatedNotes.map((note) => (
                                        <div
                                            key={note.id}
                                            onClick={() => router.push(`/notes/${note.id}`)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-2 w-full min-w-0">
                                                <span className="text-gray-500 dark:text-gray-400">📄</span>
                                                <span className="text-sm truncate min-w-0 flex-1 text-emerald-600 dark:text-emerald-400">
                                                    {note.title}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">
                                                {note.content}
                                            </p>
                                            {note.tags && note.tags.length > 0 && (
                                                <div className="flex gap-1.5 flex-wrap mt-1.5">
                                                    {note.tags.slice(0, 3).map(({ tag }) => (
                                                        <span
                                                            key={tag.name}
                                                            className="text-xs px-2 py-0.5 bg-gray-50 dark:bg-gray-800/50 
                                                                text-gray-600 dark:text-gray-300 rounded-lg border 
                                                                border-gray-200 dark:border-gray-700"
                                                        >
                                                            #{tag.name}
                                                        </span>
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
                        </Card>

                        {/* 相关论文卡片 */}
                        <Card className="p-6">
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
                                                        <span
                                                            key={tag.name}
                                                            className="text-xs px-2 py-0.5 bg-gray-50 dark:bg-gray-800/50 
                                                                text-gray-600 dark:text-gray-300 rounded-lg border 
                                                                border-gray-200 dark:border-gray-700"
                                                        >
                                                            #{tag.name}
                                                        </span>
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
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
} 