import { GraphData, Node, Link } from '@/types/graph';
import { Paper, Note, Tag } from '@prisma/client';

interface FetchedData {
  papers: (Paper & {
    tags: { tagId: string }[];
    notes: { noteId: string }[];
  })[];
  notes: (Note & {
    tags: { tagId: string }[];
    papers: { paperId: string }[];
  })[];
  tags: Tag[];
}

export async function fetchGraphData(): Promise<GraphData> {
  try {
    const [papersRes, notesRes, tagsRes] = await Promise.all([
      fetch('/api/papers'),
      fetch('/api/notes'),
      fetch('/api/tags')
    ]);

    // 更详细的错误检查
    if (!papersRes.ok) {
      throw new Error(`Failed to fetch papers: ${papersRes.statusText}`);
    }
    if (!notesRes.ok) {
      throw new Error(`Failed to fetch notes: ${notesRes.statusText}`);
    }
    if (!tagsRes.ok) {
      throw new Error(`Failed to fetch tags: ${tagsRes.statusText}`);
    }

    const [papers, notes, tags] = await Promise.all([
      papersRes.json(),
      notesRes.json(),
      tagsRes.json()
    ]);

    // 验证返回的数据
    if (!Array.isArray(papers) || !Array.isArray(notes) || !Array.isArray(tags)) {
      throw new Error('Invalid data format received from API');
    }

    return processGraphData({ papers, notes, tags });
  } catch (error) {
    console.error('Error fetching graph data:', error);
    throw error;
  }
}

function processGraphData(data: FetchedData): GraphData {
  const nodes: Node[] = [];
  const links: Link[] = [];

  // 首先创建所有节点
  data.tags.forEach(tag => {
    nodes.push({
      id: tag.id,
      name: tag.name,
      type: 'tag',
      updatedAt: tag.updatedAt,
      tags: [],
      references: [],
      backlinks: []
    });
  });

  // 处理 papers，添加 references 和 backlinks 数组
  data.papers.forEach(paper => {
    nodes.push({
      id: paper.id,
      name: paper.name,
      type: 'paper',
      updatedAt: paper.updatedAt,
      tags: paper.tags.map(t => t.tagId),
      references: [], // paper 引用的其他内容
      backlinks: []   // 引用这个 paper 的其他内容
    });
  });

  // 处理 notes，同时建立与 papers 的关联
  data.notes.forEach(note => {
    nodes.push({
      id: note.id,
      name: note.name,
      type: 'note',
      updatedAt: note.updatedAt,
      tags: note.tags.map(t => t.tagId),
      references: note.papers.map(p => p.paperId),  // 笔记引用的论文
      backlinks: []  // 引用这个笔记的内容
    });

    // 为每个笔记创建与其引用的论文之间的连接
    note.papers.forEach(paperRef => {
      // 添加从笔记到论文的连接
      links.push({
        source: note.id,
        target: paperRef.paperId,
        type: 'reference',
        value: 2
      });

      // 更新论文的 backlinks
      const paperNode = nodes.find(n => n.id === paperRef.paperId);
      if (paperNode) {
        paperNode.backlinks.push(note.id);
      }
    });
  });

  // 处理标签关系
  [...data.papers, ...data.notes].forEach(item => {
    item.tags?.forEach(tagRelation => {
      links.push({
        source: item.id,
        target: tagRelation.tagId,
        type: 'tag',
        value: 1
      });
    });
  });

  // 移除重复的链接
  const uniqueLinks = Array.from(
    new Map(
      links.map(link => [
        `${link.source}-${link.target}-${link.type}`,
        link
      ])
    ).values()
  );

  return {
    nodes: nodes.filter(Boolean), // 移除可能的空值
    links: uniqueLinks
  };
} 