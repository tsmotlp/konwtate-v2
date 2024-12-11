export interface Node {
  id: string;
  name: string;
  type: 'paper' | 'note' | 'tag';
  tags: string[];
  references: string[];
  backlinks: string[];
  lastModified: string;
  excerpt?: string;
}

export interface Link {
  source: Node;
  target: Node;
  value: number;
  type: 'tag' | 'reference';
}

export interface GraphData {
  nodes: Node[];
  links: Link[];
}