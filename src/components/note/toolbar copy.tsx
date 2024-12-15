"use client"

import { useEditorStore } from "@/hooks/use-editor-store";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon, BoldIcon, ChevronDownIcon, HighlighterIcon, ImageIcon, ItalicIcon, Link2Icon, LinkIcon, ListCollapseIcon, ListIcon, ListOrderedIcon, ListTodoIcon, LucideIcon, MessageSquareIcon, MinusIcon, PlusIcon, PrinterIcon, Redo2Icon, RedoIcon, RemoveFormattingIcon, SearchIcon, SpellCheckIcon, UnderlineIcon, Undo2Icon, UploadIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { type Level } from "@tiptap/extension-heading"
import { type ColorResult, CirclePicker, SketchPicker } from "react-color"
import { useState, memo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogHeader, DialogContent, DialogTitle, Dialog } from "@/components/ui/dialog";

const LineHeightButton = () => {
    const { editor } = useEditorStore();

    const lineHeights = [
        { label: "Default", value: "normal" },
        { label: "Single", value: "1" },
        { label: "1.15", value: "1.15" },
        { label: "1.5", value: "1.5" },
        { label: "Double", value: "2" },
    ]
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

    const currentFontSize = editor?.getAttributes("textStyle").fontSize
        ? editor?.getAttributes("textStyle").fontSize.replace("px", "")
        : "16";

    const [fontSize, setFontSize] = useState(currentFontSize);
    const [inputValue, setInputValue] = useState(fontSize);
    const [isEditing, setIsEditing] = useState(false);

    const updateFontSize = (newSize: string) => {
        const size = parseInt(newSize);
        if (!isNaN(size) && size > 0) {
            editor?.chain().focus().setFontSize(`${size}px`).run();
            setFontSize(newSize);
            setInputValue(newSize);
            setIsEditing(false);
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    }

    const handleInputBlur = () => {
        updateFontSize(inputValue);
    }

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            updateFontSize(inputValue);
            editor?.commands.focus();
        }
    }

    const increment = () => {
        const newSize = parseInt(inputValue) + 1;
        updateFontSize(newSize.toString());
    }

    const decrement = () => {
        const newSize = parseInt(inputValue) - 1;
        if (newSize > 0) {
            updateFontSize(newSize.toString());
        }
    }


    return (
        <div className="flex items-center gap-x-0.5">
            <button
                className="h-7 w-7 shrink-0 flex items-center justify-center rounded-sm hover:bg-neutral-200/80"
                onClick={decrement}
            >
                <MinusIcon className="size-4" />
            </button>
            {isEditing ? (
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    onBlur={handleInputBlur}
                    className="h-7 w-10 text-sm text-center border border-neutral-400 rounded-sm bg-transparent focus:outline-none focus:ring-0"
                />
            ) : (
                <button
                    className="h-7 w-10 text-sm text-center border border-neutral-400 rounded-sm bg-transparent cursor-text"
                    onClick={() => {
                        setIsEditing(true)
                        setFontSize(currentFontSize)
                    }}
                >
                    {currentFontSize}
                </button>
            )}
            <button
                className="h-7 w-7 shrink-0 flex items-center justify-center rounded-sm hover:bg-neutral-200/80"
                onClick={increment}
            >
                <PlusIcon className="size-4" />
            </button>
        </div>
    )
}

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

const TextColorButton = () => {
    const { editor } = useEditorStore();

    const value = editor?.getAttributes("textStyle").color || "#000000";

    const onChange = (color: ColorResult) => {
        editor?.chain().focus().setColor(color.hex).run();
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
                    <span className="text-xs">A</span>
                    <div className="h-0.5 w-full" style={{ backgroundColor: value }} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-0">
                <SketchPicker onChange={onChange} color={value} />
            </DropdownMenuContent>

        </DropdownMenu>
    )
}


const HighlightColorButton = () => {
    const { editor } = useEditorStore();

    const value = editor?.getAttributes("highlight").color || "#FFFFFF";

    const onChange = (color: ColorResult) => {
        editor?.chain().focus().setHighlight({ color: color.hex }).run();
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
                    <HighlighterIcon className="size-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-0">
                <SketchPicker onChange={onChange} color={value} />
            </DropdownMenuContent>

        </DropdownMenu>
    )
}


const HeadingLevelButton = () => {
    const { editor } = useEditorStore();
    const headings = [
        { label: "Normal text", value: 0, fontSize: "16px" },
        { label: "Heading 1", value: 1, fontSize: "32px" },
        { label: "Heading 2", value: 2, fontSize: "24px" },
        { label: "Heading 3", value: 3, fontSize: "20px" },
        { label: "Heading 4", value: 4, fontSize: "18px" },
        { label: "Heading 5", value: 5, fontSize: "16px" },
    ]

    const getCurrentHeading = () => {
        for (let level = 1; level <= 5; level++) {
            if (editor?.isActive("heading", { level })) {
                return `Heading ${level}`
            }
        }
        return "Normal text"
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-7 w-[120px] shrink-0 flex items-center justify-between rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
                    <span className="truncate">
                        {getCurrentHeading() || "Normal text"}
                    </span>
                    <ChevronDownIcon className="ml-2 size-4 shrink-0" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-1 flex flex-col gap-y-1">
                {headings.map(({ label, value, fontSize }) => (
                    <button
                        key={value}
                        className={cn(
                            "flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-200/80",
                            (value === 0 && !editor?.isActive("heading")) || editor?.isActive("heading", { level: value }) && "bg-neutral-200/80"
                        )}
                        onClick={() => {
                            if (value === 0) {
                                editor?.chain().focus().setParagraph().run();
                            } else {
                                editor?.chain().focus().toggleHeading({ level: value as Level }).run();
                            }
                        }}
                        style={{ fontSize }}
                    >
                        <span className="text-sm">{label}</span>
                    </button>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const FontFamilyButton = () => {
    const { editor } = useEditorStore();
    const fonts = [
        { label: "系统默认", value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif" },
        { label: "思源黑体", value: "'Source Han Sans SC', 'Noto Sans SC', sans-serif" },
        { label: "思源宋体", value: "'Source Han Serif SC', 'Noto Serif SC', serif" },
        { label: "微软雅黑", value: "'Microsoft YaHei', 'PingFang SC', sans-serif" },
        { label: "苹方", value: "'PingFang SC', 'Microsoft YaHei', sans-serif" },
        { label: "宋体", value: "'SimSun', serif" },
        { label: "黑体", value: "'SimHei', sans-serif" },
        { label: "楷体", value: "'KaiTi', serif" },
        { label: "仿宋", value: "'FangSong', serif" },
        // 英文字体
        { label: "Arial", value: "Arial, sans-serif" },
        { label: "Times New Roman", value: "'Times New Roman', serif" },
    ]

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-7 w-[120px] shrink-0 flex items-center justify-between rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
                    <span className="truncate">
                        {fonts.find(font =>
                            editor?.getAttributes("textStyle").fontFamily === font.value
                        )?.label || "系统默认"}
                    </span>
                    <ChevronDownIcon className="ml-2 size-4 shrink-0" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-1 flex flex-col gap-y-1">
                {fonts.map(({ label, value }) => (
                    <button
                        key={value}
                        className={cn(
                            "flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-200/80",
                            editor?.getAttributes("textStyle").fontFamily === value && "bg-neutral-200/80"
                        )}
                        style={{ fontFamily: value }}
                        onClick={() => {
                            editor?.chain().focus().setFontFamily(value).run()
                        }}
                    >
                        <span className="text-sm">
                            {label}
                        </span>
                    </button>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

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