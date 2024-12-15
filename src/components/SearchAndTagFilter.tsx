import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Tag } from '@/components/Tag';
import { toast } from 'sonner';

interface SearchAndTagFilterProps {
  items: Array<{
    id: string;
    title: string;
    type: 'paper' | 'note';
    updatedAt: Date;
    tags?: Array<{ id: string; name: string; }>;
  }>;
  onFilterChange: (searchTerm: string, selectedTag: string | null) => void;
  onTagsUpdate: (tags: Array<{ id: string; name: string; }>) => void;
}

export const SearchAndTagFilter: React.FC<SearchAndTagFilterProps> = ({ items, onFilterChange, onTagsUpdate }) => {
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

  const handleRenameTag = async (tagId: string, newName: string) => {
    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '重命名标签失败');
      }

      toast.success('标签重命名成功');
      // 这里可能需要刷新页面或更新父组件的状态
      window.location.reload();
    } catch (error) {
      console.error('Error renaming tag:', error);
      toast.error(error instanceof Error ? error.message : '重命名标签失败');
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '删除标签失败');
      }

      toast.success('标签删除成功');
      // 如果被删除的标签是当前选中的标签，清除选择
      if (tagId === selectedTagId) {
        setSelectedTagId(null);
        onFilterChange(searchTerm, null);
      }
      // 这里可能需要刷新页面或更新父组件的状态
      window.location.reload();
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error(error instanceof Error ? error.message : '删除标签失败');
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
            <Tag
              key={tag.id}
              id={tag.id}
              name={tag.name}
              size="sm"
              showActions={true}
              onDelete={handleDeleteTag}
              onRename={handleRenameTag}
              allowRename={true}
              isActive={tag.id === selectedTagId}
              onClick={() => handleTagClick(tag.id)}
            />
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