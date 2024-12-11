'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Node, GraphData, Link } from '@/app/types/graph';
import { getScreenCoordinates, processGraphData } from '@/utils/graph';
import { NodeTooltip } from '@/components/NodeTooltip';
import { geistSans } from '@/app/fonts';
import { GraphActions } from '@/components/GraphActions';
import { Sidebar } from '@/components/Sidebar';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false
});

export const ForceGraph = () => {
  const router = useRouter();
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [recentItems, setRecentItems] = useState<Array<{ id: string; title: string; type: 'paper' | 'note'; lastModified: string }>>([]);
  const [sidebarWidth, setSidebarWidth] = useState(360);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newWidth = e.clientX;
      // 限制最小和最大宽度
      setSidebarWidth(Math.min(Math.max(newWidth, 200), 600));
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth - 32,
        height: window.innerHeight - 32
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/graph-data');
        const data = await response.json();
        const processedData = processGraphData(data);
        setGraphData(processedData);
      } catch (error) {
        console.error('Error fetching graph data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchRecentItems = async () => {
      try {
        const response = await fetch('/api/recent-items');
        const data = await response.json();
        setRecentItems(data);
      } catch (error) {
        console.error('Error fetching recent items:', error);
      }
    };

    fetchRecentItems();
  }, []);

  const handleNodeClick = (node: Node) => {
    if (!node) return;

    switch (node.type) {
      case 'tag':
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

  const handleAddTag = async (newTag: string) => {
    try {
      // 调用 API 保存新标签
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newTag }),
      });

      if (!response.ok) {
        throw new Error('Failed to create tag');
      }

      // 重新获取图数据以更新视图
      const graphResponse = await fetch('/api/graph-data');
      const data = await graphResponse.json();
      const processedData = processGraphData(data);
      setGraphData(processedData);

      // 重新获取最近项目列表
      const recentResponse = await fetch('/api/recent-items');
      const recentData = await recentResponse.json();
      setRecentItems(recentData);
    } catch (error) {
      console.error('Error adding new tag:', error);
      // 这里可以添加错误提示
    }
  };

  return (
    <div className="w-full h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        recentItems={recentItems} 
        onItemClick={handleNodeClick}
        width={sidebarWidth}
        onAddTag={handleAddTag}
      />
      
      {/* Resizer */}
      <div
        className="w-1 cursor-ew-resize hover:bg-blue-500 active:bg-blue-600 transition-colors"
        onMouseDown={handleMouseDown}
      />

      {/* Main content */}
      <div className="flex-1 p-4" ref={containerRef}>
        <Card className="w-full h-full relative overflow-hidden border-none shadow-lg">
          <GraphActions />
          <ForceGraph2D
            graphData={graphData}
            nodeAutoColorBy="type"
            width={dimensions.width - sidebarWidth - 4}
            height={dimensions.height}
            nodeLabel={() => ''}
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
              if (node) {
                const { x, y } = getScreenCoordinates(node, containerRef);
                setPopoverPosition({ x, y });
              }
            }}
            onNodeClick={(node) => handleNodeClick(node as Node)}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const n = node as Node;
              const nodeR = n.type === 'tag' ? 5 : 6;

              ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
              ctx.shadowBlur = 5;
              ctx.shadowOffsetX = 2;
              ctx.shadowOffsetY = 2;

              ctx.beginPath();
              ctx.arc(node.x!, node.y!, nodeR, 0, 2 * Math.PI);

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

              ctx.shadowColor = 'transparent';

              if (n.type === 'tag') {
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px ${geistSans.style?.fontFamily || 'sans-serif'}`;
                ctx.fillStyle = '#f59e0b';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                let displayText = n.name;
                if (displayText.length > 20) {
                  displayText = displayText.slice(0, 18) + '...';
                }

                ctx.fillText(`${displayText}`, node.x!, node.y! + nodeR + fontSize);
              }

              ctx.canvas.style.cursor = 'pointer';
            }}
            nodeRelSize={6}
            cooldownTicks={100}
            d3VelocityDecay={0.1}
          />
          {hoveredNode && (
            <NodeTooltip 
              node={hoveredNode} 
              position={popoverPosition} 
              graphData={graphData} 
            />
          )}
        </Card>
      </div>
    </div>
  );
};