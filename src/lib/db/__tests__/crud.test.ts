import { PrismaClient } from '@prisma/client'
import { createTag, deleteTag } from '../tag'
import { createPaper, updatePaper, deletePaper, getPaper } from '../paper'
import { createNote, updateNote, deleteNote, getNote } from '../note'

const prisma = new PrismaClient()

describe('CRUD 操作测试', () => {
    // 在每个测试后清理数据库
    afterEach(async () => {
        await prisma.tagsOnPapers.deleteMany()
        await prisma.tagsOnNotes.deleteMany()
        await prisma.notesOnPapers.deleteMany()
        await prisma.tag.deleteMany()
        await prisma.paper.deleteMany()
        await prisma.note.deleteMany()
    })

    describe('基础创建操作', () => {
        test('应该能够创建标签', async () => {
            const tag = await createTag({ name: '机器学习' })
            expect(tag.name).toBe('机器学习')
        })

        test('应该能够创建论文', async () => {
            const paper = await createPaper({
                name: '示例论文',
                url: 'https://example.com/paper',
                annotations: '这是一篇示例论文'
            })
            expect(paper.name).toBe('示例论文')
        })

        test('应该能够创建笔记', async () => {
            const note = await createNote({
                name: '示例笔记',
                content: '这是一篇示例笔记'
            })
            expect(note.name).toBe('示例笔记')
        })
    })

    describe('关联创建操作', () => {
        test('应该能够创建带标签的论文', async () => {
            // 1. 先创建标签
            const tag1 = await createTag({ name: '机器学习' })
            const tag2 = await createTag({ name: '深度学习' })

            // 2. 创建带标签的论文
            const paper = await createPaper({
                name: '示例论文',
                url: 'https://example.com/paper',
                tagIds: [tag1.id, tag2.id]
            })

            // 3. 验证关联关系
            const paperWithTags = await getPaper(paper.id)
            expect(paperWithTags).not.toBeNull()
            if (paperWithTags) {
                expect(paperWithTags.tags).toHaveLength(2)
                expect(paperWithTags.tags.map((t: { tag: { name: string } }) => t.tag.name)).toContain('机器学习')
            }
        })

        test('应该能够创建带笔记的论文', async () => {
            // 1. 先创建笔记
            const note = await createNote({
                name: '论文笔记',
                content: '这是论文笔记'
            })

            // 2. 创建带笔记的论文
            const paper = await createPaper({
                name: '示例论文',
                url: 'https://example.com/paper',
                noteIds: [note.id]
            })

            // 3. 验证关联关系
            const paperWithNotes = await getPaper(paper.id)
            expect(paperWithNotes).not.toBeNull()
            if (paperWithNotes) {
                expect(paperWithNotes.notes).toHaveLength(1)
                expect(paperWithNotes.notes[0].note.name).toBe('论文笔记')
            }
        })
    })

    describe('更新操作', () => {
        test('应该能够更新论文信息和关联', async () => {
            // 1. 创建初始数据
            const paper = await createPaper({
                name: '原始论文',
                url: 'https://example.com/paper'
            })
            const tag = await createTag({ name: '机器学习' })

            // 2. 更新论文
            const updatedPaper = await updatePaper(paper.id, {
                name: '更新后的论文',
                addTagIds: [tag.id]
            })

            // 3. 验证更新
            const paperWithTags = await getPaper(paper.id)
            expect(paperWithTags).not.toBeNull()
            if (paperWithTags) {
                expect(paperWithTags.name).toBe('更新后的论文')
                expect(paperWithTags.tags).toHaveLength(1)
            }
        })

        test('应该能够更新笔记信息和关联', async () => {
            // 1. 创建初始数据
            const note = await createNote({
                name: '原始笔记',
                content: '原始内容'
            })
            const tag = await createTag({ name: '学习笔记' })

            // 2. 更新笔记
            const updatedNote = await updateNote(note.id, {
                content: '更新后的内容',
                addTagIds: [tag.id]
            })

            // 3. 验证更新
            const noteWithTags = await getNote(note.id)
            expect(noteWithTags).not.toBeNull()
            if (noteWithTags) {
                expect(noteWithTags.content).toBe('更新后的内容')
                expect(noteWithTags.tags).toHaveLength(1)
            }
        })
    })

    describe('删除操作', () => {
        test('应该能够删除论文及其关联', async () => {
            // 1. 创建带标签和笔记的论文
            const tag = await createTag({ name: '机器学习' })
            const note = await createNote({ name: '笔记' })
            const paper = await createPaper({
                name: '示例论文',
                url: 'https://example.com/paper',
                tagIds: [tag.id],
                noteIds: [note.id]
            })

            // 2. 删除论文
            await deletePaper(paper.id)

            // 3. 验证删除
            const deletedPaper = await getPaper(paper.id)
            expect(deletedPaper).toBeNull()

            // 4. 验证标签和笔记仍然存在
            const tagStillExists = await prisma.tag.findUnique({ where: { id: tag.id } })
            const noteStillExists = await prisma.note.findUnique({ where: { id: note.id } })
            expect(tagStillExists).not.toBeNull()
            expect(noteStillExists).not.toBeNull()
        })
    })

    describe('错误处理', () => {
        test('创建重复标签名应该抛出错误', async () => {
            await createTag({ name: '机器学习' })
            await expect(createTag({ name: '机器学习' }))
                .rejects
                .toThrow('标签名称已存在')
        })

        test('删除不存在的论文应该抛出错误', async () => {
            await expect(deletePaper('non-existent-id'))
                .rejects
                .toThrow()
        })
    })
})