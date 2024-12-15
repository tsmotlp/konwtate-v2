import { PrismaClient, Prisma } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

const prisma = new PrismaClient()

// 创建论文的接口定义
interface CreatePaperOptions {
    name: string;
    url: string;
    annotations?: string;
    tagIds?: string[];  // 可选的标签ID数组
    noteIds?: string[]; // 可选的笔记ID数组
}

// 创建论文
export async function createPaper(options: CreatePaperOptions) {
    const { name, url, annotations, tagIds = [], noteIds = [] } = options

    try {
        return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // 1. 创建论文
            const paper = await tx.paper.create({
                data: {
                    name,
                    url,
                    annotations
                }
            })

            // 2. 建立与标签的关联
            if (tagIds.length > 0) {
                await Promise.all(
                    tagIds.map(tagId =>
                        tx.tagsOnPapers.create({
                            data: {
                                paperId: paper.id,
                                tagId
                            }
                        })
                    )
                )
            }

            // 3. 建立与笔记的关联
            if (noteIds.length > 0) {
                await Promise.all(
                    noteIds.map(noteId =>
                        tx.notesOnPapers.create({
                            data: {
                                paperId: paper.id,
                                noteId
                            }
                        })
                    )
                )
            }

            return paper
        })
    } catch (error: unknown) {
        if (error instanceof PrismaClientKnownRequestError) {
            throw new Error('创建论文失败')
        }
        throw error
    }
}

// 获取单篇论文
export async function getPaper(id: string) {
    return await prisma.paper.findUnique({
        where: { id },
        include: {
            tags: {
                include: {
                    tag: true
                }
            },
            notes: {
                include: {
                    note: true
                }
            }
        }
    })
}

// 获取所有论文
export async function getAllPapers() {
    return await prisma.paper.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            tags: {
                include: {
                    tag: true
                }
            },
            notes: {
                include: {
                    note: true
                }
            }
        }
    })
}

// 更新论文的接口定义
interface UpdatePaperOptions {
    name?: string;
    url?: string;
    annotations?: string;
    addTagIds?: string[];    // 要添加的标签ID数组
    removeTagIds?: string[]; // 要移除的标签ID数组
    addNoteIds?: string[];   // 要添加的笔记ID数组
    removeNoteIds?: string[]; // 要移除的笔记ID数组
}

// 更新论文
export async function updatePaper(id: string, options: UpdatePaperOptions) {
    const {
        name,
        url,
        annotations,
        addTagIds = [],
        removeTagIds = [],
        addNoteIds = [],
        removeNoteIds = []
    } = options

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1. 更新论文基本信息
        const paper = await tx.paper.update({
            where: { id },
            data: {
                name,
                url,
                annotations
            }
        })

        // 2. 处理标签关系
        if (removeTagIds.length > 0) {
            await tx.tagsOnPapers.deleteMany({
                where: {
                    paperId: id,
                    tagId: { in: removeTagIds }
                }
            })
        }

        if (addTagIds.length > 0) {
            await Promise.all(
                addTagIds.map(tagId =>
                    tx.tagsOnPapers.create({
                        data: {
                            paperId: id,
                            tagId
                        }
                    })
                )
            )
        }

        // 3. 处理笔记关系
        if (removeNoteIds.length > 0) {
            await tx.notesOnPapers.deleteMany({
                where: {
                    paperId: id,
                    noteId: { in: removeNoteIds }
                }
            })
        }

        if (addNoteIds.length > 0) {
            await Promise.all(
                addNoteIds.map(noteId =>
                    tx.notesOnPapers.create({
                        data: {
                            paperId: id,
                            noteId
                        }
                    })
                )
            )
        }

        return paper
    })
}

// 删除论文
export async function deletePaper(id: string) {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 删除与标签的关联
        await tx.tagsOnPapers.deleteMany({
            where: { paperId: id }
        })

        // 删除与笔记的关联
        await tx.notesOnPapers.deleteMany({
            where: { paperId: id }
        })

        // 删除论文本身
        return await tx.paper.delete({
            where: { id }
        })
    })
}

// 搜索论文
export async function searchPapers(keyword: string) {
    return await prisma.paper.findMany({
        where: {
            OR: [
                { name: { contains: keyword } },
                { annotations: { contains: keyword } }
            ]
        },
        include: {
            tags: {
                include: {
                    tag: true
                }
            },
            notes: {
                include: {
                    note: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
}

// 获取相关论文
export async function getRelatedPapers(paperId: string, limit = 5) {
    const paper = await prisma.paper.findUnique({
        where: { id: paperId },
        include: {
            tags: {
                include: {
                    tag: true
                }
            }
        }
    });

    if (!paper) return [];

    // 获取当前论文的所有标签ID
    const tagIds = paper.tags.map(t => t.tagId);

    // 查找具有相同标签的其他论文
    const relatedPapers = await prisma.paper.findMany({
        where: {
            AND: [
                { id: { not: paperId } }, // 排除当前论文
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
    });

    return relatedPapers;
}

// 获取相关内容（论文和笔记）
export async function getRelatedContent(paperId: string, limit = 5) {
    const paper = await prisma.paper.findUnique({
        where: { id: paperId },
        include: {
            tags: {
                include: {
                    tag: true
                }
            }
        }
    });

    if (!paper) return { relatedPapers: [], relatedNotes: [] };

    // 获取当前论文的所有标签ID
    const tagIds = paper.tags.map(t => t.tagId);

    // 并行获取相关论文和笔记
    const [relatedPapers, relatedNotes] = await Promise.all([
        // 查找具有相同标签的其他论文
        prisma.paper.findMany({
            where: {
                AND: [
                    { id: { not: paperId } },
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
        }),
        // 查找具有相同标签的笔记
        prisma.note.findMany({
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
        })
    ]);

    return { relatedPapers, relatedNotes };
} 