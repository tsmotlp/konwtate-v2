import React, { memo, Dispatch, SetStateAction } from 'react';
import { HighlightArea } from '@react-pdf-viewer/highlight';
import { CopyIcon, HighlighterIcon, Underline, Languages, Type } from 'lucide-react';
import { toast } from 'sonner';
import { ToolButton } from '@/components/tool-button';

interface HighlightToolsProps {
    selectionRegion: HighlightArea;
    selectedText: string;
    highlightAreas: HighlightArea[];
    onHighlight: () => void;
    onUnderline: () => void;
    onClose: () => void;
    translationResult: string;
    setTranslationResult: Dispatch<SetStateAction<string>>;
}

export const HighlightTools = memo(({
    selectionRegion,
    selectedText,
    highlightAreas,
    onHighlight,
    onUnderline,
    onClose,
    translationResult,
    setTranslationResult,
}: HighlightToolsProps) => {
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(selectedText);
            toast.success('已复制到剪贴板');
        } catch (error) {
            toast.error('复制失败');
        }
    };

    const handleTranslate = async () => {
        try {
            // 这里添加你的翻译逻辑
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: selectedText }),
            });

            const data = await response.json();
            setTranslationResult(data.translation);
        } catch (error) {
            toast.error('翻译失败');
        }
    };

    const handleHighlight = () => {
        onHighlight();
        onClose();
    };

    const handleUnderline = () => {
        onUnderline();
        onClose();
    };

    return (
        <div
            style={{
                position: 'absolute',
                left: `${selectionRegion.left}%`,
                top: `${selectionRegion.top + selectionRegion.height}%`,
                transform: 'translateX(-50%)',
                zIndex: 1,
            }}
            className="bg-white rounded-lg shadow-lg border flex items-center gap-1 p-1"
        >
            <ToolButton
                label="复制"
                icon={CopyIcon}
                size="icon"
                iconClassName="h-4 w-4"
                color="text-neutral-400"
                onClick={handleCopy}
            />
            <ToolButton
                label="高亮"
                icon={HighlighterIcon}
                size="icon"
                iconClassName="h-4 w-4"
                color="text-neutral-400"
                onClick={handleHighlight}
            />
            <ToolButton
                label="下划线"
                icon={Underline}
                size="icon"
                iconClassName="h-4 w-4"
                color="text-neutral-400"
                onClick={handleUnderline}
            />
            <ToolButton
                label="翻译"
                icon={Languages}
                size="icon"
                iconClassName="h-4 w-4"
                color="text-neutral-400"
                onClick={handleTranslate}
            />

            {translationResult && (
                <div className="absolute top-full left-0 mt-2 p-2 bg-white rounded-lg shadow-lg border">
                    {translationResult}
                </div>
            )}
        </div>
    );
});

HighlightTools.displayName = 'HighlightTools';