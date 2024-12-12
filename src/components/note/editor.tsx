'use client'

import 'katex/dist/katex.min.css'

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
import { Mathematics } from '@tiptap-pro/extension-mathematics'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'

import { all, createLowlight } from 'lowlight'
import { useEditorStore } from '@/hooks/use-editor-store'

// create a lowlight instance with all languages loaded
const lowlight = createLowlight(all)

// // This is only an example, all supported languages are already loaded above
// // but you can also register only specific languages to reduce bundle-size
// lowlight.register('html', html)
// lowlight.register('css', css)
// lowlight.register('js', js)
// lowlight.register('ts', ts)

export const NoteEditor = () => {
    const { setEditor } = useEditorStore()
    const editor = useEditor({
        onCreate({ editor }) {
            setEditor(editor)
        },
        onDestroy() {
            setEditor(null)
        },
        onUpdate({ editor }) {
            setEditor(editor)
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
                style: 'padding-left:56px; padding-right:56px;',
                class: 'focus:outline-none print:border-0 bg-white border border-[#C7C7C7] flex flex-col min-h-[1054px] w-[816px] pt-10 pr-14 pb-10 cursor-text'
            },
        },
        extensions: [
            StarterKit,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Image,
            ImageResizer,
            CodeBlockLowlight.configure({
                lowlight,
            }),
            Mathematics.configure({
                katexOptions: {
                    throwOnError: false,
                    strict: false,
                    displayMode: true,
                },
            }),
            Underline,
            TextStyle,
            FontFamily,
            Color,
            Highlight.configure({ multicolor: true })
        ],
        content: `
            <h1>数学公式测试</h1>
            <p>行内公式：$a^2 + b^2 = c^2$</p>
            <p>显示公式：</p>
            $
            \\begin{aligned}
            f(x) &= x^2 + 2x + 1 \\\\
            &= (x + 1)^2
            \\end{aligned}
            $
        `,
    })

    return (
        <div className="size-full overflow-x-auto bg-[#F9FBFD] px-4 print:p-0 print:bg-white print:overflow-visible">
            <div className="min-w-max flex justify-center w-[816px] py-4 print:py-0 mx-auto print:w-full print:min-w-0">
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}