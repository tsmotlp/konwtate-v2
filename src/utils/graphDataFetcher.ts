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

  // 处理标签节点
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

  // 处理论文节点和其关系
  data.papers.forEach(paper => {
    nodes.push({
      id: paper.id,
      name: paper.name,
      type: 'paper',
      updatedAt: paper.updatedAt,
      tags: paper.tags.map(t => t.tagId),
      references: [],
      backlinks: []
    });

    // 添加论文和标签的关系
    paper.tags?.forEach(tagRelation => {
      links.push({
        source: paper.id,
        target: tagRelation.tagId,
        type: 'tag',
        value: 1
      });
    });
  });

  // 处理笔记节点和其关系
  data.notes.forEach(note => {
    nodes.push({
      id: note.id,
      name: note.name,
      type: 'note',
      updatedAt: note.updatedAt,
      tags: note.tags.map(t => t.tagId),
      references: note.papers.map(p => p.paperId),
      backlinks: []
    });

    // 笔记和标签的关系
    note.tags?.forEach(tagRelation => {
      links.push({
        source: note.id,
        target: tagRelation.tagId,
        type: 'tag',
        value: 1
      });
    });

    // 笔记和论文的关系
    note.papers?.forEach(paperRelation => {
      links.push({
        source: note.id,
        target: paperRelation.paperId,
        type: 'reference',
        value: 2
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