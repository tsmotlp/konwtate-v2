import { XCircle } from 'lucide-react';
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

// 预定义一些柔和的颜色
const TAG_COLORS = [
    { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
    { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
    { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
    { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
    { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
    { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' },
];

interface TagProps {
    id: string;
    name: string;
    onDelete?: (id: string) => void;
    size?: 'sm' | 'md';
    className?: string;
    showDelete?: boolean;
}

export const Tag = ({ id, name, onDelete, size = 'md', className = '', showDelete = true }: TagProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // 根据tag名称确定颜色（保证同名tag颜色相同）
    const colorIndex = useMemo(() => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash) % TAG_COLORS.length;
    }, [name]);

    const { bg, text, border } = TAG_COLORS[colorIndex];

    const handleDeleteClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteDialog(true);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        onDelete?.(id);
        setShowDeleteDialog(false);
    }, [id, onDelete]);

    const sizeClasses = size === 'sm'
        ? 'text-xs px-2 py-0.5'
        : 'text-sm px-2.5 py-1';

    return (
        <>
            <span
                className={`inline-flex items-center gap-1 rounded-lg border ${sizeClasses} 
                     ${bg} ${text} ${border} transition-colors ${className}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                #{name}
                {onDelete && showDelete && isHovered && (
                    <XCircle
                        className="h-3.5 w-3.5 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={handleDeleteClick}
                    />
                )}
            </span>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除标签</AlertDialogTitle>
                        <AlertDialogDescription>
                            您确定要删除标签 "#{name}" 吗？此操作无法撤销。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete}>
                            删除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};