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


export interface Paper {
  id: string;
  name: string;
  url: string;
  annotations?: string;
  tags: Tag[];
  notes: Note[];
}

export interface Note {
  id: string;
  name: string;
  content?: string;
  tags: Tag[];
  papers: Paper[];
}

export interface Tag {
  id: string;
  name: string;
  papers: Paper[];
  notes: Note[];
}
