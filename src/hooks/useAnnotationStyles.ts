import { useState, useCallback } from 'react';

interface AnnotationStyle {
    color: string;
    opacity: number;
}

export const useAnnotationStyles = () => {
    const [highlightStyle, setHighlightStyle] = useState<AnnotationStyle>({
        color: "#fcf485",
        opacity: 50
    });

    const [underlineStyle, setUnderlineStyle] = useState<AnnotationStyle>({
        color: "#e52237",
        opacity: 50
    });

    const updateHighlightStyle = useCallback((updates: Partial<AnnotationStyle>) => {
        setHighlightStyle(prev => ({ ...prev, ...updates }));
    }, []);

    const updateUnderlineStyle = useCallback((updates: Partial<AnnotationStyle>) => {
        setUnderlineStyle(prev => ({ ...prev, ...updates }));
    }, []);

    return {
        highlightStyle,
        underlineStyle,
        updateHighlightStyle,
        updateUnderlineStyle
    };
};