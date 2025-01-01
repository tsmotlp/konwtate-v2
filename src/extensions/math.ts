import { Node, mergeAttributes } from '@tiptap/core'
import katex from 'katex'
import { Node as ProseMirrorNode } from 'prosemirror-model'

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        mathematics: {
            setMathInline: (options: { text: string }) => ReturnType
            setMathDisplay: (options: { text: string }) => ReturnType
        }
    }
}

export const Mathematics = Node.create({
    name: 'mathematics',

    addOptions() {
        return {
            renderLabel({ node }: { node: ProseMirrorNode }) {
                return node.attrs.displayMode ? '行间公式' : '行内公式'
            },
        }
    },

    addAttributes() {
        return {
            text: {
                default: '',
                parseHTML: element => element.getAttribute('data-text') || '',
                renderHTML: attributes => ({
                    'data-text': attributes.text,
                }),
            },
            displayMode: {
                default: false,
                parseHTML: element => element.getAttribute('data-display') === 'true',
                renderHTML: attributes => ({
                    'data-display': attributes.displayMode.toString(),
                }),
            },
        }
    },

    group: 'inline',
    inline: true,
    atom: false,
    selectable: true,
    draggable: true,

    parseHTML() {
        return [
            {
                tag: 'span[data-type="math-inline"]',
                getAttrs: (node: HTMLElement | string): any => {
                    if (typeof node === 'string') return null
                    return {
                        text: node.getAttribute('data-text') || '',
                        displayMode: false,
                    }
                },
            },
            {
                tag: 'div[data-type="math-display"]',
                getAttrs: (node: HTMLElement | string): any => {
                    if (typeof node === 'string') return null
                    return {
                        text: node.getAttribute('data-text') || '',
                        displayMode: true,
                        atom: true,
                    }
                },
            },
        ]
    },

    renderHTML({ node }) {
        try {
            const renderedKatex = katex.renderToString(node.attrs.text || '', {
                displayMode: node.attrs.displayMode,
                throwOnError: false,
            })

            if (node.attrs.displayMode) {
                return ['div', {
                    class: 'math-display-wrapper',
                    'data-type': 'math-display',
                    'data-text': node.attrs.text,
                    'data-display': 'true',
                }, ['div', {
                    class: 'math-node math-display'
                }, ['div', {
                    class: 'katex-display'
                }, renderedKatex]]]
            }

            return ['span', {
                class: 'math-node math-inline',
                'data-type': 'math-inline',
                'data-text': node.attrs.text,
                'data-display': 'false',
            }, renderedKatex]
        } catch (error) {
            console.error('Math rendering error:', error)
            return [node.attrs.displayMode ? 'div' : 'span', {
                class: `math-node math-error ${node.attrs.displayMode ? 'math-display' : 'math-inline'}`,
                'data-type': node.attrs.displayMode ? 'math-display' : 'math-inline',
                'data-text': node.attrs.text,
                'data-display': node.attrs.displayMode.toString(),
            }, node.attrs.text]
        }
    },

    addCommands() {
        return {
            setMathInline: options => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: {
                        ...options,
                        displayMode: false,
                    },
                })
            },
            setMathDisplay: options => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: {
                        ...options,
                        displayMode: true,
                    },
                })
            },
        }
    },

    addNodeView() {
        return ({ node, editor, getPos }) => {
            const dom = document.createElement(node.attrs.displayMode ? 'div' : 'span')
            dom.classList.add('math-node')
            dom.classList.add(node.attrs.displayMode ? 'math-display' : 'math-inline')
            if (node.attrs.displayMode) {
                dom.classList.add('math-display-wrapper')
            }
            dom.setAttribute('data-type', node.attrs.displayMode ? 'math-display' : 'math-inline')
            dom.setAttribute('data-display', node.attrs.displayMode.toString())

            const renderMath = () => {
                try {
                    const rendered = katex.renderToString(node.attrs.text || '', {
                        displayMode: node.attrs.displayMode,
                        throwOnError: false,
                    })
                    dom.innerHTML = rendered
                } catch (error) {
                    console.error('Math rendering error:', error)
                    dom.classList.add('math-error')
                    dom.textContent = node.attrs.text || ''
                }
            }

            renderMath()

            dom.addEventListener('dblclick', () => {
                if (typeof getPos === 'function') {
                    const event = new CustomEvent('edit-math', {
                        detail: {
                            text: node.attrs.text,
                            displayMode: node.attrs.displayMode,
                            pos: getPos(),
                        },
                        bubbles: true,
                    })
                    dom.dispatchEvent(event)
                }
            })

            return {
                dom,
                update: (updatedNode: ProseMirrorNode) => {
                    if (updatedNode.type !== node.type) return false
                    if (updatedNode.attrs.text !== node.attrs.text) {
                        node = updatedNode
                        renderMath()
                    }
                    return true
                },
            }
        }
    },
})