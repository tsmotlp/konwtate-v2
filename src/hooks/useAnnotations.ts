import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import { Annotation } from '@/types/annotation'

export const useAnnotations = (paperId: string, initialAnnotations: Annotation[]) => {
    const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);

    const updateAnnotationsToServer = useCallback(
        debounce(async (newAnnotations: Annotation[]) => {
            try {
                await axios.patch(`/api/papers/${paperId}`, {
                    annotations: JSON.stringify(newAnnotations)
                });
            } catch (error) {
                toast.error("Failed to update annotations!");
                console.error("Error updating annotations:", error);
            }
        }, 1000),
        [paperId]
    );

    const addAnnotation = useCallback((newAnnotation: Annotation) => {
        setAnnotations(prev => {
            const updated = [...prev, newAnnotation];
            updateAnnotationsToServer(updated);
            return updated;
        });
    }, []);

    const deleteAnnotation = useCallback((annotationId: string) => {
        setAnnotations(prev => {
            const updated = prev.filter(a => a.id !== annotationId);
            updateAnnotationsToServer(updated);
            return updated;
        });
    }, []);

    const updateAnnotation = useCallback((annotationId: string, updates: Partial<Annotation>) => {
        setAnnotations(prev => {
            const updated = prev.map(ann =>
                ann.id === annotationId ? { ...ann, ...updates } : ann
            );
            updateAnnotationsToServer(updated);
            return updated;
        });
    }, []);

    return {
        annotations,
        addAnnotation,
        deleteAnnotation,
        updateAnnotation
    };
};