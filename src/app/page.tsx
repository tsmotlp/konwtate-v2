'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { geistSans } from '@/app/fonts';
import { useRouter } from 'next/navigation';

// 动态导入 ForceGraph2D，并禁用 SSR
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false
});

// 定义类型
interface Node {
  id: string;
  name: string;
  type: 'paper' | 'note' | 'tag';
  tags: string[];
  references: string[];
  backlinks: string[];
  lastModified: string;
  excerpt?: string;
}

interface Link {
  source: string;
  target: string;
  value: number;
  type: 'tag' | 'reference';
  label?: string;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

export default function Home() {
  const router = useRouter();
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 }); // 默认尺寸
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 设置初始尺寸
    setDimensions({
      width: window.innerWidth - 32,
      height: window.innerHeight - 32
    });

    // 添加窗口调整大小的监听器
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth - 32,
        height: window.innerHeight - 32
      });
    };

    window.addEventListener('resize', handleResize);

    // 清理监听器
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // 从API获取数据
    const fetchData = async () => {
      try {
        const response = await fetch('/api/graph-data');
        const data = await response.json();
        processGraphData(data);
      } catch (error) {
        console.error('Error fetching graph data:', error);
      }
    };

    fetchData();
  }, []);

  const processGraphData = (data: { papers: any[], notes: any[] }) => {
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
        if (nodes.find(n => n.id === refId)) {
          links.push({
            source: node.id,
            target: refId,
            value: 1,
            type: 'reference'
          });
        }
      });
    });

    // 创建文档和标签之间的关联
    documentNodes.forEach(node => {
      node.tags.forEach(tag => {
        links.push({
          source: node.id,
          target: `tag-${tag}`,
          value: 1,
          type: 'tag'
        });
      });
    });

    setGraphData({ nodes, links });
  };

  const handleNodeClick = (node: Node) => {
    if (!node) return;

    switch (node.type) {
      case 'tag':
        // 移除 'tag-' 前缀获取实际的标签名
        const tagName = node.id.replace('tag-', '');
        router.push(`/tags/${encodeURIComponent(tagName)}`);
        break;
      case 'note':
        router.push(`/notes/${encodeURIComponent(node.id)}`);
        break;
      case 'paper':
        router.push(`/papers/${encodeURIComponent(node.id)}`);
        break;
    }
  };

  return (
    <div className="w-full h-screen p-4 bg-gray-50 dark:bg-gray-900" ref={containerRef}>
      <Card className="w-full h-full relative overflow-hidden border-none shadow-lg">
        <ForceGraph2D
          graphData={graphData}
          nodeAutoColorBy="type"
          width={dimensions.width}
          height={dimensions.height}
          linkWidth={link => {
            const l = link as Link;
            return l.type === 'reference' ? 2 : 1;
          }}
          linkColor={(link) => {
            const l = link as Link;
            return l.type === 'reference'
              ? 'rgba(59, 130, 246, 0.5)'
              : 'rgba(245, 158, 11, 0.3)';
          }}
          backgroundColor="transparent"
          onNodeHover={(node) => {
            setHoveredNode(node as Node | null);
            if (node && containerRef.current) {
              const rect = containerRef.current.getBoundingClientRect();
              setPopoverPosition({
                x: (node.x || 0) + rect.left,
                y: (node.y || 0) + rect.top
              });
            }
          }}
          onNodeClick={(node) => handleNodeClick(node as Node)}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const n = node as Node;
            const nodeR = n.type === 'tag' ? 5 : 6;  // 增大标签节点的大小到8

            // 绘制节点阴影
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            // 绘制节点
            ctx.beginPath();
            ctx.arc(node.x!, node.y!, nodeR, 0, 2 * Math.PI);

            // 根据节点类型设置不同的样式
            if (n.type === 'tag') {
              ctx.fillStyle = '#f59e0b';
              ctx.strokeStyle = '#f59e0b';
            } else {
              ctx.fillStyle = n.type === 'paper' ? '#3b82f6' : '#10b981';
              ctx.strokeStyle = 'white';
            }

            ctx.fill();
            ctx.lineWidth = 2;
            ctx.stroke();

            // 重置阴影
            ctx.shadowColor = 'transparent';

            // 为标签节点添加文本
            if (n.type === 'tag') {
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px ${geistSans.style?.fontFamily || 'sans-serif'}`;
              ctx.fillStyle = '#f59e0b';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';

              // 限制文本长度
              let displayText = n.name;
              if (displayText.length > 20) {
                displayText = displayText.slice(0, 18) + '...';
              }

              // 添加 # 前缀并绘制文本
              ctx.fillText(`${displayText}`, node.x!, node.y! + nodeR + fontSize);
            }

            // 将鼠标样式设置为手型
            ctx.canvas.style.cursor = 'pointer';
          }}
          nodeRelSize={6}
          cooldownTicks={100}
          d3VelocityDecay={0.1}
        />

        {hoveredNode && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${popoverPosition.x}px`,
              top: `${popoverPosition.y}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <Card className="p-3 shadow-lg bg-white dark:bg-gray-800 w-64">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${hoveredNode.type === 'tag'
                  ? 'bg-amber-500'
                  : hoveredNode.type === 'paper'
                    ? 'bg-blue-500'
                    : 'bg-emerald-500'
                  }`} />
                <div className="text-sm font-medium truncate">
                  {hoveredNode.type === 'tag' ? `#${hoveredNode.name}` : hoveredNode.name}
                </div>
              </div>

              {hoveredNode.type !== 'tag' && (
                <>
                  {hoveredNode.excerpt && (
                    <div className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                      {hoveredNode.excerpt}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1 mb-2">
                    {hoveredNode.tags.map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                    <span>引用: {hoveredNode.references.length}</span>
                    <span>被引用: {hoveredNode.backlinks.length}</span>
                    <span>{new Date(hoveredNode.lastModified).toLocaleDateString()}</span>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
}
