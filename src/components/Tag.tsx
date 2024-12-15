import { XCircle, Trash2, Edit2 } from 'lucide-react';
import { useState, useCallback, useMemo } from 'react';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// 预定义一些柔和的颜色
const TAG_COLORS = [
    {
        bg: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200/50 dark:border-blue-800/40'
    },
    {
        bg: 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-200/50 dark:border-green-800/40'
    },
    {
        bg: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30',
        text: 'text-purple-700 dark:text-purple-400',
        border: 'border-purple-200/50 dark:border-purple-800/40'
    },
    {
        bg: 'bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30',
        text: 'text-yellow-700 dark:text-yellow-400',
        border: 'border-yellow-200/50 dark:border-yellow-800/40'
    },
    {
        bg: 'bg-pink-50 hover:bg-pink-100 dark:bg-pink-900/20 dark:hover:bg-pink-900/30',
        text: 'text-pink-700 dark:text-pink-400',
        border: 'border-pink-200/50 dark:border-pink-800/40'
    },
    {
        bg: 'bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-900/20 dark:hover:bg-cyan-900/30',
        text: 'text-cyan-700 dark:text-cyan-400',
        border: 'border-cyan-200/50 dark:border-cyan-800/40'
    }
];

interface TagProps {
    id: string;
    name: string;
    onRemove?: (id: string) => void;
    onDelete?: (id: string) => void;
    onRename?: (id: string, newName: string) => void;
    onClick?: () => void;
    size?: 'sm' | 'md';
    className?: string;
    showActions?: boolean;
    allowRename?: boolean;
    isActive?: boolean;
}

export const Tag = ({ 
    id, 
    name, 
    onRemove, 
    onDelete, 
    onRename,
    onClick,
    size = 'md', 
    className = '', 
    showActions = true,
    allowRename = false,
    isActive = false
}: TagProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showRenameDialog, setShowRenameDialog] = useState(false);
    const [newName, setNewName] = useState(name);

    // 根据tag名称确定颜色（保证同名tag颜色相同）
    const colorIndex = useMemo(() => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash) % TAG_COLORS.length;
    }, [name]);

    const { bg, text, border } = TAG_COLORS[colorIndex];

    const handleRemoveClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setShowRemoveDialog(true);
    }, []);

    const handleDeleteClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteDialog(true);
    }, []);

    const handleRenameClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setNewName(name); // 重置为当前名称
        setShowRenameDialog(true);
    }, [name]);

    const handleConfirmRemove = useCallback(() => {
        onRemove?.(id);
        setShowRemoveDialog(false);
    }, [id, onRemove]);

    const handleConfirmDelete = useCallback(() => {
        onDelete?.(id);
        setShowDeleteDialog(false);
    }, [id, onDelete]);

    const handleConfirmRename = useCallback(() => {
        if (newName.trim() && newName !== name) {
            onRename?.(id, newName.trim());
        }
        setShowRenameDialog(false);
    }, [id, name, newName, onRename]);

    const sizeClasses = size === 'sm'
        ? 'text-xs px-2 py-0.5'
        : 'text-sm px-2.5 py-1';

    return (
        <>
            <span
                className={`inline-flex items-center gap-1.5 rounded-md border ${sizeClasses} 
                    ${isActive 
                        ? 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white border-transparent' 
                        : `${bg} ${text} ${border}`} 
                    transition-all duration-200 
                    ${onClick ? 'cursor-pointer' : ''}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={onClick}
            >
                #{name}
                {showActions && isHovered && (onRemove || onDelete || (allowRename && onRename)) && (
                    <div className="flex items-center gap-1 ml-0.5">
                        {allowRename && onRename && (
                            <Edit2
                                className={`h-3 w-3 cursor-pointer opacity-60 hover:opacity-100
                                    ${isActive ? 'text-white' : text}`}
                                onClick={handleRenameClick}
                            />
                        )}
                        {onRemove && (
                            <XCircle
                                className={`h-3 w-3 cursor-pointer opacity-60 hover:opacity-100
                                    ${isActive ? 'text-white' : text}`}
                                onClick={handleRemoveClick}
                            />
                        )}
                        {onDelete && (
                            <Trash2
                                className={`h-3 w-3 cursor-pointer opacity-60 hover:opacity-100
                                    ${isActive 
                                        ? 'text-white hover:text-red-200' 
                                        : 'hover:text-red-500 dark:hover:text-red-400'}`}
                                onClick={handleDeleteClick}
                            />
                        )}
                    </div>
                )}
            </span>

            {/* 移除关联对话框 */}
            <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认移除标签</AlertDialogTitle>
                        <AlertDialogDescription>
                            您确定要移除标签 "#{name}" 吗？此操作只会解除标签与当前内容的关联。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmRemove}>
                            移除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* 删除标签对话框 */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除标签</AlertDialogTitle>
                        <AlertDialogDescription>
                            您确定要删除标签 "#{name}" 吗？此操作将永久删除该标签，且无法恢复。
                            删除后，该标签将从所有相关内容中移除。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            删除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* 重命名对话框 */}
            <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>重命名标签</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="输入新的标签名称"
                            className="w-full"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowRenameDialog(false)}
                        >
                            取消
                        </Button>
                        <Button
                            onClick={handleConfirmRename}
                            disabled={!newName.trim() || newName === name}
                        >
                            确认
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};