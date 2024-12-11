import React, { useState, useMemo } from 'react';

interface SearchAndTagFilterProps {
  recentItems: Array<{
    id: string;
    title: string;
    type: 'paper' | 'note';
    lastModified: string;
    tags?: string[];
  }>;
  onFilterChange: (searchTerm: string, selectedTag: string | null) => void;
  onAddTag?: (newTag: string) => void;
}

export const SearchAndTagFilter: React.FC<SearchAndTagFilterProps> = ({ recentItems, onFilterChange, onAddTag }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);

  const allTags = useMemo(() => {
    const tags = recentItems.flatMap(item => item.tags || []);
    return Array.from(new Set(tags));
  }, [recentItems]);

  const displayedTags = useMemo(() => {
    return isTagsExpanded ? allTags : allTags.slice(0, 5);
  }, [allTags, isTagsExpanded]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    onFilterChange(term, selectedTag);
  };

  const handleTagClick = (tag: string) => {
    const newSelectedTag = tag === selectedTag ? null : tag;
    setSelectedTag(newSelectedTag);
    setSearchTerm('');
    onFilterChange('', newSelectedTag);
  };

  const handleAddTag = () => {
    const newTag = prompt('请输入新的标签名称：');
    if (newTag && newTag.trim() && onAddTag) {
      onAddTag(newTag.trim());
    }
  };

  return (
    <div>
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="搜索论文或笔记..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full p-2 pl-10 border border-gray-300 dark:border-gray-700 rounded-lg 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
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
          <button
            onClick={handleAddTag}
            className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            + 新建标签
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {displayedTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-2 py-1 rounded-lg text-sm ${
                tag === selectedTag ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {tag}
            </button>
          ))}
          {allTags.length > 5 && (
            <button
              onClick={() => {
                setIsTagsExpanded(!isTagsExpanded);
                if (isTagsExpanded && selectedTag && !allTags.slice(0, 5).includes(selectedTag)) {
                  setSelectedTag(null);
                  onFilterChange(searchTerm, null);
                }
              }}
              className="px-2 py-1 rounded-lg text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {isTagsExpanded ? '收起' : `展开 (${allTags.length - 5})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 