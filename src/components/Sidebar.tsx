import Image from 'next/image';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Node } from '@/app/types/graph';
import { useState } from 'react';
import { SearchAndTagFilter } from './SearchAndTagFilter';

interface SidebarProps {
  recentItems: Array<{
    id: string;
    title: string;
    type: 'paper' | 'note';
    lastModified: string;
    tags?: string[];
  }>;
  onItemClick: (node: Node) => void;
  width: number;
  onAddTag?: (newTag: string) => void;
}

export const Sidebar = ({ recentItems, onItemClick, width, onAddTag }: SidebarProps) => {
  const [filteredItems, setFilteredItems] = useState<typeof recentItems>(recentItems);

  const handleFilterChange = (searchTerm: string, selectedTag: string | null) => {
    const filtered = recentItems.filter(item => {
      const matchesSearch = !searchTerm || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tags && item.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      
      const matchesTag = !selectedTag || 
        (item.tags && item.tags.includes(selectedTag));

      return matchesSearch && matchesTag;
    });
    setFilteredItems(filtered);
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

      <SearchAndTagFilter recentItems={recentItems} onFilterChange={handleFilterChange} onAddTag={onAddTag} />

      <div className="flex-1 overflow-hidden">
        {/* <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
          {filteredItems.length > 0 ? '搜索结果' : '没有找到相关内容'}
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
                  <span className={`w-2 h-2 flex-shrink-0 rounded-full ${
                    item.type === 'paper' ? 'bg-blue-500' : 'bg-emerald-500'
                  }`} />
                  <span className="text-sm truncate min-w-0 flex-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {item.title}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1 pl-4">
                  {new Date(item.lastModified).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 dark:text-gray-400 text-sm p-2">
              没有找到相关内容
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}; 