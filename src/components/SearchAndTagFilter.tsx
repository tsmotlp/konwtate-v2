import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Tag } from '@/components/Tag';

interface SearchAndTagFilterProps {
  items: Array<{
    id: string;
    title: string;
    type: 'paper' | 'note';
    updatedAt: Date;
    tags?: Array<{ id: string; name: string; }>;
  }>;
  onFilterChange: (searchTerm: string, selectedTag: string | null) => void;
}

export const SearchAndTagFilter: React.FC<SearchAndTagFilterProps> = ({ items, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);

  const allTags = useMemo(() => {
    const tags = items.flatMap(item => item.tags || []);
    const uniqueTags = Array.from(new Set(tags.map(tag => JSON.stringify(tag))))
      .map(tag => JSON.parse(tag));
    return uniqueTags.sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  const displayedTags = useMemo(() => {
    return isTagsExpanded ? allTags : allTags.slice(0, 5);
  }, [allTags, isTagsExpanded]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    onFilterChange(term, selectedTagId);
  };

  const handleTagClick = (tagId: string) => {
    const newSelectedTagId = tagId === selectedTagId ? null : tagId;
    setSelectedTagId(newSelectedTagId);
    setSearchTerm('');
    onFilterChange('', newSelectedTagId);
  };

  return (
    <div>
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="搜索论文或笔记..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full py-1.5 px-9 border border-gray-200 dark:border-gray-700 rounded-full 
                   bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          🔍
        </span>
        {searchTerm && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✖
          </button>
        )}
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Tags</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {displayedTags.map(tag => (
            <Button
              key={tag.id}
              onClick={() => handleTagClick(tag.id)}
              variant={tag.id === selectedTagId ? "default" : "secondary"}
              size="sm"
              className="h-7 gap-1 group"
            >
              <Tag
                id={tag.id}
                name={tag.name}
                size="sm"
                showDelete={false}
                className={tag.id === selectedTagId ? "!bg-transparent !border-transparent" : ""}
              />
            </Button>
          ))}
          {allTags.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsTagsExpanded(!isTagsExpanded);
                if (isTagsExpanded && selectedTagId && !allTags.slice(0, 5).some(tag => tag.id === selectedTagId)) {
                  setSelectedTagId(null);
                  onFilterChange(searchTerm, null);
                }
              }}
              className="h-7"
            >
              {isTagsExpanded ? '收起' : `展开 (${allTags.length - 5})`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}; 