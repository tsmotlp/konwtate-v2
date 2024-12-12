import { Card } from '@/components/ui/card';
import { Node, GraphData } from '@/types/graph';
import { getLinkTargetId } from '@/utils/graph';

interface NodeTooltipProps {
  node: Node;
  position: { x: number; y: number };
  graphData: GraphData;
}

export const NodeTooltip = ({ node, position, graphData }: NodeTooltipProps) => {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <Card className="p-3 shadow-lg bg-white dark:bg-gray-800 w-64">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${
            node.type === 'tag'
              ? 'bg-amber-500'
              : node.type === 'paper'
                ? 'bg-blue-500'
                : 'bg-emerald-500'
          }`} />
          <div className="text-sm font-medium truncate">
            {node.type === 'tag' ? `#${node.name}` : node.name}
          </div>
        </div>

        {node.type === 'tag' ? (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <div className="mb-2">
              {graphData.links.filter(link => 
                link.type === 'tag' && getLinkTargetId(link.target) === node.id
              ).length} 个相关文档
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              点击查看所有相关文档
            </div>
          </div>
        ) : (
          <>
            {node.excerpt && (
              <div className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                {node.excerpt}
              </div>
            )}

            <div className="flex flex-wrap gap-1 mb-2">
              {node.tags?.map(tagId => {
                const tagNode = graphData.nodes.find(n => n.id === tagId && n.type === 'tag');
                return tagNode ? (
                  <span key={tagId} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                    #{tagNode.name}
                  </span>
                ) : null;
              })}
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between">
              <span>引用: {node.references?.length || 0}</span>
              <span>被引用: {node.backlinks?.length || 0}</span>
              <span>{new Date(node.updatedAt).toLocaleDateString()}</span>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};