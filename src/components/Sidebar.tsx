import Image from 'next/image';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Node } from '@/types/graph';
import { useState, useEffect, useMemo } from 'react';
import { SearchAndTagFilter } from '@/components/SearchAndTagFilter';
import { Tag } from '@/components/Tag';

interface SidebarProps {
  items: Array<{
    id: string;
    title: string;
    type: 'paper' | 'note';
    updatedAt: Date;
    tags?: Array<{ id: string; name: string; }>;
  }>;
  onItemClick: (node: Node) => void;
  width: number;
}

export const Sidebar = ({ items, onItemClick, width }: SidebarProps) => {
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
          src="/logo.png"
          alt="Logo"
          width={32}
          height={32}
          className="rounded-lg flex-shrink-0"
        />
        <h1 className="font-bold text-xl truncate flex-1 min-w-0">Knowledge Graph</h1>
      </div>

      <SearchAndTagFilter
        items={items}
        onFilterChange={handleFilterChange}
      />

      <div className="flex-1 overflow-hidden">
        {/* <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
          {filteredItems.length > 0 ? '最近更新' : '无匹配结果'}
        </h2> */}
        <ScrollArea className="h-[calc(100vh-180px)]" key={filteredItems.length}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg mb-2 cursor-pointer group"
                onClick={() => onItemClick({ id: item.id, type: item.type } as Node)}
              >
                <div className="flex items-center gap-2 w-full min-w-0">
                  <span className="text-gray-500 dark:text-gray-400">
                    {item.type === 'paper' ? '📄' : '📝'}
                  </span>
                  <span className={`text-sm truncate min-w-0 flex-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 ${item.type === 'paper' ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                    {item.title}
                  </span>
                </div>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-1.5">
                    {item.tags.slice(0, 3).map((tag) => (
                      <Tag
                        key={tag.id}
                        id={tag.id}
                        name={tag.name}
                        size="sm"
                        showDelete={false}
                      />
                    ))}
                    {item.tags.length > 3 && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        +{item.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(item.updatedAt).toLocaleDateString()}
                </div>
              </div>
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