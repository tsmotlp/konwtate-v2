"use client"

import { useEditorStore } from "@/hooks/use-editor-store";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon, BoldIcon, ChevronDownIcon, HighlighterIcon, ImageIcon, ItalicIcon, Link2Icon, LinkIcon, ListCollapseIcon, ListIcon, ListOrderedIcon, ListTodoIcon, LucideIcon, MessageSquareIcon, MinusIcon, PlusIcon, PrinterIcon, Redo2Icon, RedoIcon, RemoveFormattingIcon, SearchIcon, SpellCheckIcon, UnderlineIcon, Undo2Icon, UploadIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { type Level } from "@tiptap/extension-heading"
import { type ColorResult, SketchPicker } from "react-color"
import { useState, memo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogHeader, DialogContent, DialogTitle, Dialog } from "@/components/ui/dialog";
import { MathInputDialog } from '@/components/math-input-dialog'

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

const FontSizeButton = () => {
    const { editor } = useEditorStore();
    const [customSize, setCustomSize] = useState("");
    const [isCustomizing, setIsCustomizing] = useState(false);

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

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-7 w-[80px] shrink-0 flex items-center justify-between rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
                    <span className="truncate">{getDisplayLabel()}</span>
                    <ChevronDownIcon className="ml-2 size-4 shrink-0" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
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

    const onChange = (url: string) => {
        editor?.chain().focus().setImage({ src: url }).run();
    }

    const onUpload = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const imgUrl = URL.createObjectURL(file);
                onChange(imgUrl);
            }
        }
        input.click();
    }

    const handleImageUrlSubmit = () => {
        if (imageUrl) {
            onChange(imageUrl);
            setImageUrl("");
            setIsDialogOpen(false);
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="h-7 min-w-7 shrink-0 flex items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
                        <ImageIcon className="size-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
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
        { value: "#938953", id: "tan-2" },
        { value: "#548DD4", id: "blue-4" },
        { value: "#95B3D7", id: "blue-5" },
        { value: "#D99694", id: "red-3" },
        { value: "#C3D69B", id: "green-3" },
        { value: "#B2A2C7", id: "purple-3" },
        { value: "#92CDDC", id: "cyan-3" },
        { value: "#FAC08F", id: "orange-3" },

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
                    className="font-semibold text-base leading-none"
                    style={{ color: currentColor }}
                >
                    A
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
                    <HighlighterIcon className="size-4" />
                    <div
                        className="absolute bottom-0 left-0 right-0 h-0.5"
                        style={{ backgroundColor: currentColor === "transparent" ? "#000" : currentColor }}
                    />
                </div>
            }
        />
    );
};

const HeadingLevelButton = () => {
    const { editor } = useEditorStore();
    const headings = [
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
                return headings.find(h => h.value === level)?.label || "正文"
            }
        }
        return "正文"
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-7 w-[120px] shrink-0 flex items-center justify-between rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
                    <span className="truncate">
                        {getCurrentHeading()}
                    </span>
                    <ChevronDownIcon className="ml-2 size-4 shrink-0" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[240px]">
                <div className="p-1 flex flex-col gap-y-1">
                    {headings.map(({ label, value, fontSize, style }) => (
                        <button
                            key={value}
                            className={cn(
                                "flex flex-col gap-y-0.5 px-3 py-2 rounded-sm hover:bg-neutral-200/80",
                                (value === 0 && !editor?.isActive("heading")) ||
                                editor?.isActive("heading", { level: value }) && "bg-neutral-200/80"
                            )}
                            onClick={() => {
                                if (value === 0) {
                                    editor?.chain().focus().setParagraph().run();
                                } else {
                                    editor?.chain().focus().toggleHeading({ level: value as Level }).run();
                                }
                            }}
                        >
                            {/* 标题预览 */}
                            <div
                                className="text-left w-full truncate"
                                style={{
                                    fontSize,
                                    fontWeight: style.includes('bold') ? 'bold' : 'normal',
                                    lineHeight: '1.2',
                                    color: value === 0 ? '#666' : '#000'
                                }}
                            >
                                {label}
                            </div>
                            {/* 标题说明 */}
                            <div className="text-xs text-gray-500">
                                {value === 0 ?
                                    "正文文本" :
                                    `标题 ${value} (${fontSize})`
                                }
                            </div>
                        </button>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

// 字体配置
const FONT_FAMILIES = [
    { label: "微软雅黑", value: "'Microsoft YaHei', 'PingFang SC', sans-serif" },
    { label: "宋体", value: "'SimSun', serif" },
    { label: "黑体", value: "'SimHei', sans-serif" },
    { label: "楷体", value: "'KaiTi', serif" },
    { label: "仿宋", value: "'FangSong', serif" },
    { label: "思源黑体", value: "'Source Han Sans SC', 'Noto Sans SC', sans-serif" },
    { label: "思源宋体", value: "'Source Han Serif SC', 'Noto Serif SC', serif" },
    { label: "苹方", value: "'PingFang SC', 'Microsoft YaHei', sans-serif" },
    { label: "华文黑体", value: "'STHeiti', sans-serif" },
    { label: "华文楷体", value: "'STKaiti', serif" },
    { label: "华文宋体", value: "'STSong', serif" },
    { label: "华文仿宋", value: "'STFangsong', serif" },
    { label: "华文中宋", value: "'STZhongsong', serif" },
    { label: "华文琥珀", value: "'STHupo', sans-serif" },
    { label: "华文新魏", value: "'STXinwei', serif" },
    { label: "华文隶书", value: "'STLiti', serif" },
    { label: "冬青黑体", value: "'Hiragino Sans GB', sans-serif" },
    { label: "兰亭黑", value: "'Lantinghei SC', sans-serif" },
    { label: "翩翩体", value: "'Hanzipen SC', cursive" },
    { label: "手札体", value: "'Hannotate SC', cursive" },
    { label: "娃娃体", value: "'Wawati SC', cursive" },
    { label: "圆体", value: "'Yuanti SC', sans-serif" },
    { label: "Arial", value: "Arial, sans-serif" },
    { label: "Times New Roman", value: "'Times New Roman', serif" },
    { label: "Helvetica", value: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Verdana", value: "Verdana, sans-serif" },
    { label: "Tahoma", value: "Tahoma, sans-serif" },
    { label: "Calibri", value: "Calibri, sans-serif" },
    { label: "Segoe UI", value: "'Segoe UI', sans-serif" },
];

// 字号配置
const FONT_SIZES = [
    { label: "初号", value: "42px" },
    { label: "小初", value: "36px" },
    { label: "一号", value: "26px" },
    { label: "小一", value: "24px" },
    { label: "二号", value: "22px" },
    { label: "小二", value: "18px" },
    { label: "三号", value: "16px" },
    { label: "小三", value: "15px" },
    { label: "四号", value: "14px" },
    { label: "小四", value: "12px" },
    { label: "五号", value: "10.5px" },
    { label: "小五", value: "9px" },
];

const FontFamilyButton = () => {
    const { editor } = useEditorStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [recentFonts, setRecentFonts] = useState<typeof FONT_FAMILIES[0][]>([]);

    const handleFontSelect = (font: typeof FONT_FAMILIES[0]) => {
        editor?.chain().focus().setFontFamily(font.value).run();
        setRecentFonts(prev => {
            const newFonts = [font, ...prev.filter(f => f.value !== font.value)].slice(0, 5);
            try {
                localStorage.setItem('recentFonts', JSON.stringify(newFonts));
            } catch (e) {
                console.error('Failed to save recent fonts');
            }
            return newFonts;
        });
    };

    useEffect(() => {
        try {
            const saved = localStorage.getItem('recentFonts');
            if (saved) {
                setRecentFonts(JSON.parse(saved));
            }
        } catch (e) {
            console.error('Failed to load recent fonts');
        }
    }, []);

    const filteredFonts = FONT_FAMILIES.filter(font =>
        font.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-7 w-[120px] shrink-0 flex items-center justify-between rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
                    <span className="truncate">
                        {FONT_FAMILIES.find(font =>
                            editor?.getAttributes("textStyle").fontFamily === font.value
                        )?.label || "默认字体"}
                    </span>
                    <ChevronDownIcon className="ml-2 size-4 shrink-0" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
                <div className="p-2 border-b">
                    <Input
                        placeholder="搜索字体..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8"
                    />
                </div>

                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {/* 最近使用的字体 */}
                    {recentFonts.length > 0 && (
                        <>
                            <div className="px-1 py-1.5">
                                <div className="px-2 py-1.5 text-xs text-gray-500">最近使用</div>
                                {recentFonts.map((font) => (
                                    <button
                                        key={font.value}
                                        onClick={() => handleFontSelect(font)}
                                        className={cn(
                                            "w-full flex items-center px-2 py-1.5 rounded-sm hover:bg-neutral-200/80",
                                            editor?.getAttributes("textStyle").fontFamily === font.value && "bg-neutral-200/80"
                                        )}
                                        style={{ fontFamily: font.value }}
                                    >
                                        <span className="text-sm">{font.label}</span>
                                    </button>
                                ))}
                            </div>
                            <Separator className="my-1" />
                        </>
                    )}

                    {/* 所有字体 */}
                    <div className="px-1 py-1.5">
                        {filteredFonts.map((font) => (
                            <button
                                key={font.value}
                                onClick={() => handleFontSelect(font)}
                                className={cn(
                                    "w-full flex items-center px-2 py-1.5 rounded-sm hover:bg-neutral-200/80",
                                    editor?.getAttributes("textStyle").fontFamily === font.value && "bg-neutral-200/80"
                                )}
                                style={{ fontFamily: font.value }}
                            >
                                <span className="text-sm">{font.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
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
                        <span className="text-lg">∑</span>
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

export const Toolbar = () => {
    const { editor } = useEditorStore()
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
            "max-w-5xl mx-auto w-full",
            "dark:bg-gray-800 dark:border-gray-700"
        )}>
            <div className={cn(
                "bg-[#F1F4F9] dark:bg-gray-900",
                "px-2.5 py-0.5 rounded-[24px]",
                "min-h-[40px] flex items-center justify-start gap-x-0.5",
                "overflow-x-auto custom-scrollbar"
            )}>
                {sections[0].map((item) => (
                    <ToolbarButton
                        key={item.label}
                        onClick={item.onClick}
                        icon={item.icon}
                    />
                ))}
                <Separator orientation="vertical" className="h-6 bg-neutral-300" />
                <FontFamilyButton />
                <Separator orientation="vertical" className="h-6 bg-neutral-300" />
                <HeadingLevelButton />
                <Separator orientation="vertical" className="h-6 bg-neutral-300" />
                <FontSizeButton />
                <Separator orientation="vertical" className="h-6 bg-neutral-300" />
                {sections[1].map((item) => (
                    <ToolbarButton
                        key={item.label}
                        onClick={item.onClick}
                        icon={item.icon}
                    />
                ))}

                <Separator orientation="vertical" className="h-6 bg-neutral-300" />
                <TextColorButton />
                <HighlightColorButton />
                <LinkButton />
                <ImageButton />
                <AlignButton />
                <LineHeightButton />
                <ListButton />
                <MathButton />
                {sections[2].map((item) => (
                    <ToolbarButton
                        key={item.label}
                        onClick={item.onClick}
                        icon={item.icon}
                    />
                ))}
            </div>
        </div>
    )
}