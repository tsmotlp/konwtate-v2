import Image from 'next/image';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Node } from '@/types/graph';
import { useState, useEffect, useMemo } from 'react';
import { SearchAndTagFilter } from '@/components/SearchAndTagFilter';
import { ContentListItem } from '@/components/ContentListItem';
import { Tag } from '@prisma/client';

interface SidebarProps {
  items: {
    id: string;
    title: string;
    type: 'paper' | 'note';
    updatedAt: Date;
    tags?: Tag[];
  }[];
  onItemClick: (node: Node) => void;
  onUpdate?: () => void;
  width: number;
}

export const Sidebar = ({ items, onItemClick, onUpdate, width }: SidebarProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    if (!items) return [];

    return items.filter(item => {
      const matchesSearch = !searchTerm ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tags && item.tags.some(tag =>
          tag.name.toLowerCase().includes(searchTerm.toLowerCase())
        ));

      const matchesTag = !selectedTagId ||
        (item.tags && item.tags.some(tag => tag.id === selectedTagId));

      return matchesSearch && matchesTag;
    });
  }, [items, searchTerm, selectedTagId]);

  const handleFilterChange = (newSearchTerm: string, newSelectedTagId: string | null) => {
    setSearchTerm(newSearchTerm);
    setSelectedTagId(newSelectedTagId);
  };

  return (
    <div
      className="h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-4 flex flex-col"
      style={{ width: `${width}px` }}
    >
      <div className="flex items-center gap-2 mb-6 w-full">
        <Image
          src="/logo2.svg"
          alt="Logo"
          width={42}
          height={42}
          className="rounded-lg flex-shrink-0"
        />
        <h1 className="font-bold text-2xl truncate flex-1 min-w-0">PaperMind</h1>
      </div>

      <SearchAndTagFilter
        items={items}
        onFilterChange={handleFilterChange}
      />

      <div className="flex-1 overflow-hidden">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 my-2">
          {filteredItems.length > 0 ? '最新' : '无匹配结果'}
        </h2>
        <ScrollArea className="h-[calc(100vh-180px)]" key={filteredItems.length}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <ContentListItem
                key={item.id}
                id={item.id}
                type={item.type}
                title={item.title}
                tags={item.tags}
                updatedAt={item.updatedAt}
                onClick={() => onItemClick({ id: item.id, type: item.type } as Node)}
                onUpdate={onUpdate}
              />
            ))
          ) : (
            <div className="text-gray-500 dark:text-gray-400 text-sm p-2">
              无匹配结果
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}; 