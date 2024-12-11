import React from 'react';
import { Trash2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Annotation } from '@/types/annotation';

interface AnnotationToolbarProps {
    annotation: Annotation;
    onStyleClick: () => void;
    onDelete: () => void;
}

export const AnnotationToolbar = ({ annotation, onStyleClick, onDelete }: AnnotationToolbarProps) => {
    return (
        <div
            className="absolute bg-white rounded-lg shadow-lg border flex items-center gap-1 p-1 z-10"
            style={{
                top: annotation.popoverTop,
                left: annotation.popoverLeft,
                transform: 'translate(-50%, 0)',
            }}
        >
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={onStyleClick}
            >
                <Palette className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={onDelete}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
};