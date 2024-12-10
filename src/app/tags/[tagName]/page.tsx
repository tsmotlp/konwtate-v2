'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface Document {
    id: string;
    title: string;
    type: 'paper' | 'note';
    excerpt?: string;
    lastModified: string;
}

export default function TagPage() {
    const { tagName } = useParams();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTagDocuments = async () => {
            try {
                const response = await fetch(`/api/tags/${tagName}`);
                const data = await response.json();
                setDocuments(data.documents);
            } catch (error) {
                console.error('Error fetching tag documents:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTagDocuments();
    }, [tagName]);

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">#{decodeURIComponent(tagName as string)}</h1>

            {loading ? (
                <div>加载中...</div>
            ) : (
                <div className="grid gap-4">
                    {documents.map((doc) => (
                        <Card key={doc.id} className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`w-2 h-2 rounded-full ${doc.type === 'paper' ? 'bg-blue-500' : 'bg-emerald-500'
                                    }`} />
                                <h2 className="text-lg font-medium">{doc.title}</h2>
                            </div>
                            {doc.excerpt && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                    {doc.excerpt}
                                </p>
                            )}
                            <div className="text-xs text-gray-500">
                                最后修改: {new Date(doc.lastModified).toLocaleDateString()}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
} 