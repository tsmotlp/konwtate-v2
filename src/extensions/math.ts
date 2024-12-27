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
    atom: true,

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

            const tag = node.attrs.displayMode ? 'div' : 'span'
            const attrs = mergeAttributes({
                class: `math-node ${node.attrs.displayMode ? 'math-display' : 'math-inline'}`,
                'data-type': node.attrs.displayMode ? 'math-display' : 'math-inline',
                'data-text': node.attrs.text,
                'data-display': node.attrs.displayMode.toString(),
            })

            if (node.attrs.displayMode) {
                return [
                    'div',
                    { class: 'math-display-wrapper' },
                    [
                        tag,
                        attrs,
                        ['div', { class: 'math-render-container' }, renderedKatex]
                    ]
                ]
            }

            return [tag, attrs, renderedKatex]
        } catch (error) {
            console.error('Math rendering error:', error)
            const tag = node.attrs.displayMode ? 'div' : 'span'
            return [tag, mergeAttributes({
                class: `math-node math-error`,
                'data-type': node.attrs.displayMode ? 'math-display' : 'math-inline',
                'data-text': node.attrs.text,
                'data-display': node.attrs.displayMode.toString(),
            }), node.attrs.text || '']
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
            const dom = document.createElement('div')
            dom.classList.add('math-display-wrapper')

            const mathContainer = document.createElement(node.attrs.displayMode ? 'div' : 'span')
            mathContainer.classList.add('math-node')
            mathContainer.classList.add(node.attrs.displayMode ? 'math-display' : 'math-inline')
            mathContainer.setAttribute('data-type', node.attrs.displayMode ? 'display' : 'inline')

            const renderContainer = document.createElement('div')
            renderContainer.classList.add('math-render-container')

            const renderMath = () => {
                try {
                    const rendered = katex.renderToString(node.attrs.text || '', {
                        displayMode: node.attrs.displayMode,
                        throwOnError: false,
                    })
                    renderContainer.innerHTML = rendered
                } catch (error) {
                    console.error('Math rendering error:', error)
                    mathContainer.classList.add('math-error')
                    renderContainer.textContent = node.attrs.text || ''
                }
            }

            renderMath()

            if (node.attrs.displayMode) {
                mathContainer.appendChild(renderContainer)
                dom.appendChild(mathContainer)
            } else {
                dom.appendChild(renderContainer)
            }

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