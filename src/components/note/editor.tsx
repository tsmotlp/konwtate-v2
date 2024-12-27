'use client'

import 'katex/dist/katex.min.css'
// import '@benrbray/prosemirror-math/style/math.css'

import { useEditor, EditorContent } from '@tiptap/react'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import Image from '@tiptap/extension-image'
import ImageResizer from 'tiptap-extension-resize-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import StarterKit from '@tiptap/starter-kit'
import { Mathematics } from '@/extensions/math'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Document from '@tiptap/extension-document'

import { all, createLowlight } from 'lowlight'
import { useEditorStore } from '@/hooks/use-editor-store'
import { FontSizeExtension } from '@/extensions/font-size'
import { LineHeightExtension } from '@/extensions/line-height'
import { useCallback, useEffect, useState } from 'react'
import { debounce } from 'lodash'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'
import { MathInputDialog } from '../math-input-dialog'


import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import python from 'highlight.js/lib/languages/python'
// create a lowlight instance with all languages loaded
const lowlight = createLowlight(all)

// This is only an example, all supported languages are already loaded above
// but you can also register only specific languages to reduce bundle-size
lowlight.register('html', html)
lowlight.register('css', css)
lowlight.register('js', js)
lowlight.register('ts', ts)
lowlight.register('python', python)

interface NoteEditorProps {
    initialContent?: string;  // 添加初始内容属性
    noteId?: string;         // 添加可选的 noteId
    containerHeight?: string; // 新增容器高度属性
}

export const NoteEditor = ({ initialContent, noteId: propNoteId, containerHeight = "500px" }: NoteEditorProps) => {
    const params = useParams()
    const { setEditor } = useEditorStore()

    // 使用 prop 中的 noteId，如果没有则使用 URL 参数中的
    const noteId = propNoteId || params.noteId

    const debouncedSave = useCallback(
        debounce(async (content: string) => {
            if (!noteId) return;

            try {
                const response = await fetch(`/api/notes/${noteId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content }),
                });

                if (!response.ok) {
                    throw new Error('保存失败');
                }
            } catch (error) {
                console.error('保存笔记失败:', error);
                toast.error('保存失败');
            }
        }, 1000),
        [noteId]
    );

    const editor = useEditor({
        autofocus: true,
        onCreate({ editor }) {
            setEditor(editor)
        },
        onDestroy() {
            setEditor(null)
        },
        onUpdate({ editor }) {
            setEditor(editor)
            const content = editor.getHTML()
            debouncedSave(content)
        },
        onSelectionUpdate({ editor }) {
            setEditor(editor)
        },
        onTransaction({ editor }) {
            setEditor(editor)
        },
        onFocus({ editor }) {
            setEditor(editor)
        },
        onBlur({ editor }) {
            setEditor(editor)
        },
        editorProps: {
            attributes: {
                class: 'prose prose-slate dark:prose-invert max-w-none focus:outline-none w-full bg-white dark:bg-gray-900 print:border-0',
                style: 'padding: 1rem 1rem; min-height: 100%;',
            },
        },
        parseOptions: {
            preserveWhitespace: false,
        },
        extensions: [
            FontSizeExtension,
            LineHeightExtension.configure({
                types: ['paragraph', 'heading'],
                defaultLineHeight: 'normal',
            }),
            StarterKit,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Table.configure({
                resizable: true,
                allowTableNodeSelection: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Image.configure({
                inline: true,
                allowBase64: true,
                HTMLAttributes: {
                    class: 'editor-image',
                },
            }),
            ImageResizer.configure({
                allowBase64: true,
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
            Mathematics,
            Underline,
            TextStyle,
            FontFamily,
            Color,
            Highlight.configure({ multicolor: true }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Link.configure({
                openOnClick: true,
                autolink: true,
                defaultProtocol: 'https',
                protocols: ['http', 'https'],
                isAllowedUri: (url, ctx) => {
                    try {
                        // construct URL
                        const parsedUrl = url.includes(':') ? new URL(url) : new URL(`${ctx.defaultProtocol}://${url}`)

                        // use default validation
                        if (!ctx.defaultValidate(parsedUrl.href)) {
                            return false
                        }

                        // disallowed protocols
                        const disallowedProtocols = ['ftp', 'file', 'mailto']
                        const protocol = parsedUrl.protocol.replace(':', '')

                        if (disallowedProtocols.includes(protocol)) {
                            return false
                        }

                        // only allow protocols specified in ctx.protocols
                        const allowedProtocols = ctx.protocols.map(p => (typeof p === 'string' ? p : p.scheme))

                        if (!allowedProtocols.includes(protocol)) {
                            return false
                        }

                        // disallowed domains
                        const disallowedDomains = ['example-phishing.com', 'malicious-site.net']
                        const domain = parsedUrl.hostname

                        if (disallowedDomains.includes(domain)) {
                            return false
                        }

                        // all checks have passed
                        return true
                    } catch (error) {
                        return false
                    }
                },
                shouldAutoLink: url => {
                    try {
                        // construct URL
                        const parsedUrl = url.includes(':') ? new URL(url) : new URL(`https://${url}`)

                        // only auto-link if the domain is not in the disallowed list
                        const disallowedDomains = ['example-no-autolink.com', 'another-no-autolink.com']
                        const domain = parsedUrl.hostname

                        return !disallowedDomains.includes(domain)
                    } catch (error) {
                        return false
                    }
                },

            }),
            Document.configure({
                isolating: true
            }),
        ],
        content: initialContent || '', // 使用传入的初始内容
    })

    // 在组件卸载时取消未执行的防抖保存
    useEffect(() => {
        return () => {
            debouncedSave.cancel()
        }
    }, [debouncedSave])

    // 只在没有 initialContent 时从服务器加载内容
    useEffect(() => {
        if (!initialContent && noteId && editor) {
            const fetchNote = async () => {
                try {
                    const response = await fetch(`/api/notes/${noteId}`)
                    const note = await response.json()

                    if (note.content) {
                        editor.commands.setContent(note.content)
                    }
                } catch (error) {
                    console.error('获取笔记内容失败:', error)
                    toast.error('加载笔记内容失败')
                }
            }
            fetchNote()
        }
    }, [editor, noteId, initialContent])

    const [mathDialogState, setMathDialogState] = useState({
        open: false,
        displayMode: false,
        initialText: '',
        pos: 0,
    })

    useEffect(() => {
        const handleEditMath = (event: CustomEvent) => {
            const { text, displayMode, pos } = event.detail
            setMathDialogState({
                open: true,
                displayMode,
                initialText: text,
                pos,
            })
        }

        // 添加事件监听
        document.addEventListener('edit-math', handleEditMath as EventListener)

        return () => {
            // 清理事件监听
            document.removeEventListener('edit-math', handleEditMath as EventListener)
        }
    }, [editor])

    const handleMathUpdate = (text: string) => {
        if (!editor) return

        const { pos, displayMode } = mathDialogState
        editor
            .chain()
            .focus()
            .setNodeSelection(pos)
            .deleteSelection()
            .insertContent({
                type: 'mathematics',
                attrs: {
                    text,
                    displayMode,
                },
            })
            .run()

        setMathDialogState(prev => ({ ...prev, open: false }))
    }

    return (
        <div className="flex flex-col w-full" style={{ height: containerHeight }}>
            <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto custom-scrollbar">
                    <div className="w-full h-full max-w-5xl mx-auto">
                        <EditorContent
                            editor={editor}
                            className="h-full"
                        />
                    </div>
                </div>
            </div>

            {/* 添加数学公式编辑对话框 */}
            <MathInputDialog
                open={mathDialogState.open}
                onClose={() => setMathDialogState(prev => ({ ...prev, open: false }))}
                onConfirm={handleMathUpdate}
                initialText={mathDialogState.initialText}
                displayMode={mathDialogState.displayMode}
            />
        </div>
    )
}