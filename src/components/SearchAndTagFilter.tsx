import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
  onAddTag?: (newTag: string) => void;
  onDeleteTag?: (tag: string) => void;
}

export const SearchAndTagFilter: React.FC<SearchAndTagFilterProps> = ({ items, onFilterChange, onAddTag, onDeleteTag }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);
  const [newTagValue, setNewTagValue] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);

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

  const handleAddTag = async () => {
    const trimmedTag = newTagValue.trim();
    
    // 前端验证
    if (!trimmedTag) {
      toast.error('标签名称不能为空');
      return;
    }
    
    if (trimmedTag.length > 50) {
      toast.error('标签名称不能超过50个字符');
      return;
    }
    
    if (allTags.some(tag => tag.name.toLowerCase() === trimmedTag.toLowerCase())) {
      toast.error('标签已存在');
      return;
    }

    // 调用父组件的添加方法
    if (onAddTag) {
      try {
        await onAddTag(trimmedTag);
        setNewTagValue('');
        setIsDialogOpen(false);
      } catch (error) {
        // 错误已在父组件中处理，这里不需要额外处理
      }
    }
  };

  const handleDeleteTag = async (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTagToDelete(tagId);
  };

  const confirmDeleteTag = () => {
    if (tagToDelete && onDeleteTag) {
      onDeleteTag(tagToDelete);
      if (tagToDelete === selectedTagId) {
        setSelectedTagId(null);
        onFilterChange(searchTerm, null);
      }
      setTagToDelete(null);
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8">
                <Plus className="h-4 w-4 mr-1" />
                新建标签
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加新标签</DialogTitle>
              </DialogHeader>
              <div className="flex gap-2">
                <Input
                  value={newTagValue}
                  onChange={(e) => setNewTagValue(e.target.value)}
                  placeholder="输入标签名称"
                  className="flex-1"
                />
                <Button onClick={handleAddTag}>添加</Button>
              </div>
            </DialogContent>
          </Dialog>
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
              #{tag.name}
              {onDeleteTag && (
                <XCircle
                  onClick={(e) => handleDeleteTag(tag.id, e)}
                  className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              )}
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

      <AlertDialog open={!!tagToDelete} onOpenChange={(open) => !open && setTagToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除标签</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除标签 "{allTags.find(t => t.id === tagToDelete)?.name}" 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTag}>确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}; 