import { GraphData, Node, Link } from '@/types/graph';

export const getScreenCoordinates = (
  node: any, 
  containerRef: React.RefObject<HTMLDivElement | null>
) => {
  if (!containerRef.current) return { x: 0, y: 0 };
  
  const rect = containerRef.current.getBoundingClientRect();
  const x = rect.left + rect.width / 2 + (node.x || 0) - 360;
  const y = rect.top + rect.height / 2 + (node.y || 0);
  
  return { x, y };
};

export const processGraphData = (data: { papers: any[], notes: any[] }): GraphData => {
  // 收集所有唯一的标签
  const uniqueTags = new Set<string>();
  data.papers.forEach(p => p.tags.forEach((tag: string) => uniqueTags.add(tag)));
  data.notes.forEach(n => n.tags.forEach((tag: string) => uniqueTags.add(tag)));

  // 创建标签节点
  const tagNodes: Node[] = Array.from(uniqueTags).map(tag => ({
    id: `tag-${tag}`,
    name: tag,
    type: 'tag',
    tags: [],
    references: [],
    backlinks: [],
    lastModified: new Date().toISOString()
  }));

  // 创建文档节点
  const documentNodes: Node[] = [
    ...data.papers.map(p => ({
      id: p.id,
      name: p.title,
      type: 'paper' as const,
      tags: p.tags,
      references: p.references || [],
      backlinks: p.backlinks || [],
      lastModified: p.lastModified,
      excerpt: p.abstract || p.excerpt
    })),
    ...data.notes.map(n => ({
      id: n.id,
      name: n.title,
      type: 'note' as const,
      tags: n.tags,
      references: n.references || [],
      backlinks: n.backlinks || [],
      lastModified: n.lastModified,
      excerpt: n.excerpt
    }))
  ];

  const nodes = [...documentNodes, ...tagNodes];
  const links: Link[] = [];

  // 创建文档之间的引用关联
  documentNodes.forEach(node => {
    node.references.forEach(refId => {
      const targetNode = nodes.find(n => n.id === refId);
      if (targetNode) {
        links.push({
          source: node,
          target: targetNode,
          value: 1,
          type: 'reference'
        });
      }
    });
  });

  // 创建文档和标签之间的关联
  documentNodes.forEach(node => {
    node.tags.forEach(tag => {
      const tagNode = nodes.find(n => n.id === `tag-${tag}`);
      if (tagNode) {
        links.push({
          source: node,
          target: tagNode,
          value: 1,
          type: 'tag'
        });
      }
    });
  });

  return { nodes, links };
};