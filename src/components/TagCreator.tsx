"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { MultiSelect, Option } from "@/components/ui/multi-select"

interface TagCreatorProps {
    paperId?: string;
    noteId?: string;
    onTagCreated?: () => void;
}

export const TagCreator = ({ paperId, noteId, onTagCreated }: TagCreatorProps) => {
    const [existingTags, setExistingTags] = useState<Option[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 获取所有标签
                const tagsResponse = await fetch("/api/tags");
                const allTags = await tagsResponse.json();

                // 获取当前项目的标签
                let currentItemTags: string[] = [];
                if (paperId) {
                    const paperResponse = await fetch(`/api/papers/${paperId}`);
                    const paperData = await paperResponse.json();
                    currentItemTags = paperData.tags.map((tag: any) => tag.tag.id);
                } else if (noteId) {
                    const noteResponse = await fetch(`/api/notes/${noteId}`);
                    const noteData = await noteResponse.json();
                    currentItemTags = noteData.tags.map((tag: any) => tag.tag.id);
                }

                // 设置所有标签和当前选中的标签
                setExistingTags(allTags);
                setSelectedTags(currentItemTags);
            } catch (error) {
                console.error("获取标签失败:", error);
            }
        };
        fetchData();
    }, [paperId, noteId]);

    // 过滤掉已选择的标签
    const availableOptions = existingTags.filter(tag => !selectedTags.includes(tag.id));

    const handleCreateTag = async (tagName: string) => {
        try {
            if (!paperId && !noteId) {
                throw new Error("必须指定论文或笔记ID");
            }

            const createResponse = await fetch("/api/tags", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: tagName,
                    paperId,
                    noteId,
                }),
            });

            if (!createResponse.ok) {
                throw new Error("创建标签失败");
            }

            const newTag = await createResponse.json();
            setExistingTags(prev => [...prev, newTag]);
            onTagCreated?.();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "创建标签失败");
        }
    };

    const handleTagChange = async (newSelectedTags: string[]) => {
        try {
            if (paperId) {
                const response = await fetch(`/api/papers/${paperId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        tagIds: newSelectedTags
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "更新论文标签失败");
                }

                // 等待响应成功后再更新状态
                const data = await response.json();
                setSelectedTags(newSelectedTags);
                onTagCreated?.();
                toast.success("标签更新成功");
            }
        } catch (error) {
            console.error("更新标签错误:", error);
            toast.error(error instanceof Error ? error.message : "更新标签失败");
        }
    };

    return (
        <div className="w-full">
            <MultiSelect
                options={availableOptions}
                selected={selectedTags}
                onChange={handleTagChange}
                onCreateOption={handleCreateTag}
                placeholder="添加标签"
            />
        </div>
    );
};