import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import katex from "katex"

interface MathInputDialogProps {
    open: boolean
    onClose: () => void
    onConfirm: (text: string) => void
    initialText?: string
    displayMode?: boolean
}

export function MathInputDialog({
    open,
    onClose,
    onConfirm,
    initialText = "",
    displayMode = false,
}: MathInputDialogProps) {
    useEffect(() => {
        if (open && initialText) {
            setText(initialText)
            try {
                const rendered = katex.renderToString(initialText, {
                    displayMode,
                    throwOnError: false,
                })
                setPreview(rendered)
                setError("")
            } catch (err) {
                setError(err instanceof Error ? err.message : "渲染错误")
            }
        }
    }, [open, initialText, displayMode])

    const [text, setText] = useState(initialText)
    const [preview, setPreview] = useState("")
    const [error, setError] = useState<string>("")

    const handleInput = (value: string) => {
        setText(value)
        try {
            const rendered = katex.renderToString(value, {
                displayMode,
                throwOnError: false,
            })
            setPreview(rendered)
            setError("")
        } catch (err) {
            setError(err instanceof Error ? err.message : "渲染错误")
        }
    }

    const handleConfirm = () => {
        onConfirm(text)
        onClose()
    }

    const handleClose = () => {
        setText("")
        setPreview("")
        setError("")
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{displayMode ? "编辑行间公式" : "编辑行内公式"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                    <Textarea
                        value={text}
                        onChange={(e) => handleInput(e.target.value)}
                        placeholder="输入 LaTeX 公式..."
                        className="font-mono"
                    />
                    <div className="rounded border p-4">
                        <div className="text-sm text-muted-foreground mb-2">预览：</div>
                        {error ? (
                            <div className="text-red-500 text-sm">{error}</div>
                        ) : (
                            <div
                                dangerouslySetInnerHTML={{ __html: preview }}
                                className={displayMode ? "text-center" : ""}
                            />
                        )}
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            className="px-4 py-2 text-sm rounded bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={handleConfirm}
                        >
                            确认
                        </button>
                        <button
                            className="px-4 py-2 text-sm rounded bg-secondary text-secondary-foreground hover:bg-secondary/90"
                            onClick={handleClose}
                        >
                            取消
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 