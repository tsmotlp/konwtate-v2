import { PrismaClient, Prisma } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

const prisma = new PrismaClient()

// 创建标签的接口定义
interface CreateTagOptions {
  name: string;
  paperId?: string;  // 可选的论文ID
  noteId?: string;   // 可选的笔记ID
}

// 创建标签
export async function createTag(options: CreateTagOptions) {
  const { name, paperId, noteId } = options

  try {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. 创建标签
      const tag = await tx.tag.create({
        data: { name }
      })

      // 2. 如果提供了 paperId，建立与论文的关联
      if (paperId) {
        await tx.tagsOnPapers.create({
          data: {
            paperId,
            tagId: tag.id
          }
        })
      }

      // 3. 如果提供了 noteId，建立与笔记的关联
      if (noteId) {
        await tx.tagsOnNotes.create({
          data: {
            noteId,
            tagId: tag.id
          }
        })
      }

      return tag
    })
  } catch (error: unknown) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error('标签名称已存在')
    }
    throw error
  }
}

// 获取单个标签
export async function getTag(id: string) {
  const tag = await prisma.tag.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          papers: true,
          notes: true
        }
      }
    }
  })

  if (!tag) {
    return null
  }

  return {
    id: tag.id,
    name: tag.name,
    paperCount: tag._count.papers,
    noteCount: tag._count.notes
  }
}

// 获取所有标签
export async function getAllTags() {
  return await prisma.tag.findMany({
    orderBy: {
      name: 'asc'
    }
  })
}

// 更新标签
export async function updateTag(id: string, name: string) {
  try {
    return await prisma.tag.update({
      where: { id },
      data: { name }
    })
  } catch (error: unknown) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error('标签名称已存在')
    }
    throw error
  }
}

// 删除标签
export async function deleteTag(id: string) {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 删除标签与论文的关联关系
    await tx.tagsOnPapers.deleteMany({
      where: { tagId: id }
    })

    // 删除标签与笔记的关联关系
    await tx.tagsOnNotes.deleteMany({
      where: { tagId: id }
    })

    // 删除标签本身
    return await tx.tag.delete({
      where: { id }
    })
  })
}

// 搜索标签
export async function searchTags(keyword: string) {
  return await prisma.tag.findMany({
    where: {
      name: {
        contains: keyword
      }
    },
    orderBy: {
      name: 'asc'
    }
  })
}

// 获取标签详细信息及相关内容
export async function getTagStats(id: string) {
  const [tag, papers, notes] = await prisma.$transaction([
    // 获取标签基本信息和计数
    prisma.tag.findUniqueOrThrow({
      where: { id },
      include: {
        _count: {
          select: {
            papers: true,
            notes: true
          }
        }
      }
    }),

    // 获取相关论文
    prisma.paper.findMany({
      where: {
        tags: {
          some: { tagId: id }
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
        updatedAt: 'desc'
      }
    }),

    // 获取相关笔记
    prisma.note.findMany({
      where: {
        tags: {
          some: { tagId: id }
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
        updatedAt: 'desc'
      }
    })
  ]);

  return {
    tag,
    papers,
    notes
  };
} 