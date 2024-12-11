'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import PDFViewer from '@/components/pdf-viewer';

interface Paper {
    id: string;
    title: string;
    abstract: string;
    tags: string[];
    pdfUrl: string;
    lastModified: string;
    relatedNotes?: {
        id: string;
        title: string;
        excerpt: string;
    }[];
    relatedPapers?: {
        id: string;
        title: string;
        tags: string[];
    }[];
}

export default function PaperPage() {
    const { paperId } = useParams();
    const [paper, setPaper] = useState<Paper | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchPaper = async () => {
            try {
                const response = await fetch(`/api/papers/${paperId}`);
                const data = await response.json();
                setPaper(data);
            } catch (error) {
                console.error('Error fetching paper:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPaper();
    }, [paperId]);

    const handleAnnotationChange = (annotations: any) => {
        console.log('Annotations updated:', annotations);
    };

    if (loading) return <div className="container mx-auto p-6">加载中...</div>;
    if (!paper) return <div className="container mx-auto p-6">论文未找到</div>;

    return (
        <div className="mx-auto px-6 pb-6 h-screen flex flex-col">
            {/* Navbar */}
            <div className="flex items-center justify-between mb-6 h-16 border-b border-gray-200 dark:border-gray-800">
                <button onClick={() => router.push('/')} className="text-blue-500 hover:underline">
                    返回主页面
                </button>
                <h1 className="text-lg font-bold">{paper.title}</h1>
                <div className="flex flex-wrap gap-2">
                    {paper.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex-1 grid grid-cols-3 gap-6">
                {/* PDF 查看器和注释区域 */}
                <Card className="col-span-2 p-6 h-full">
                    <PDFViewer
                        pdfUrl={"https://arxiv.org/pdf/1706.03762"}
                        onAnnotationChange={handleAnnotationChange}
                    />
                </Card>

                {/* 论文信息卡片 */}
                <Card className="p-6 h-full overflow-y-auto">
                    {/* 相关笔记 */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-2">相关笔记</h2>
                        <div className="space-y-2">
                            {paper.relatedNotes && paper.relatedNotes.length > 0 ? (
                                paper.relatedNotes.map((note) => (
                                    <div
                                        key={note.id}
                                        className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                                    >
                                        <h3 className="font-medium">{note.title}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {note.excerpt}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">暂无相关笔记</p>
                            )}
                        </div>
                    </div>

                    {/* 相关论文 */}
                    <div>
                        <h2 className="text-lg font-semibold mb-2">相关论文</h2>
                        <div className="space-y-2">
                            {paper.relatedPapers && paper.relatedPapers.length > 0 ? (
                                paper.relatedPapers.map((relatedPaper) => (
                                    <div
                                        key={relatedPaper.id}
                                        className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                                        onClick={() => router.push(`/papers/${relatedPaper.id}`)}
                                    >
                                        <h3 className="font-medium">{relatedPaper.title}</h3>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {relatedPaper.tags.map(tag => (
                                                <span
                                                    key={tag}
                                                    className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">暂无相关论文</p>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
} 