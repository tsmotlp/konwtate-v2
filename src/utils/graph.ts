import { Node } from '@/types/graph';

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

export function getLinkTargetId(target: string | Node): string {
  return typeof target === 'string' ? target : target.id;
}