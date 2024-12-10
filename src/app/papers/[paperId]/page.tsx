'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface Paper {
    id: string;
    title: string;
    abstract: string;
    tags: string[];
    pdfUrl: string;
    lastModified: string;
}

export default function PaperPage() {
    const { paperId } = useParams();
    const [paper, setPaper] = useState<Paper | null>(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="container mx-auto p-6">加载中...</div>;
    if (!paper) return <div className="container mx-auto p-6">论文未找到</div>;

    return (
        <div className="container mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 论文信息卡片 */}
                <Card className="p-6">
                    <h1 className="text-2xl font-bold mb-4">{paper.title}</h1>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {paper.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                                #{tag}
                            </span>
                        ))}
                    </div>

                    <div className="prose dark:prose-invert max-w-none mb-6">
                        <h2 className="text-xl font-semibold mb-2">摘要</h2>
                        <p>{paper.abstract}</p>
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        最后修改: {new Date(paper.lastModified).toLocaleDateString()}
                    </div>
                </Card>

                {/* PDF 查看器 */}
                <Card className="p-6 h-[calc(100vh-12rem)]">
                    <iframe
                        src={paper.pdfUrl}
                        className="w-full h-full"
                        title={paper.title}
                    />
                </Card>
            </div>
        </div>
    );
} 