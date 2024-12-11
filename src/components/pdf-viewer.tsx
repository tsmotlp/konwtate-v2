"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Position, SpecialZoomLevel, Tooltip, Viewer, Worker } from '@react-pdf-viewer/core';
import type { ToolbarSlot, TransformToolbarSlot } from '@react-pdf-viewer/toolbar';
import { toolbarPlugin } from '@react-pdf-viewer/toolbar';
import { bookmarkPlugin } from '@react-pdf-viewer/bookmark';
import { thumbnailPlugin } from '@react-pdf-viewer/thumbnail';
import { highlightPlugin, HighlightArea, RenderHighlightTargetProps, RenderHighlightsProps } from '@react-pdf-viewer/highlight';
import { v4 as uuidv4 } from "uuid";
import { Bookmark, LayoutDashboard, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Paper } from '@prisma/client';
import { Annotation, AnnotationType } from '@/types/annotation';
import { useAnnotations } from '@/hooks/useAnnotations';
import { useAnnotationStyles } from '@/hooks/useAnnotationStyles';
import { HighlightTools } from '@/components/highlight-tools';
import { ErrorBoundary } from '@/components/error-boundary';
import { AnnotationToolbar } from '@/components/annotation-toolbar';
import { StyleSetterPopover } from '@/components/style-setter-popover';

// 导入样式
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/thumbnail/lib/styles/index.css';
import '@react-pdf-viewer/highlight/lib/styles/index.css';

const TOOLTIP_OFFSET = { left: 0, top: 0 };

interface PDFViewerProps {
  paper: Paper;
}

export const PDFViewer = ({ paper }: PDFViewerProps) => {
  // 使用自定义 hooks
  const {
    annotations,
    addAnnotation,
    deleteAnnotation,
    updateAnnotation
  } = useAnnotations(paper.id, paper.annotations ? JSON.parse(paper.annotations) : []);

  const {
    highlightStyle,
    underlineStyle,
    updateHighlightStyle,
    updateUnderlineStyle
  } = useAnnotationStyles();

  // 状态管理
  const [showHighlightTools, setShowHighlightTools] = useState(false);
  const [translationResult, setTranslationResult] = useState("");
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [showStyleSetter, setShowStyleSetter] = useState<string | null>(null);
  const [isSidebarOpened, setSidebarOpened] = useState(false);
  const [isBookmarkOpened, setBookmarkOpened] = useState(false);
  const [isThumbnailOpened, setThumbnailOpened] = useState(true);

  const styleSetterRef = useRef<HTMLDivElement | null>(null);

  // 插件实例化
  const bookmarkPluginInstance = bookmarkPlugin();
  const toolbarPluginInstance = toolbarPlugin();
  const thumbnailPluginInstance = thumbnailPlugin();

  const { Toolbar } = toolbarPluginInstance;
  const { Bookmarks } = bookmarkPluginInstance;
  const { Thumbnails } = thumbnailPluginInstance;
  const { renderDefaultToolbar } = toolbarPluginInstance;

  // 工具栏转换
  const transform = useMemo<TransformToolbarSlot>(() => (slot: ToolbarSlot) => ({
    ...slot,
    Open: () => <></>,
    OpenMenuItem: () => <></>,
    SwitchTheme: () => <></>,
    SwitchThemeMenuItem: () => <></>
  }), []);

  // 高亮插件配置
  const highlightPluginInstance = highlightPlugin({
    renderHighlightTarget: (props: RenderHighlightTargetProps) => (
      showHighlightTools ? (
        <HighlightTools
          selectionRegion={props.selectionRegion}
          selectedText={props.selectedText}
          highlightAreas={props.highlightAreas}
          onHighlight={() => {
            addAnnotation({
              id: uuidv4(),
              type: AnnotationType.Highlight,
              color: highlightStyle.color,
              opacity: highlightStyle.opacity / 100,
              popoverTop: `${props.selectionRegion.top + props.selectionRegion.height + 1}%`,
              popoverLeft: `${props.selectionRegion.left + props.selectionRegion.width / 2}%`,
              areas: props.highlightAreas
            });
            setShowHighlightTools(false);
            window.getSelection()?.removeAllRanges();
          }}
          onUnderline={() => {
            addAnnotation({
              id: uuidv4(),
              type: AnnotationType.Underline,
              color: underlineStyle.color,
              opacity: underlineStyle.opacity / 100,
              popoverTop: `${props.selectionRegion.top + props.selectionRegion.height + 1}%`,
              popoverLeft: `${props.selectionRegion.left + props.selectionRegion.width / 2}%`,
              areas: props.highlightAreas
            });
            setShowHighlightTools(false);
            window.getSelection()?.removeAllRanges();
          }}
          onClose={() => {
            setShowHighlightTools(false);
            window.getSelection()?.removeAllRanges();
          }}
          translationResult={translationResult}
          setTranslationResult={setTranslationResult}
        />
      ) : null
    ),
    renderHighlights: (props: RenderHighlightsProps) => (
      <div>
        {annotations.map((annotation, idx1) => (
          <React.Fragment key={`${annotation.id}-${idx1}`}>
            {annotation.areas
              .filter((area) => area.pageIndex === props.pageIndex)
              .map((area, idx2) => (
                <React.Fragment key={`${annotation.id}-area-${idx2}`}>
                  <div
                    className="annotation-element"
                    onClick={() => setSelectedAnnotationId(annotation.id)}
                    style={Object.assign(
                      {
                        background: annotation.type === AnnotationType.Highlight ? annotation.color : "",
                        opacity: annotation.opacity,
                        cursor: "pointer",
                        zIndex: 1,
                        borderBottom: annotation.type === AnnotationType.Underline ? `2px solid ${annotation.color}` : "",
                      },
                      props.getCssProperties(area, props.rotation)
                    )}
                  />
                  {selectedAnnotationId === annotation.id && (
                    <AnnotationToolbar
                      annotation={annotation}
                      onStyleClick={() => setShowStyleSetter(annotation.id)}
                      onDelete={() => deleteAnnotation(annotation.id)}
                    />
                  )}
                  {showStyleSetter === annotation.id && (
                    <StyleSetterPopover
                      ref={styleSetterRef}
                      annotation={annotation}
                      highlightStyle={highlightStyle}
                      underlineStyle={underlineStyle}
                      updateHighlightStyle={updateHighlightStyle}
                      updateUnderlineStyle={updateUnderlineStyle}
                      updateAnnotation={updateAnnotation}
                    />
                  )}
                </React.Fragment>
              ))}
          </React.Fragment>
        ))}
      </div>
    )
  });

  // 事件处理
  useEffect(() => {
    const handleTextSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        setShowHighlightTools(true);
      } else {
        setShowHighlightTools(false);
      }
    };

    document.addEventListener('selectionchange', handleTextSelection);
    return () => {
      document.removeEventListener('selectionchange', handleTextSelection);
    };
  }, []);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.annotation-element')) {
        setSelectedAnnotationId(null);
      }
    };

    const handleScroll = () => {
      setSelectedAnnotationId(null);
      setShowHighlightTools(false);
    };

    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('click', handleGlobalClick);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (styleSetterRef.current && !styleSetterRef.current.contains(event.target as Node)) {
        setShowStyleSetter(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <ErrorBoundary>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <div className='flex flex-col h-full'>
          <div className='h-12 flex items-center justify-between border-b gap-x-20'>
            <Tooltip
              position={Position.BottomLeft}
              target={
                <Button
                  variant="ghost"
                  size="icon"
                  className='text-muted-foreground'
                  onClick={() => setSidebarOpened((opened) => !opened)}
                >
                  <PanelLeft className='h-5 w-5' />
                </Button>
              }
              content={() => '切换侧边栏'}
              offset={TOOLTIP_OFFSET}
            />
            <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
          </div>
          <div className='h-[calc(100vh-6rem)] flex overflow-auto'>
            <Sidebar
              isOpened={isSidebarOpened}
              isThumbnailOpened={isThumbnailOpened}
              isBookmarkOpened={isBookmarkOpened}
              onThumbnailToggle={() => {
                setThumbnailOpened(true);
                setBookmarkOpened(false);
              }}
              onBookmarkToggle={() => {
                setThumbnailOpened(false);
                setBookmarkOpened(true);
              }}
              thumbnailComponent={<Thumbnails />}
              bookmarkComponent={<Bookmarks />}
            />
            {paper.url ? (
              <Viewer
                fileUrl={"/1706.03762v7.pdf"}
                defaultScale={SpecialZoomLevel.PageWidth}
                plugins={[
                  bookmarkPluginInstance,
                  thumbnailPluginInstance,
                  toolbarPluginInstance,
                  highlightPluginInstance
                ]}
              />
            ) : (
              <div className='flex h-full w-full items-center justify-center'>
                文件 URL 错误！
              </div>
            )}
          </div>
        </div>
      </Worker>
    </ErrorBoundary>
  );
};

// Sidebar 组件定义
const Sidebar = ({
  isOpened,
  isThumbnailOpened,
  isBookmarkOpened,
  onThumbnailToggle,
  onBookmarkToggle,
  thumbnailComponent,
  bookmarkComponent
}) => (
  <div
    style={{
      overflow: 'auto',
      transition: 'width 400ms ease-in-out',
      width: isOpened ? '30%' : '0%',
    }}
  >
    <div className='flex h-full'>
      <div className='h-full flex flex-col items-center gap-y-2'>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'text-muted-foreground',
            isThumbnailOpened && 'bg-accent'
          )}
          onClick={onThumbnailToggle}
        >
          <LayoutDashboard />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'text-muted-foreground',
            isBookmarkOpened && 'bg-accent'
          )}
          onClick={onBookmarkToggle}
        >
          <Bookmark />
        </Button>
      </div>
      {isThumbnailOpened && thumbnailComponent}
      {isBookmarkOpened && bookmarkComponent}
    </div>
  </div>
);

export default PDFViewer;