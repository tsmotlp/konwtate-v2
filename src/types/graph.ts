export interface Node {
  id: string;
  name: string;
  type: 'paper' | 'note' | 'tag';
  tags: string[];
  references: string[];
  backlinks: string[];
  updatedAt: Date;
  excerpt?: string;
  x?: number;
  y?: number;
}

export interface Link {
  source: string | Node;
  target: string | Node;
  value?: number;
  type: 'tag' | 'reference';
}

export interface GraphData {
  nodes: Node[];
  links: Link[];
}
