import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, synopsis, authorName, chapterTitle, chapterContent } = body;

    const newStory = await prisma.story.create({
      data: {
        title,
        synopsis,
        authorName,
        chapters: {
          create: {
            title: chapterTitle,
            content: chapterContent
          }
        }
      }
    });

    return NextResponse.json(newStory, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al crear la historia' }, { status: 500 });
  }
}
