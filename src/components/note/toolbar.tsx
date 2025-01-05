"use client"

import { useEditorStore } from "@/hooks/use-editor-store";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon, BoldIcon, ChevronDownIcon, HighlighterIcon, ImageIcon, ItalicIcon, Link2Icon, LinkIcon, ListCollapseIcon, ListIcon, ListOrderedIcon, ListTodoIcon, LucideIcon, MessageSquareIcon, MinusIcon, PlusIcon, PrinterIcon, Redo2Icon, RedoIcon, RemoveFormattingIcon, SearchIcon, SpellCheckIcon, UnderlineIcon, Undo2Icon, UploadIcon, TableIcon, Trash2Icon, Sigma, Baseline, Code2Icon, HeadingIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { type Level } from "@tiptap/extension-heading"
import { type ColorResult, SketchPicker } from "react-color"
import { useState, memo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogHeader, DialogContent, DialogTitle, Dialog } from "@/components/ui/dialog";
import { MathInputDialog } from '@/components/math-input-dialog'
import { Label } from "@/components/ui/label";
import { de } from "date-fns/locale";

const TableButton = () => {
    const { editor } = useEditorStore();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [rows, setRows] = useState(3);
    const [cols, setCols] = useState(3);
    const [menuPlacement, setMenuPlacement] = useState<"bottom" | "right">("bottom");

    useEffect(() => {
        const handleResize = () => {
            setMenuPlacement(window.innerWidth < 768 ? "right" : "bottom");
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!editor) return null;

    const handleTableOperations = {
        insertTable: () => {
            editor.chain().focus().insertTable({
                rows,
                cols,
                withHeaderRow: true
            }).run();
            setIsDialogOpen(false);
        },
        addColumnBefore: () => editor.chain().focus().addColumnBefore().run(),
        addColumnAfter: () => editor.chain().focus().addColumnAfter().run(),
        deleteColumn: () => editor.chain().focus().deleteColumn().run(),
        addRowBefore: () => editor.chain().focus().addRowBefore().run(),
        addRowAfter: () => editor.chain().focus().addRowAfter().run(),
        deleteRow: () => editor.chain().focus().deleteRow().run(),
        deleteTable: () => editor.chain().focus().deleteTable().run(),
        mergeCells: () => editor.chain().focus().mergeCells().run(),
        splitCell: () => editor.chain().focus().splitCell().run(),
        toggleHeaderColumn: () => editor.chain().focus().toggleHeaderColumn().run(),
        toggleHeaderRow: () => editor.chain().focus().toggleHeaderRow().run(),
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="h-7 min-w-7 shrink-0 flex items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
                        <TableIcon className="size-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side={menuPlacement} align="start">
                    <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                        <PlusIcon className="size-4 mr-2" />
                        <span>插入表格</span>
                    </DropdownMenuItem>

                    {editor.isActive('table') && (
                        <>
                            <DropdownMenuSeparator />

                            {/* 行操作 */}
                            <DropdownMenuItem onClick={handleTableOperations.addRowBefore}>
                                <span>在上方插入行</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleTableOperations.addRowAfter}>
                                <span>在下方插入行</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleTableOperations.deleteRow}>
                                <span>删除行</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {/* 列操作 */}
                            <DropdownMenuItem onClick={handleTableOperations.addColumnBefore}>
                                <span>在左侧插入列</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleTableOperations.addColumnAfter}>
                                <span>在右侧插入列</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleTableOperations.deleteColumn}>
                                <span>删除列</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {/* 单元格操作 */}
                            <DropdownMenuItem onClick={handleTableOperations.mergeCells}>
                                <span>合并单元格</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleTableOperations.splitCell}>
                                <span>拆分单元格</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {/* 表头操作 */}
                            <DropdownMenuItem onClick={handleTableOperations.toggleHeaderRow}>
                                <span>切换表头行</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleTableOperations.toggleHeaderColumn}>
                                <span>切换表头列</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {/* 删除表格 */}
                            <DropdownMenuItem onClick={handleTableOperations.deleteTable}>
                                <Trash2Icon className="size-4 mr-2" />
                                <span>删除表格</span>
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>插入表格</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>行数</Label>
                            <Input
                                type="number"
                                min={1}
                                max={10}
                                value={rows}
                                onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>列数</Label>
                            <Input
                                type="number"
                                min={1}
                                max={10}
                                value={cols}
                                onChange={(e) => setCols(parseInt(e.target.value) || 1)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleTableOperations.insertTable}>插入</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

const LineHeightButton = () => {
    const { editor } = useEditorStore();
    if (!editor) return null;

    const lineHeights = [
        { label: "默认", value: "normal" },
        { label: "单倍行距", value: "1" },
        { label: "1.15倍行距", value: "1.15" },
        { label: "1.5倍行距", value: "1.5" },
        { label: "2倍行距", value: "2" },
    ]

    const setLineHeight = (height: string) => {
        editor.chain().focus().setLineHeight(height).run()
    }

    const currentLineHeight = editor.getAttributes('paragraph').lineHeight || 'normal'

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-7 min-w-7 shrink-0 flex items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
                    <ListCollapseIcon className="size-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-1 flex flex-col gap-y-1">
                {lineHeights.map(({ label, value }) => (
                    <button
                        key={value}
                        onClick={() => editor?.chain().focus().setLineHeight(value).run()}
                        className={cn(
                            "flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-200/80",
                            editor?.getAttributes("paragraph").lineHeight === value && "bg-neutral-200/80"
                        )}
                    >
                        <span className="text-sm">{label}</span>
                    </button>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

interface ToolbarButtonBaseProps {
    isVertical?: boolean;
}

const HeadingLevelButton = ({ isVertical }: ToolbarButtonBaseProps) => {
    const { editor } = useEditorStore();

    const HEADINGS = [
        { label: "正文", value: 0, fontSize: "16px", style: "font-normal" },
        { label: "标题 1", value: 1, fontSize: "32px", style: "font-bold" },
        { label: "标题 2", value: 2, fontSize: "24px", style: "font-bold" },
        { label: "标题 3", value: 3, fontSize: "20px", style: "font-bold" },
        { label: "标题 4", value: 4, fontSize: "18px", style: "font-bold" },
        { label: "标题 5", value: 5, fontSize: "16px", style: "font-bold" },
        { label: "标题 6", value: 6, fontSize: "14px", style: "font-bold" },
    ]

    const getCurrentHeading = () => {
        for (let level = 1; level <= 6; level++) {
            if (editor?.isActive("heading", { level })) {
                return HEADINGS.find(h => h.value === level)?.label || "正文"
            }
        }
        return "正文"
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className={cn(
                    "h-7 shrink-0 flex items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm",
                    isVertical ? "min-w-7" : "w-[120px]"
                )}>
                    {isVertical ? (
                        <HeadingIcon className="size-4" />
                    ) : (
                        <>
                            <span className="truncate">{getCurrentHeading()}</span>
                            <ChevronDownIcon className="ml-2 size-4 shrink-0" />
                        </>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-1 flex flex-col gap-y-1">
                {HEADINGS.map(({ label, value, fontSize, style }) => (
                    <button
                        key={value}
                        onClick={() => editor?.chain().focus().toggleHeading({ level: value as Level }).run()}
                        className={cn(
                            "flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-200/80",
                            editor?.isActive("heading", { level: value }) && "bg-neutral-200/80"
                        )}
                    >
                        <span className={cn("text-sm", style)} style={{ fontSize }}>{label}</span>
                    </button>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const FontFamilyButton = ({ isVertical }: ToolbarButtonBaseProps) => {
    const { editor } = useEditorStore();
    const [search, setSearch] = useState("");
    const [recentFonts, setRecentFonts] = useState<string[]>([]);
    const [menuPlacement, setMenuPlacement] = useState<"bottom" | "right">("bottom");

    const FONT_FAMILIES = [
        { label: "Arial", value: "Arial" },
        { label: "Times New Roman", value: "Times New Roman" },
        { label: "Courier New", value: "Courier New" },
        { label: "Verdana", value: "Verdana" },
        { label: "Georgia", value: "Georgia" },
        { label: "Comic Sans MS", value: "Comic Sans MS" },
        { label: "Impact", value: "Impact" },
        { label: "Lucida Console", value: "Lucida Console" },
        { label: "Tahoma", value: "Tahoma" },
        { label: "Trebuchet MS", value: "Trebuchet MS" },
        { label: "Arial Black", value: "Arial Black" },
        { label: "Palatino Linotype", value: "Palatino Linotype" },
        { label: "Lucida Sans Unicode", value: "Lucida Sans Unicode" },
        { label: "MS Sans Serif", value: "MS Sans Serif" },
        { label: "Courier", value: "Courier" },
        { label: "Lucida Grande", value: "Lucida Grande" },
        { label: "Bookman", value: "Bookman" },
        { label: "Garamond", value: "Garamond" },
        { label: "Candara", value: "Candara" },
        { label: "Calibri", value: "Calibri" },
    ];

    const filteredFonts = FONT_FAMILIES.filter(font =>
        font.label.toLowerCase().includes(search.toLowerCase())
    );

    const handleFontSelect = (font: string) => {
        editor?.chain().focus().setFontFamily(font).run();
        setRecentFonts(prev => [font, ...prev.filter(f => f !== font)].slice(0, 5));
    };

    const currentFont = editor?.getAttributes("textStyle").fontFamily || "Arial";

    useEffect(() => {
        const handleResize = () => {
            setMenuPlacement(window.innerWidth < 768 ? "right" : "bottom");
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className={cn(
                    "h-7 shrink-0 flex items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm",
                    isVertical ? "min-w-7" : "w-[120px]"
                )}>
                    {isVertical ? (
                        <span className="font-serif text-lg">A</span>
                    ) : (
                        <>
                            <span className="truncate">{currentFont}</span>
                            <ChevronDownIcon className="ml-2 size-4 shrink-0" />
                        </>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side={menuPlacement} align="start">
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                    {/* 搜索框 */}
                    <Input
                        placeholder="Search fonts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="mb-2"
                    />

                    {/* 最近使用的字体 */}
                    {recentFonts.length > 0 && (
                        <div className="mb-2">
                            <div className="text-xs text-gray-500 mb-1">最近使用</div>
                            <div className="grid grid-cols-2 gap-1">
                                {recentFonts.map((font) => (
                                    <button
                                        key={font}
                                        onClick={() => handleFontSelect(font)}
                                        className={cn(
                                            "flex items-center justify-center px-2 py-1 rounded-sm hover:bg-neutral-200/80",
                                            currentFont === font && "bg-neutral-200/80"
                                        )}
                                    >
                                        <span className="text-sm" style={{ fontFamily: font }}>{font}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 字体列表 */}
                    <div className="grid grid-cols-2 gap-1">
                        {filteredFonts.map(({ label, value }) => (
                            <button
                                key={value}
                                onClick={() => handleFontSelect(value)}
                                className={cn(
                                    "flex items-center justify-center px-2 py-1 rounded-sm hover:bg-neutral-200/80",
                                    currentFont === value && "bg-neutral-200/80"
                                )}
                            >
                                <span className="text-sm" style={{ fontFamily: value }}>{label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const FontSizeButton = ({ isVertical }: ToolbarButtonBaseProps) => {
    const { editor } = useEditorStore();
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [customSize, setCustomSize] = useState("");
    const [menuPlacement, setMenuPlacement] = useState<"bottom" | "right">("bottom");

    const FONT_SIZES = [
        { label: "8px", value: "8px" },
        { label: "9px", value: "9px" },
        { label: "10px", value: "10px" },
        { label: "11px", value: "11px" },
        { label: "12px", value: "12px" },
        { label: "14px", value: "14px" },
        { label: "16px", value: "16px" },
        { label: "18px", value: "18px" },
        { label: "20px", value: "20px" },
        { label: "24px", value: "24px" },
        { label: "28px", value: "28px" },
        { label: "32px", value: "32px" },
        { label: "36px", value: "36px" },
        { label: "48px", value: "48px" },
        { label: "60px", value: "60px" },
        { label: "72px", value: "72px" },
    ];

    const currentFontSize = editor?.getAttributes("textStyle").fontSize || "16px";
    const currentSizeLabel = FONT_SIZES.find(size => size.value === currentFontSize)?.label ||
        (currentFontSize ? `${parseInt(currentFontSize)}px` : "16px");

    const handleSizeSelect = (size: string) => {
        if (!size.endsWith('px')) {
            size = `${size}px`;
        }
        editor?.chain().focus().setFontSize(size).run();
    };

    const handleCustomSize = (value: string) => {
        const size = parseInt(value);
        if (!isNaN(size) && size > 0) {
            handleSizeSelect(`${size}px`);
            setCustomSize("");  // 清空输入
            setIsCustomizing(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // 只允许输入数字
        if (/^\d*$/.test(value)) {
            setCustomSize(value);
        }
    };

    // 获取显示的标签文本
    const getDisplayLabel = () => {
        const fontSize = editor?.getAttributes("textStyle").fontSize;
        if (!fontSize) return "16px";

        const preset = FONT_SIZES.find(size => size.value === fontSize);
        if (preset) return preset.label;

        const size = parseInt(fontSize);
        return !isNaN(size) ? `${size}px` : "16px";
    };

    useEffect(() => {
        const handleResize = () => {
            setMenuPlacement(window.innerWidth < 768 ? "right" : "bottom");
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className={cn(
                    "h-7 shrink-0 flex items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm",
                    isVertical ? "min-w-7" : "w-[80px]"
                )}>
                    {isVertical ? (
                        <div className="flex items-baseline">
                            <span className="text-xs">A</span>
                            <span className="text-base ml-0.5">A</span>
                        </div>
                    ) : (
                        <>
                            <span className="truncate">{getDisplayLabel()}</span>
                            <ChevronDownIcon className="ml-2 size-4 shrink-0" />
                        </>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side={menuPlacement} align="start">
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                    {/* 预设字号 */}
                    {FONT_SIZES.map((size) => (
                        <button
                            key={size.value}
                            onClick={() => handleSizeSelect(size.value)}
                            className={cn(
                                "w-full flex items-center justify-between px-2 py-1.5 rounded-sm hover:bg-neutral-200/80",
                                currentFontSize === size.value && "bg-neutral-200/80"
                            )}
                        >
                            <span className="text-sm">{size.label}</span>
                            <span className="text-xs text-gray-500">{parseInt(size.value)}px</span>
                        </button>
                    ))}

                    <Separator className="my-1" />

                    {/* 自定义字号 */}
                    {isCustomizing ? (
                        <div className="px-2 py-1.5">
                            <Input
                                type="text"
                                value={customSize}
                                onChange={handleInputChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleCustomSize(customSize);
                                    }
                                    if (e.key === 'Escape') {
                                        setIsCustomizing(false);
                                        setCustomSize("");
                                    }
                                }}
                                onBlur={() => {
                                    if (customSize) {
                                        handleCustomSize(customSize);
                                    } else {
                                        setIsCustomizing(false);
                                    }
                                }}
                                className="h-7"
                                placeholder="输入字号..."
                                autoFocus
                            />
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsCustomizing(true)}
                            className="w-full flex items-center px-2 py-1.5 rounded-sm hover:bg-neutral-200/80"
                        >
                            <span className="text-sm">自定义...</span>
                        </button>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const ListButton = () => {
    const { editor } = useEditorStore();

    const lists = [
        {
            label: "Bullet List",
            value: "bulletList",
            icon: ListIcon,
            onClick: () => editor?.chain().focus().toggleBulletList().run(),
            isActive: editor?.isActive("bulletList"),
        },
        {
            label: "Ordered List",
            value: "orderedList",
            icon: ListOrderedIcon,
            onClick: () => editor?.chain().focus().toggleOrderedList().run(),
            isActive: editor?.isActive("orderedList"),
        },
    ]
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-7 min-w-7 shrink-0 flex items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
                    <ListIcon className="size-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-1 flex flex-col gap-y-1">
                {lists.map(({ label, icon: Icon, onClick, isActive }) => (
                    <button
                        key={label}
                        onClick={onClick}
                        className={cn(
                            "flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-200/80",
                            isActive && "bg-neutral-200/80"
                        )}
                    >
                        <Icon className="size-4 mr-2" />
                        <span className="text-sm">{label}</span>
                    </button>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const AlignButton = () => {
    const { editor } = useEditorStore();
    const alignments = [
        { label: "Align Left", value: "left", icon: AlignLeftIcon },
        { label: "Align Center", value: "center", icon: AlignCenterIcon },
        { label: "Align Right", value: "right", icon: AlignRightIcon },
        { label: "Align Justify", value: "justify", icon: AlignJustifyIcon },
    ];
    const [value, setValue] = useState("left");

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-7 min-w-7 shrink-0 flex items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
                    <AlignLeftIcon className="size-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-1 flex flex-col gap-y-1">
                {alignments.map(({ label, value, icon: Icon }) => (
                    <button
                        key={value}
                        onClick={() => editor?.chain().focus().setTextAlign(value).run()}
                        className={cn(
                            "flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-200/80",
                            editor?.isActive({ TextAlignlign: value }) && "bg-neutral-200/80"
                        )}
                    >
                        <Icon className="size-4 mr-2" />
                        <span className="text-sm">{label}</span>
                    </button>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const ImageButton = () => {
    const { editor } = useEditorStore();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [menuPlacement, setMenuPlacement] = useState<"bottom" | "right">("bottom");

    const onChange = (url: string) => {
        editor?.chain().focus().setImage({ src: url }).run();
    }

    const onUpload = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64Data = reader.result as string;
                    onChange(base64Data);
                };
                reader.readAsDataURL(file);
            }
        }
        input.click();
    }

    const convertUrlToBase64 = async (url: string): Promise<string> => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error converting image to base64:', error);
            throw error;
        }
    };

    const handleImageUrlSubmit = async () => {
        if (imageUrl) {
            try {
                const base64Data = await convertUrlToBase64(imageUrl);
                onChange(base64Data);
                setImageUrl("");
                setIsDialogOpen(false);
            } catch (error) {
                console.error('Failed to load image:', error);
                // Add error handling UI here
            }
        }
    }

    useEffect(() => {
        const handleResize = () => {
            setMenuPlacement(window.innerWidth < 768 ? "right" : "bottom");
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="h-7 min-w-7 shrink-0 flex items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
                        <ImageIcon className="size-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side={menuPlacement} align="start">
                    <DropdownMenuItem onClick={onUpload}>
                        <UploadIcon className="size-4 mr-2" />
                        <span>Upload</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                        <SearchIcon className="size-4 mr-2" />
                        <span>Paste image URL</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Paste image URL</DialogTitle>
                    </DialogHeader>
                    <Input
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleImageUrlSubmit()
                            }
                        }}
                    />
                    <DialogFooter>
                        <Button onClick={handleImageUrlSubmit}>Insert</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}


const LinkButton = () => {
    const { editor } = useEditorStore();
    const [value, setValue] = useState("");

    const onChange = (href: string) => {
        editor?.chain().focus().extendMarkRange("link").setLink({ href }).run();
        setValue("");
    }

    return (
        <DropdownMenu onOpenChange={(open) => {
            if (!open) {
                setValue(editor?.getAttributes("link").href || "")
            }
        }}>
            <DropdownMenuTrigger asChild>
                <button className="h-7 min-w-7 shrink-0 flex items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
                    <Link2Icon className="size-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2.5 flex items-center gap-x-2">
                <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="https://example.com"
                />
                <Button
                    onClick={() => onChange(value)}
                >
                    Apply
                </Button>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

// 预设颜色配置
const PRESET_COLORS = {
    theme: [
        { label: "黑色", value: "#000000" },
        { label: "深灰", value: "#444444" },
        { label: "深红", value: "#8B0000" },
        { label: "红色", value: "#FF0000" },
        { label: "橙色", value: "#FFA500" },
        { label: "黄色", value: "#FFFF00" },
        { label: "绿色", value: "#008000" },
        { label: "青色", value: "#00FFFF" },
        { label: "蓝色", value: "#0000FF" },
        { label: "紫色", value: "#800080" },
    ],
    standard: [
        { value: "#FFFFFF", id: "white" },
        { value: "#000000", id: "black" },
        { value: "#EEECE1", id: "light-gray-1" },
        { value: "#1F497D", id: "dark-blue-1" },
        { value: "#4F81BD", id: "blue-1" },
        { value: "#C0504D", id: "red-1" },
        { value: "#9BBB59", id: "green-1" },
        { value: "#8064A2", id: "purple-1" },
        { value: "#4BACC6", id: "cyan-1" },
        { value: "#F79646", id: "orange-1" },

        { value: "#F2F2F2", id: "gray-2" },
        { value: "#7F7F7F", id: "gray-3" },
        { value: "#DDD9C3", id: "light-gray-2" },
        { value: "#C6D9F0", id: "light-blue-1" },
        { value: "#DBE5F1", id: "light-blue-2" },
        { value: "#F2DCDB", id: "light-red-1" },
        { value: "#EBF1DD", id: "light-green-1" },
        { value: "#E5E0EC", id: "light-purple-1" },
        { value: "#DBEEF3", id: "light-cyan-1" },
        { value: "#FDE9D9", id: "light-orange-1" },

        { value: "#D8D8D8", id: "gray-4" },
        { value: "#595959", id: "gray-5" },
        { value: "#C4BD97", id: "tan-1" },
        { value: "#8DB3E2", id: "blue-2" },
        { value: "#B8CCE4", id: "blue-3" },
        { value: "#E5B9B7", id: "red-2" },
        { value: "#D7E3BC", id: "green-2" },
        { value: "#CCC1D9", id: "purple-2" },
        { value: "#B7DDE8", id: "cyan-2" },
        { value: "#FBD5B5", id: "orange-2" },

        { value: "#BFBFBF", id: "gray-6" },
        { value: "#3F3F3F", id: "gray-7" },
        { value: "#A5A5A5", id: "gray-8" },
        { value: "#262626", id: "gray-9" },
        { value: "#494429", id: "tan-3" },
        { value: "#17365D", id: "dark-blue-2" },
        { value: "#366092", id: "blue-6" },
        { value: "#953734", id: "red-4" },
        { value: "#76923C", id: "green-4" },
        { value: "#5F497A", id: "purple-4" },
        { value: "#31859B", id: "cyan-4" },
        { value: "#E36C09", id: "orange-4" },
    ],
};

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    type: "text" | "highlight";
    buttonContent: React.ReactNode;
}

const ColorPicker = ({ value, onChange, type, buttonContent }: ColorPickerProps) => {
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [customColor, setCustomColor] = useState(value);

    const handleColorChange = (color: ColorResult) => {
        setCustomColor(color.hex);
    };

    const handleApply = () => {
        if (customColor) {
            onChange(customColor);
            setIsCustomizing(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-7 min-w-7 shrink-0 flex items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
                    {buttonContent}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[282px]">
                <div className="p-2">
                    {/* 主题颜色 */}
                    <div className="mb-4">
                        <div className="text-xs text-gray-500 mb-2">主题颜色</div>
                        <div className="grid grid-cols-10 gap-1">
                            {PRESET_COLORS.theme.map((color) => (
                                <button
                                    key={color.value}
                                    className={cn(
                                        "w-6 h-6 rounded-sm border border-gray-200",
                                        value === color.value && "ring-2 ring-blue-500"
                                    )}
                                    style={{ backgroundColor: color.value }}
                                    onClick={() => onChange(color.value)}
                                    title={color.label}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 标准颜色 */}
                    <div className="mb-4">
                        <div className="text-xs text-gray-500 mb-2">标准颜色</div>
                        <div className="grid grid-cols-10 gap-1">
                            {PRESET_COLORS.standard.map((color) => (
                                <button
                                    key={color.id}
                                    className={cn(
                                        "w-6 h-6 rounded-sm border border-gray-200",
                                        value === color.value && "ring-2 ring-blue-500"
                                    )}
                                    style={{ backgroundColor: color.value }}
                                    onClick={() => onChange(color.value)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 自定义颜色 */}
                    <div>
                        <div className="text-xs text-gray-500 mb-2">自定义颜色</div>
                        {isCustomizing ? (
                            <div>
                                <SketchPicker
                                    color={customColor}
                                    onChange={handleColorChange}
                                    className="!w-full !shadow-none !p-0 !bg-transparent"
                                    presetColors={[]}
                                    disableAlpha={true}
                                />
                                <div className="flex items-center gap-2 mt-2">
                                    <Button
                                        size="sm"
                                        onClick={handleApply}
                                        className="flex-1"
                                    >
                                        应用
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setIsCustomizing(false);
                                            setCustomColor(value);
                                        }}
                                        className="flex-1"
                                    >
                                        取消
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setIsCustomizing(true)}
                            >
                                自定义颜色...
                            </Button>
                        )}
                    </div>

                    {/* 清除格式 */}
                    {type === "highlight" && (
                        <>
                            <Separator className="my-2" />
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => onChange("transparent")}
                            >
                                清除高亮
                            </Button>
                        </>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const TextColorButton = () => {
    const { editor } = useEditorStore();
    const currentColor = editor?.getAttributes("textStyle").color || "#000000";

    const handleColorChange = (color: string) => {
        editor?.chain().focus().setColor(color).run();
    };

    return (
        <ColorPicker
            value={currentColor}
            onChange={handleColorChange}
            type="text"
            buttonContent={
                <span
                    style={{ color: currentColor }}
                >
                    <Baseline className="size-4" />
                </span>
            }
        />
    );
};

const HighlightColorButton = () => {
    const { editor } = useEditorStore();
    const currentColor = editor?.getAttributes("highlight").color || "transparent";

    const handleColorChange = (color: string) => {
        editor?.chain().focus().setHighlight({ color }).run();
    };

    return (
        <ColorPicker
            value={currentColor}
            onChange={handleColorChange}
            type="highlight"
            buttonContent={
                <div className="relative">
                    <HighlighterIcon style={{ color: currentColor === "transparent" ? "#000" : currentColor }} className="size-4" />
                    {/* <div
                        className="absolute bottom-0 left-0 right-0 h-0.5"

                    /> */}
                </div>
            }
        />
    );
};

interface ToolbarButtonProps {
    onClick: () => void;
    isActive?: boolean;
    icon: LucideIcon;
}

const ToolbarButton = memo(({
    onClick,
    isActive,
    icon: Icon,
}: ToolbarButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "text-sm h-7 min-w-7 flex items-center justify-center rounded-sm",
                "hover:bg-neutral-200/80 transition-colors duration-200",
                isActive && "bg-neutral-200/80"
            )}
        >
            <Icon className="size-4" />
        </button>
    );
});

const MathButton = () => {
    const { editor } = useEditorStore()
    const [showInlineDialog, setShowInlineDialog] = useState(false)
    const [showDisplayDialog, setShowDisplayDialog] = useState(false)

    const handleInlineMath = (text: string) => {
        editor?.chain().focus().setMathInline({ text }).run()
    }

    const handleDisplayMath = (text: string) => {
        editor?.chain().focus().setMathDisplay({ text }).run()
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="h-7 min-w-7 flex items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 text-sm">
                        <Sigma className="size-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setShowInlineDialog(true)}>
                        <span className="text-sm">行内公式</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowDisplayDialog(true)}>
                        <span className="text-sm">行间公式</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <MathInputDialog
                open={showInlineDialog}
                onClose={() => setShowInlineDialog(false)}
                onConfirm={handleInlineMath}
                displayMode={false}
            />

            <MathInputDialog
                open={showDisplayDialog}
                onClose={() => setShowDisplayDialog(false)}
                onConfirm={handleDisplayMath}
                displayMode={true}
            />
        </>
    )
}

const CodeButton = () => {
    const { editor } = useEditorStore();
    if (!editor) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "h-7 min-w-7 flex items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 text-sm",
                        (editor.isActive('code') || editor.isActive('codeBlock')) && "active"
                    )}
                >
                    <Code2Icon className="size-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={cn(editor.isActive('code') && "bg-accent")}
                >
                    <span>行内代码</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={cn(editor.isActive('codeBlock') && "bg-accent")}
                >
                    <span>代码块</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

interface ToolbarProps {
    defaultVertical?: boolean;
}

export const Toolbar = ({ defaultVertical = false }: ToolbarProps) => {
    const { editor } = useEditorStore()
    const [isVertical, setIsVertical] = useState(defaultVertical);

    useEffect(() => {
        const handleResize = () => {
            // 如果是默认纵向，则始终保持纵向
            if (defaultVertical) {
                setIsVertical(true);
            } else {
                setIsVertical(window.innerWidth < 768);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [defaultVertical]);

    const sections: {
        label: string;
        icon: LucideIcon;
        onClick: () => void;
        isActive?: boolean;
    }[][] = [
            [
                {
                    label: "Undo",
                    icon: Undo2Icon,
                    onClick: () => editor?.chain().focus().undo().run(),
                },
                {
                    label: "Redo",
                    icon: Redo2Icon,
                    onClick: () => editor?.chain().focus().redo().run(),
                },
                {
                    label: "Print",
                    icon: PrinterIcon,
                    onClick: () => window.print(),
                },
                {
                    label: "Spellcheck",
                    icon: SpellCheckIcon,
                    onClick: () => {
                        const current = editor?.view.dom.getAttribute("spellcheck")
                        editor?.view.dom.setAttribute("spellcheck", current === "false" ? "true" : "false")
                    },
                },
            ],
            [
                {
                    label: "Bold",
                    icon: BoldIcon,
                    isActive: editor?.isActive("bold"),
                    onClick: () => editor?.chain().focus().toggleBold().run(),
                },
                {
                    label: "Italic",
                    icon: ItalicIcon,
                    isActive: editor?.isActive("italic"),
                    onClick: () => editor?.chain().focus().toggleItalic().run(),
                },
                {
                    label: "Underline",
                    icon: UnderlineIcon,
                    isActive: editor?.isActive("underline"),
                    onClick: () => editor?.chain().focus().toggleUnderline().run(),
                }
            ],
            [
                {
                    label: "List Todo",
                    icon: ListTodoIcon,
                    onClick: () => {
                        editor?.chain().focus().toggleTaskList().run()
                    },
                    isActive: editor?.isActive("taskList"),
                },
                {
                    label: "Remove Format",
                    icon: RemoveFormattingIcon,
                    onClick: () => {
                        editor?.chain().focus().unsetAllMarks().run()
                    },
                    isActive: editor?.isActive("removeFormatting"),
                }
            ]
        ];

    return (
        <div className={cn(
            "w-full flex justify-center",
            "dark:bg-gray-800 dark:border-gray-700"
        )}>
            <div className={cn(
                "transition-all duration-300",
                isVertical ? [
                    "fixed right-4 top-1/2 -translate-y-1/2 z-50",
                    "flex flex-col gap-y-1 p-2 rounded-lg shadow-lg",
                    "max-h-[90vh] overflow-y-auto",
                    "bg-[#F1F4F9]/10 backdrop-blur-sm dark:bg-gray-900/90"
                ] : [
                    "bg-[#F1F4F9] dark:bg-gray-900",
                    "px-2 py-0.5",
                    "min-h-[40px] flex items-center justify-center",
                    "flex-wrap",
                    "max-w-[1000px] w-full"
                ]
            )}>
                {/* 工具栏分组 */}
                <div className={cn(
                    "flex gap-0.5",
                    isVertical ? "flex-col" : "items-center flex-shrink-0"
                )}>
                    {/* 基础工具组 */}
                    <div className={cn(
                        "flex gap-0.5",
                        isVertical ? "flex-col" : "items-center"
                    )}>
                        <HeadingLevelButton isVertical={isVertical} />
                        <FontFamilyButton isVertical={isVertical} />
                        <FontSizeButton isVertical={isVertical} />
                        {sections[1].map((item) => (
                            <ToolbarButton
                                key={item.label}
                                onClick={item.onClick}
                                icon={item.icon}
                            />
                        ))}
                    </div>

                    {/* 分隔线 */}
                    <Separator
                        className={cn(
                            "bg-neutral-300",
                            isVertical ? "h-px w-full my-1" : "w-px h-6"
                        )}
                    />

                    {/* 格式工具组 */}
                    <div className={cn(
                        "flex gap-0.5",
                        isVertical ? "flex-col" : "items-center"
                    )}>
                        <TextColorButton />
                        <HighlightColorButton />
                        <LinkButton />
                        <ImageButton />
                        <TableButton />
                        <AlignButton />
                        <LineHeightButton />
                        <ListButton />
                        <MathButton />
                        <CodeButton />
                    </div>

                    {/* 分隔线 */}
                    <Separator
                        className={cn(
                            "bg-neutral-300",
                            isVertical ? "h-px w-full my-1" : "w-px h-6"
                        )}
                    />

                    {/* 其他工具组 */}
                    <div className={cn(
                        "flex gap-0.5",
                        isVertical ? "flex-col" : "items-center"
                    )}>
                        {sections[2].map((item) => (
                            <ToolbarButton
                                key={item.label}
                                onClick={item.onClick}
                                icon={item.icon}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}