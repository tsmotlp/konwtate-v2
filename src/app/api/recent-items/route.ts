import { NextResponse } from 'next/server';

// 模拟数据
const mockRecentItems = [
  {
    id: "paper-1",
    title: "Attention Is All You Need",
    type: "paper",
    lastModified: "2024-03-20T10:00:00Z",
    tags: ["transformer", "deep-learning", "nlp", "attention-mechanism"]
  },
  {
    id: "note-1",
    title: "Transformer 架构详解",
    type: "note",
    lastModified: "2024-03-19T15:30:00Z",
    tags: ["transformer", "architecture", "tutorial", "chinese"]
  },
  {
    id: "paper-2",
    title: "BERT: Pre-training of Deep Bidirectional Transformers",
    type: "paper",
    lastModified: "2024-03-18T09:20:00Z",
    tags: ["bert", "transformer", "pre-training", "nlp"]
  },
  {
    id: "note-2",
    title: "BERT 预训练方法研究",
    type: "note",
    lastModified: "2024-03-17T14:45:00Z",
    tags: ["bert", "pre-training", "research", "chinese"]
  },
  {
    id: "paper-3",
    title: "GPT-3: Language Models are Few-Shot Learners",
    type: "paper",
    lastModified: "2024-03-16T11:15:00Z",
    tags: ["gpt", "few-shot-learning", "language-model", "openai"]
  },
  {
    id: "note-3",
    title: "大语言模型发展历程",
    type: "note",
    lastModified: "2024-03-15T16:30:00Z",
    tags: ["llm", "history", "development", "chinese"]
  },
  {
    id: "paper-4",
    title: "LLaMA: Open and Efficient Foundation Language Models",
    type: "paper",
    lastModified: "2024-03-14T13:20:00Z",
    tags: ["llama", "open-source", "language-model", "meta"]
  },
  {
    id: "note-4",
    title: "开源语言模型对比分析",
    type: "note",
    lastModified: "2024-03-13T10:45:00Z",
    tags: ["open-source", "comparison", "llm", "chinese"]
  },
  {
    id: "paper-5",
    title: "Constitutional AI: A Framework for Machine Learning",
    type: "paper",
    lastModified: "2024-03-12T09:30:00Z",
    tags: ["ai-safety", "ethics", "framework", "constitutional-ai"]
  },
  {
    id: "note-5",
    title: "AI 安全性研究笔记",
    type: "note",
    lastModified: "2024-03-11T14:15:00Z",
    tags: ["ai-safety", "research", "ethics", "chinese"]
  }
];

export async function GET() {
  try {
    return NextResponse.json(mockRecentItems);
  } catch (error) {
    console.error('Error fetching recent items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent items' },
      { status: 500 }
    );
  }
} 