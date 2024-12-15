import { NextResponse } from 'next/server';
import { createPaper, getAllPapers, searchPapers } from '@/lib/db/paper';
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';

// GET 路由 - 获取所有论文或搜索论文
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const keyword = searchParams.get('keyword');

        if (keyword) {
            const papers = await searchPapers(keyword);
            return NextResponse.json(papers);
        }

        const papers = await getAllPapers();
        return NextResponse.json(papers);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch papers" },
            { status: 500 }
        );
    }
}

// POST 路由 - 创建新论文
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const paper = formData.get('paper') as File;
        const name = formData.get('name') as string;
        const tagIdsJson = formData.get('tagIds') as string;
        const tagIds = JSON.parse(tagIdsJson);

        // 验证必需字段
        if (!name || !paper) {
            return NextResponse.json(
                { error: "Name and paper file are required" },
                { status: 400 }
            );
        }

        // 创建上传目录
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });

        // 生成唯一文件名
        const timestamp = Date.now();
        const fileName = `${timestamp}-${paper.name}`;
        const filePath = path.join(uploadDir, fileName);

        // 将文件内容转换为 Buffer
        const bytes = await paper.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 保存文件到本地
        await writeFile(filePath, buffer);

        // 生成文件的URL路径（相对于public目录）
        const url = `/uploads/${fileName}`;

        const newPaper = await createPaper({
            name,
            url,
            tagIds,
        });

        return NextResponse.json(newPaper, { status: 201 });
    } catch (error) {
        console.error('Paper creation error:', error);
        return NextResponse.json(
            { error: "Failed to create paper" },
            { status: 500 }
        );
    }
} 