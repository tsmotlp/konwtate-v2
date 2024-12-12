const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // 清理现有数据
  await prisma.tagsOnPapers.deleteMany()
  await prisma.tagsOnNotes.deleteMany()
  await prisma.notesOnPapers.deleteMany()
  await prisma.paper.deleteMany()
  await prisma.note.deleteMany()
  await prisma.tag.deleteMany()

  // 创建标签
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'Machine Learning' } }),
    prisma.tag.create({ data: { name: 'Deep Learning' } }),
    prisma.tag.create({ data: { name: 'Computer Vision' } }),
    prisma.tag.create({ data: { name: 'Natural Language Processing' } }),
    prisma.tag.create({ data: { name: 'Reinforcement Learning' } }),
    prisma.tag.create({ data: { name: 'Graph Neural Networks' } }),
    prisma.tag.create({ data: { name: 'Generative AI' } }),
    prisma.tag.create({ data: { name: 'Neural Architecture' } }),
    prisma.tag.create({ data: { name: 'Optimization' } }),
    prisma.tag.create({ data: { name: 'Transfer Learning' } })
  ])

  // 创建论文
  const papers = await Promise.all([
    prisma.paper.create({
      data: {
        name: 'Attention Is All You Need',
        url: 'https://arxiv.org/abs/1706.03762',
      }
    }),
    prisma.paper.create({
      data: {
        name: 'Deep Residual Learning for Image Recognition',
        url: 'https://arxiv.org/abs/1512.03385',
      }
    }),
    prisma.paper.create({
      data: {
        name: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
        url: 'https://arxiv.org/abs/1810.04805',
      }
    }),
    prisma.paper.create({
      data: {
        name: 'GPT-3: Language Models are Few-Shot Learners',
        url: 'https://arxiv.org/abs/2005.14165',
      }
    }),
    prisma.paper.create({
      data: {
        name: 'Stable Diffusion: High-Resolution Image Synthesis with Latent Diffusion Models',
        url: 'https://arxiv.org/abs/2112.10752',
      }
    }),
    prisma.paper.create({
      data: {
        name: 'AlphaGo: Mastering the Game of Go with Deep Neural Networks and Tree Search',
        url: 'https://www.nature.com/articles/nature16961',
      }
    }),
    prisma.paper.create({
      data: {
        name: 'Graph Attention Networks',
        url: 'https://arxiv.org/abs/1710.10903',
      }
    }),
    prisma.paper.create({
      data: {
        name: 'DALL·E: Creating Images from Text',
        url: 'https://arxiv.org/abs/2102.12092',
      }
    })
  ])

  // 创建笔记
  const notes = await Promise.all([
    prisma.note.create({
      data: {
        name: 'Transformer架构详解',
      }
    }),
    prisma.note.create({
      data: {
        name: 'ResNet结构分析',
      }
    }),
    prisma.note.create({
      data: {
        name: 'BERT模型解析',
      }
    }),
    prisma.note.create({
      data: {
        name: 'GPT系列发展史',
      }
    }),
    prisma.note.create({
      data: {
        name: '扩散模型的工作原理',
      }
    }),
    prisma.note.create({
      data: {
        name: 'AlphaGo策略详解',
      }
    })
  ])

  // 建立更多的关联关系
  const relations: Promise<any>[] = []

  // 为每篇论文随机分配2-3个标签
  papers.forEach(paper => {
    const numTags = Math.floor(Math.random() * 2) + 2 // 2-3个标签
    const shuffledTags = [...tags].sort(() => Math.random() - 0.5).slice(0, numTags)
    
    shuffledTags.forEach(tag => {
      relations.push(
        prisma.tagsOnPapers.create({
          data: {
            paperId: paper.id,
            tagId: tag.id,
          }
        })
      )
    })
  })

  // 为每个笔记随机分配1-2个标签
  notes.forEach(note => {
    const numTags = Math.floor(Math.random() * 2) + 1 // 1-2个标签
    const shuffledTags = [...tags].sort(() => Math.random() - 0.5).slice(0, numTags)
    
    shuffledTags.forEach(tag => {
      relations.push(
        prisma.tagsOnNotes.create({
          data: {
            noteId: note.id,
            tagId: tag.id,
          }
        })
      )
    })
  })

  // 为每篇论文关联1-2个笔记
  papers.forEach(paper => {
    const numNotes = Math.floor(Math.random() * 2) + 1 // 1-2个笔记
    const shuffledNotes = [...notes].sort(() => Math.random() - 0.5).slice(0, numNotes)
    
    shuffledNotes.forEach(note => {
      relations.push(
        prisma.notesOnPapers.create({
          data: {
            paperId: paper.id,
            noteId: note.id,
          }
        })
      )
    })
  })

  // 执行所有关联操作
  await Promise.all(relations)

  console.log('Extended mock data seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })