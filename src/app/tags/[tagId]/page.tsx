'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ContentListItem } from '@/components/ContentListItem';
import { Note, Paper, Tag } from '@prisma/client';
import { TagComponent } from '@/components/Tag';

interface TagPageData {
    tag: Tag & {
        _count: {
            papers: number;
            notes: number;
        };
    };
    papers: (Paper & {
        tags: {
            tag: Tag;
        }[];
    })[];
    notes: (Note & {
        tags: {
            tag: Tag;
        }[];
    })[];
}

export default function TagPage() {
    const { tagId } = useParams();
    const [data, setData] = useState<TagPageData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [shouldRefresh, setShouldRefresh] = useState(false);

    const fetchTagData = async () => {
        try {
            const response = await fetch(`/api/tags/${tagId}`);
            if (!response.ok) {
                throw new Error('获取标签数据失败');
            }
            const data = await response.json();
            setData(data);
        } catch (error) {
            console.error('Error fetching tag data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTagData();
    }, [tagId]);

    useEffect(() => {
        if (shouldRefresh) {
            fetchTagData();
            setShouldRefresh(false);
        }
    }, [shouldRefresh]);

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-[200px]">
                    加载中...
                </div>
            </div>
        );
    }

    if (!data?.tag) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-[200px]">
                    标签不存在
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            {/* 顶部导航栏 */}
            <div className="mb-8 flex items-center justify-between">
                <button
                    onClick={() => router.push('/')}
                    className="text-blue-500 hover:underline"
                >
                    返回主页面
                </button>
            </div>

            {/* 标签信息卡片 */}
            <Card className="p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <TagComponent
                            id={data.tag.id}
                            name={data.tag.name}
                            showActions={false}
                        />
                        <div className="flex gap-4 text-sm text-gray-500">
                            <span>论文: {data.tag._count.papers}</span>
                            <span>笔记: {data.tag._count.notes}</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* 内容区域 */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* 论文列表 */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">相关论文</h2>
                    <div className="space-y-2">
                        {data.papers.length > 0 ? (
                            data.papers.map((paper) => (
                                <ContentListItem
                                    key={paper.id}
                                    id={paper.id}
                                    type="paper"
                                    title={paper.name}
                                    tags={paper.tags.map(({ tag }) => tag)}
                                    updatedAt={paper.updatedAt}
                                    onClick={() => router.push(`/papers/${paper.id}`)}
                                    onUpdate={() => setShouldRefresh(true)}
                                />
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">
                                暂无相关论文
                            </p>
                        )}
                    </div>
                </Card>

                {/* 笔记列表 */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">相关笔记</h2>
                    <div className="space-y-2">
                        {data.notes.length > 0 ? (
                            data.notes.map((note) => (
                                <ContentListItem
                                    key={note.id}
                                    id={note.id}
                                    type="note"
                                    title={note.name}
                                    tags={note.tags.map(({ tag }) => tag)}
                                    updatedAt={note.updatedAt}
                                    onClick={() => router.push(`/notes/${note.id}`)}
                                    onUpdate={() => setShouldRefresh(true)}
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
    );
} 