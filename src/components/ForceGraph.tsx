'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Node, GraphData, Link } from '@/types/graph';
import { getScreenCoordinates } from '@/utils/graph';
import { NodeTooltip } from '@/components/NodeTooltip';
import { geistSans } from '@/app/fonts';
import { GraphActions } from '@/components/GraphActions';
import { Sidebar } from '@/components/Sidebar';
import { fetchGraphData } from '@/utils/graphDataFetcher';
import { toast } from 'sonner';
import { Tag } from '@prisma/client';

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
  const [sidebarWidth, setSidebarWidth] = useState(500);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const loadGraphData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchGraphData();
      setGraphData(data);
    } catch (error) {
      console.error('Error loading graph data:', error);
      setError('Failed to load graph data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGraphData();
  }, []);

  const items = useMemo(() => {
    const allItems = graphData.nodes
      .filter(node => node.type === 'paper' || node.type === 'note')
      .map(node => ({
        id: node.id,
        title: node.name,
        type: node.type as 'paper' | 'note',
        updatedAt: node.updatedAt,
        tags: node.tags
          ?.map(tagId => {
            const tagNode = graphData.nodes.find(n => n.id === tagId && n.type === 'tag');
            return tagNode ? {
              id: tagNode.id,
              name: tagNode.name,
              updatedAt: tagNode.updatedAt || new Date()
            } : undefined;
          })
          .filter((tag): tag is Tag => tag !== undefined)
      }));

    return allItems
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [graphData.nodes]);

  const handleNodeClick = (node: Node) => {
    if (!node) return;

    switch (node.type) {
      case 'tag':
        router.push(`/tags/${encodeURIComponent(node.id)}`);
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
    <div className="w-full h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar
        items={items}
        onItemClick={handleNodeClick}
        width={sidebarWidth}
        onUpdate={loadGraphData}
      />

      {/* Resizer */}
      <div
        className="w-1 cursor-ew-resize hover:bg-blue-500 active:bg-blue-600 transition-colors"
        onMouseDown={handleMouseDown}
      />

      {/* Main content */}
      <div className="flex-1 p-4" ref={containerRef}>
        <Card className="w-full h-full relative overflow-hidden border-none shadow-lg">
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <GraphActions />
          </div>

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50">
              <div className="text-red-500">{error}</div>
            </div>
          )}
          {!isLoading && !error && (
            <ForceGraph2D
              graphData={graphData}
              nodeAutoColorBy="type"
              width={dimensions.width - sidebarWidth - 4}
              height={dimensions.height}
              nodeLabel={() => ''}
              linkWidth={link => {
                const l = link as unknown as Link;
                return l.type === 'reference' ? 2 : 1;
              }}
              linkColor={(link) => {
                const l = link as unknown as Link;
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
          )}
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