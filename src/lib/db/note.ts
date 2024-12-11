import { PrismaClient, Prisma } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

const prisma = new PrismaClient()

// 创建笔记的接口定义
interface CreateNoteOptions {
    name: string;
    content?: string;
    tagIds?: string[];    // 可选的标签ID数组
    paperIds?: string[];  // 可选的论文ID数组
}

// 创建笔记
export async function createNote(options: CreateNoteOptions) {
    const { name, content, tagIds = [], paperIds = [] } = options

    try {
        return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // 1. 创建笔记
            const note = await tx.note.create({
                data: {
                    name,
                    content
                }
            })

            // 2. 建立与标签的关联
            if (tagIds.length > 0) {
                await Promise.all(
                    tagIds.map(tagId =>
                        tx.tagsOnNotes.create({
                            data: {
                                noteId: note.id,
                                tagId
                            }
                        })
                    )
                )
            }

            // 3. 建立与论文的关联
            if (paperIds.length > 0) {
                await Promise.all(
                    paperIds.map(paperId =>
                        tx.notesOnPapers.create({
                            data: {
                                noteId: note.id,
                                paperId
                            }
                        })
                    )
                )
            }

            return note
        })
    } catch (error: unknown) {
        if (error instanceof PrismaClientKnownRequestError) {
            throw new Error('创建笔记失败')
        }
        throw error
    }
}

// 获取单个笔记
export async function getNote(id: string) {
    return await prisma.note.findUnique({
        where: { id },
        include: {
            tags: {
                include: {
                    tag: true
                }
            },
            papers: {
                include: {
                    paper: true
                }
            }
        }
    })
}

// 获取所有笔记
export async function getAllNotes() {
    return await prisma.note.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            tags: {
                include: {
                    tag: true
                }
            },
            papers: {
                include: {
                    paper: true
                }
            }
        }
    })
}

// 更新笔记的接口定义
interface UpdateNoteOptions {
    name?: string;
    content?: string;
    addTagIds?: string[];     // 要添加的标签ID数组
    removeTagIds?: string[];  // 要移除的标签ID数组
    addPaperIds?: string[];   // 要添加的论文ID数组
    removePaperIds?: string[]; // 要移除的论文ID数组
}

// 更新笔记
export async function updateNote(id: string, options: UpdateNoteOptions) {
    const {
        name,
        content,
        addTagIds = [],
        removeTagIds = [],
        addPaperIds = [],
        removePaperIds = []
    } = options

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1. 更新笔记基本信息
        const note = await tx.note.update({
            where: { id },
            data: {
                name,
                content
            }
        })

        // 2. 处理标签关系
        if (removeTagIds.length > 0) {
            await tx.tagsOnNotes.deleteMany({
                where: {
                    noteId: id,
                    tagId: { in: removeTagIds }
                }
            })
        }

        if (addTagIds.length > 0) {
            await Promise.all(
                addTagIds.map(tagId =>
                    tx.tagsOnNotes.create({
                        data: {
                            noteId: id,
                            tagId
                        }
                    })
                )
            )
        }

        // 3. 处理论文关系
        if (removePaperIds.length > 0) {
            await tx.notesOnPapers.deleteMany({
                where: {
                    noteId: id,
                    paperId: { in: removePaperIds }
                }
            })
        }

        if (addPaperIds.length > 0) {
            await Promise.all(
                addPaperIds.map(paperId =>
                    tx.notesOnPapers.create({
                        data: {
                            noteId: id,
                            paperId
                        }
                    })
                )
            )
        }

        return note
    })
}

// 删除笔记
export async function deleteNote(id: string) {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 删除与标签的关联
        await tx.tagsOnNotes.deleteMany({
            where: { noteId: id }
        })

        // 删除与论文的关联
        await tx.notesOnPapers.deleteMany({
            where: { noteId: id }
        })

        // 删除笔记本身
        return await tx.note.delete({
            where: { id }
        })
    })
}

// 搜索笔记
export async function searchNotes(keyword: string) {
    return await prisma.note.findMany({
        where: {
            OR: [
                { name: { contains: keyword } },
                { content: { contains: keyword } }
            ]
        },
        include: {
            tags: {
                include: {
                    tag: true
                }
            },
            papers: {
                include: {
                    paper: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
} 