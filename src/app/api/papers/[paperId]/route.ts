import { NextResponse } from 'next/server';
import { getPaper, updatePaper, deletePaper } from '@/lib/db/paper';

// GET 路由
export async function GET(
    request: Request,
    { params }: { params: { paperId: string } }
) {
    const paperId = params.paperId;
    try {
        const paper = await getPaper(paperId);
        if (!paper) {
            return NextResponse.json(
                { error: "Paper not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(paper);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch paper" },
            { status: 500 }
        );
    }
}

// PATCH 路由
export async function PATCH(
    request: Request,
    { params }: { params: { paperId: string } }
) {
    try {
        const paperId = params.paperId;
        const body = await request.json();
        const updatedPaper = await updatePaper(paperId, body);
        return NextResponse.json(updatedPaper);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update paper" },
            { status: 500 }
        );
    }
}

// DELETE 路由
export async function DELETE(
    request: Request,
    { params }: { params: { paperId: string } }
) {
    try {
        const paperId = params.paperId;
        await deletePaper(paperId);
        return NextResponse.json({ message: "Paper deleted successfully" });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete paper" },
            { status: 500 }
        );
    }
} 