'use client';

import { useEffect, useRef } from 'react';
import WebViewer from '@pdftron/pdfjs-express';

interface PDFViewerProps {
  pdfUrl: string;
  onAnnotationChange?: (annotations: any) => void;
}

export default function PDFViewer({ pdfUrl, onAnnotationChange }: PDFViewerProps) {
  const viewer = useRef<HTMLDivElement>(null);
  const viewerInstance = useRef<any>(null);

  useEffect(() => {
    const initializeViewer = async () => {
      if (!viewer.current || viewerInstance.current) return;

      viewerInstance.current = await WebViewer(
        {
          path: '/webviewer/lib',
          initialDoc: "/1706.03762v7.pdf",
        },
        viewer.current
      );

      const { annotationManager } = viewerInstance.current.Core;

      annotationManager.addEventListener('annotationChanged', () => {
        const annotations = annotationManager.getAnnotationsList();
        onAnnotationChange?.(annotations);
      });

      viewerInstance.current.UI.setTheme('dark');
      viewerInstance.current.UI.enableFeatures(['annotations']);
    };

    initializeViewer();

    return () => {
      if (viewerInstance.current) {
        viewerInstance.current.dispose();
        viewerInstance.current = null;
      }
    };
  }, []); // 只在组件挂载时初始化一次

  // 当 pdfUrl 改变时，加载新文档
  useEffect(() => {
    if (viewerInstance.current) {
      viewerInstance.current.Core.documentViewer.loadDocument(pdfUrl);
    }
  }, [pdfUrl]);

  return <div ref={viewer} className="w-full h-full" />;
}