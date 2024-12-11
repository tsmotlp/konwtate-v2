import { PrismaClient } from '@prisma/client'
import { beforeAll, afterAll } from '@jest/globals'

const prisma = new PrismaClient()

beforeAll(async () => {
    // 确保数据库已经准备好
    await prisma.$connect()
})

afterAll(async () => {
    // 清理并断开数据库连接
    await prisma.$disconnect()
}) 