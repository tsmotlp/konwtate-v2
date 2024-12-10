import { NextResponse } from 'next/server';

// 模拟数据
const mockData = {
    papers: [
        {
            id: 'p1',
            title: '深度学习在自然语言处理中的应用',
            abstract: '本文探讨了深度学习技术在自然语言处理领域的最新应用和发展趋势...',
            tags: ['深度学习', 'NLP', 'AI'],
            references: ['p2', 'p3'],
            backlinks: ['n1'],
            lastModified: '2024-03-15T10:30:00Z'
        },
        {
            id: 'p2',
            title: 'Transformer架构详解',
            abstract: '详细介绍了Transformer架构的核心组件和工作原理...',
            tags: ['Transformer', 'NLP', '注意力机制'],
            references: ['p3'],
            backlinks: ['p1', 'n2'],
            lastModified: '2024-03-10T15:20:00Z'
        },
        {
            id: 'p3',
            title: '注意力机制综述',
            abstract: '全面回顾了注意力机制的发展历程和各种变体...',
            tags: ['注意力机制', 'AI', '深度学习'],
            references: [],
            backlinks: ['p1', 'p2', 'n1'],
            lastModified: '2024-02-28T09:15:00Z'
        }
    ],
    notes: [
        {
            id: 'n1',
            title: 'NLP学习笔记',
            excerpt: '整理了最近学习NLP相关论文的心得体会...',
            tags: ['NLP', '学习笔记', '深度学习'],
            references: ['p1', 'p3'],
            backlinks: [],
            lastModified: '2024-03-18T14:40:00Z'
        },
        {
            id: 'n2',
            title: 'Transformer实现要点',
            excerpt: '记录了实现Transformer时的关键注意事项...',
            tags: ['Transformer', '实现', '注意力机制'],
            references: ['p2'],
            backlinks: [],
            lastModified: '2024-03-16T11:25:00Z'
        }
    ]
};

export async function GET() {
    return NextResponse.json(mockData);
} 