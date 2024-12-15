// src/components/ContentListItem.tsx
import { TagComponent as TagComponent } from '@/components/Tag';
import { Tag } from '@prisma/client';

interface ContentListItemProps {
    id: string;
    type: 'paper' | 'note';
    title: string;
    tags?: Tag[];
    onClick: () => void;
}

export const ContentListItem = ({
    id,
    type,
    title,
    tags,
    onClick
}: ContentListItemProps) => {
    return (
        <div
            key={`content-list-item-${id}`}
            onClick={onClick}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer group"
        >
            <div className="flex items-center gap-2 w-full min-w-0">
                <span className="text-gray-500 dark:text-gray-400">
                    {type === 'paper' ? '📄' : '📝'}
                </span>
                <span className={`text-sm truncate min-w-0 flex-1 ${type === 'paper'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                    {title}
                </span>
            </div>

            {tags && tags.length > 0 && (
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
            )}
        </div>
    );
};