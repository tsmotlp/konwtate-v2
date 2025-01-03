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

    // 确保 content 被正确序列化
    const serializedContent = content ? JSON.stringify(content) : null

    try {
        return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // 1. 创建笔记
            const note = await tx.note.create({
                data: {
                    name,
                    content: serializedContent
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
    content?: any;  // 修改为 any 类型以支持 JSON
    addTagIds?: string[];
    removeTagIds?: string[];
    addPaperIds?: string[];
    removePaperIds?: string[];
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

    // 序列化 content
    const serializedContent = content ? JSON.stringify(content) : null

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1. 更新笔记基本信息
        const note = await tx.note.update({
            where: { id },
            data: {
                name,
                content: serializedContent
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


// 获取与指定论文相关的笔记（基于共同标签）
export async function getRelatedNotes(paperId: string) {
    // 1. 首先获取论文的标签
    const paper = await prisma.paper.findUnique({
        where: { id: paperId },
        include: {
            tags: {
                select: {
                    tagId: true
                }
            }
        }
    });

    if (!paper?.tags.length) {
        return [];
    }

    const paperTagIds = paper.tags.map(t => t.tagId);

    // 2. 查找具有相同标签的笔记
    return await prisma.note.findMany({
        where: {
            tags: {
                some: {
                    tagId: {
                        in: paperTagIds
                    }
                }
            }
        },
        include: {
            tags: {
                include: {
                    tag: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
}

// 获取相关内容（论文和笔记）
export async function getRelatedContent(noteId: string, limit = 5) {
    const note = await prisma.note.findUnique({
        where: { id: noteId },
        include: {
            tags: {
                include: {
                    tag: true
                }
            }
        }
    });

    if (!note) return { relatedPapers: [], relatedNotes: [] };

    // 获取当前笔记的所有标签ID
    const tagIds = note.tags.map(t => t.tagId);

    // 并行获取相关论文和笔记
    const [relatedPapers, relatedNotes] = await Promise.all([
        // 查找具有相同标签的论文
        prisma.paper.findMany({
            where: {
                tags: {
                    some: {
                        tagId: {
                            in: tagIds
                        }
                    }
                }
            },
            include: {
                tags: {
                    include: {
                        tag: true
                    }
                }
            },
            take: limit
        }),
        // 查找具有相同标签的其他笔记
        prisma.note.findMany({
            where: {
                AND: [
                    { id: { not: noteId } },
                    {
                        tags: {
                            some: {
                                tagId: {
                                    in: tagIds
                                }
                            }
                        }
                    }
                ]
            },
            include: {
                tags: {
                    include: {
                        tag: true
                    }
                }
            },
            take: limit
        })
    ]);

    return { relatedPapers, relatedNotes };
}