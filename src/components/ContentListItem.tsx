// src/components/ContentListItem.tsx
import { TagComponent as TagComponent } from '@/components/Tag';
import { Tag } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { SiGoogledocs } from "react-icons/si";
import { FaFilePdf } from "react-icons/fa";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';

interface ContentListItemProps {
    id: string;
    type: 'paper' | 'note';
    title: string;
    tags?: Tag[];
    updatedAt: Date;
    onClick: () => void;
    onUpdate?: () => void;
}

export const ContentListItem = ({
    id,
    type,
    title,
    tags,
    updatedAt,
    onClick,
    onUpdate
}: ContentListItemProps) => {
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [newTitle, setNewTitle] = useState(title);

    const handleRename = async () => {
        if (!newTitle.trim() || newTitle === title) {
            setIsRenameDialogOpen(false);
            return;
        }

        try {
            const response = await fetch(`/api/${type}s/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newTitle }),
            });

            if (!response.ok) {
                throw new Error('重命名失败');
            }

            toast.success('重命名成功');
            onUpdate?.();
        } catch (error) {
            console.error('重命名失败:', error);
            toast.error('重命名失败');
        } finally {
            setIsRenameDialogOpen(false);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/${type}s/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('删除失败');
            }

            toast.success('删除成功');
            onUpdate?.();
        } catch (error) {
            console.error('删除失败:', error);
            toast.error('删除失败');
        } finally {
            setIsDeleteAlertOpen(false);
        }
    };

    return (
        <div
            key={`content-list-item-${id}`}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg group"
        >
            <div className="flex items-center gap-2 w-full min-w-0">
                <div className="flex-1 flex items-center gap-2 min-w-0 cursor-pointer" onClick={onClick}>
                    {type === 'paper' ? (
                        <FaFilePdf className='fill-red-600 size-4' />
                    ) : (
                        <SiGoogledocs className='fill-blue-500 size-4' />
                    )}
                    <span className={`text-sm truncate min-w-0 flex-1 ${type === 'paper'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                        {title}
                    </span>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 invisible group-hover:visible"
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                            setNewTitle(title);
                            setIsRenameDialogOpen(true);
                        }}>
                            <Pencil className="mr-2 h-4 w-4" />
                            重命名
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setIsDeleteAlertOpen(true)}
                            className="text-red-600 dark:text-red-400"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {
                tags && tags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mt-1.5">
                        {tags.slice(0, 3).map((tag) => (
                            <TagComponent
                                key={tag.id}
                                id={tag.id}
                                name={tag.name}
                                size="sm"
                                showActions={false}
                                allowRename={false}
                            />
                        ))}
                        {tags.length > 3 && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                +{tags.length - 3}
                            </span>
                        )}
                    </div>
                )
            }
            <div className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                {formatDistanceToNow(updatedAt, { addSuffix: true, locale: zhCN })}
            </div>

            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>
                            此操作无法撤销。确定要删除这个{type === 'paper' ? '论文' : '笔记'}吗？
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            删除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>重命名{type === 'paper' ? '论文' : '笔记'}</AlertDialogTitle>
                        <AlertDialogDescription>
                            请输入新的名称
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Input
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleRename();
                                }
                            }}
                            autoFocus
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setNewTitle(title)}>
                            取消
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleRename}>
                            确认
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
};