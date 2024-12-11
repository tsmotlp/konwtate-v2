import React, { forwardRef, useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Annotation, AnnotationType } from '@/types/annotation';

interface StyleSetterPopoverProps {
    annotation: Annotation;
    highlightStyle: {
        color: string;
        opacity: number;
    };
    underlineStyle: {
        color: string;
        opacity: number;
    };
    updateHighlightStyle: (style: { color?: string; opacity?: number }) => void;
    updateUnderlineStyle: (style: { color?: string; opacity?: number }) => void;
    updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
}

// 预设颜色配置
const PRESET_COLORS = {
    highlight: [
        { name: '黄色', value: '#ffeb3b' },
        { name: '绿色', value: '#a5d6a7' },
        { name: '蓝色', value: '#90caf9' },
        { name: '粉色', value: '#f48fb1' },
        { name: '紫色', value: '#ce93d8' },
        { name: '橙色', value: '#ffcc80' },
    ],
    underline: [
        { name: '红色', value: '#ef5350' },
        { name: '蓝色', value: '#2196f3' },
        { name: '绿色', value: '#4caf50' },
        { name: '紫色', value: '#7e57c2' },
        { name: '橙色', value: '#ff9800' },
        { name: '黑色', value: '#212121' },
    ]
};

export const StyleSetterPopover = forwardRef<HTMLDivElement, StyleSetterPopoverProps>(
    ({
        annotation,
        highlightStyle,
        underlineStyle,
        updateHighlightStyle,
        updateUnderlineStyle,
        updateAnnotation
    }, ref) => {
        const isHighlight = annotation.type === AnnotationType.Highlight;
        const currentStyle = isHighlight ? highlightStyle : underlineStyle;
        const updateStyle = isHighlight ? updateHighlightStyle : updateUnderlineStyle;
        const presetColors = isHighlight ? PRESET_COLORS.highlight : PRESET_COLORS.underline;

        const [position, setPosition] = useState({
            top: annotation.popoverTop,
            left: annotation.popoverLeft,
            transformOrigin: 'center top'
        });

        useEffect(() => {
            const updatePosition = () => {
                const popover = ref as React.MutableRefObject<HTMLDivElement>;
                if (!popover.current) return;

                const rect = popover.current.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                let newTop = annotation.popoverTop;
                let newLeft = annotation.popoverLeft;
                let newTransformOrigin = 'center top';

                // 检查水平方向
                if (rect.right > viewportWidth) {
                    newLeft = `${parseFloat(annotation.popoverLeft) - (rect.right - viewportWidth) - 20}px`;
                } else if (rect.left < 0) {
                    newLeft = '20px';
                }

                // 检查垂直方向
                if (rect.bottom > viewportHeight) {
                    // 如果底部超出，将弹出框显示在注释的上方
                    newTop = `calc(${annotation.popoverTop} - ${rect.height}px - 10px)`;
                    newTransformOrigin = 'center bottom';
                }

                setPosition({
                    top: newTop,
                    left: newLeft,
                    transformOrigin: newTransformOrigin
                });
            };

            // 初始化位置
            updatePosition();

            // 监听窗口大小变化
            window.addEventListener('resize', updatePosition);
            return () => window.removeEventListener('resize', updatePosition);
        }, [annotation.popoverTop, annotation.popoverLeft, ref]);

        const handleColorChange = (newColor: string) => {
            updateStyle({ color: newColor });
            updateAnnotation(annotation.id, { color: newColor });
        };

        const handleOpacityChange = (value: number[]) => {
            const newOpacity = value[0];
            updateStyle({ opacity: newOpacity });
            updateAnnotation(annotation.id, { opacity: newOpacity / 100 });
        };

        return (
            <div
                ref={ref}
                className="absolute bg-white rounded-lg shadow-lg border p-4 z-20"
                style={{
                    top: position.top,
                    left: position.left,
                    transform: 'translate(-50%, 0)',
                    minWidth: '240px'
                }}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-8 gap-1.5">
                        {presetColors.map((color) => (
                            <button
                                key={color.value}
                                className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 ${currentStyle.color === color.value ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                                    }`}
                                style={{ backgroundColor: color.value }}
                                onClick={() => handleColorChange(color.value)}
                                title={color.name}
                            />
                        ))}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Label className="whitespace-nowrap">自定义颜色</Label>
                            <div className="relative flex-1">
                                <input
                                    type="color"
                                    value={currentStyle.color}
                                    onChange={(e) => handleColorChange(e.target.value)}
                                    className="absolute inset-0 opacity-0 w-full cursor-pointer"
                                />
                                <div className="h-8 w-full rounded-md border border-gray-200 flex items-center px-3 gap-2">
                                    <div
                                        className="w-4 h-4 rounded-full border border-gray-200"
                                        style={{ backgroundColor: currentStyle.color }}
                                    />
                                    <span className="text-sm text-gray-600 uppercase">
                                        {currentStyle.color}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label>透明度</Label>
                            <span className="text-sm text-muted-foreground">
                                {currentStyle.opacity}%
                            </span>
                        </div>
                        <Slider
                            value={[currentStyle.opacity]}
                            onValueChange={handleOpacityChange}
                            min={0}
                            max={100}
                            step={1}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>
        );
    }
);

StyleSetterPopover.displayName = 'StyleSetterPopover';