import { NextRequest, NextResponse } from 'next/server';
import { ContentPagesDbService } from '@/lib/content-pages-db';

// GET /api/sites/[siteId]/content-pages - Get content pages for a site
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as 'draft' | 'published' | null;
    
    let pages;
    if (status) {
      pages = await ContentPagesDbService.getContentPagesByStatus(siteId, status);
    } else {
      pages = await ContentPagesDbService.getContentPages(siteId);
    }
    
    return NextResponse.json(pages);
  } catch (error) {
    console.error('Error reading content pages:', error);
    return NextResponse.json(
      { error: 'Failed to read content pages' },
      { status: 500 }
    );
  }
}

// POST /api/sites/[siteId]/content-pages - Create a new content page
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const body = await request.json();
    const { title, url, metaDescription, content, contentHtml, status } = body;

    if (!title?.trim() || !url?.trim()) {
      return NextResponse.json(
        { error: 'Title and URL are required' },
        { status: 400 }
      );
    }

    // Ensure URL starts with /
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;

    const pageData = {
      title: title.trim(),
      url: normalizedUrl,
      metaDescription: metaDescription?.trim(),
      content,
      contentHtml,
      status: status || 'draft'
    };

    const newPage = await ContentPagesDbService.createContentPage(siteId, pageData);
    return NextResponse.json(newPage, { status: 201 });
  } catch (error) {
    console.error('Error creating content page:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('already exists')) {
      return NextResponse.json(
        { error: 'A page with this URL already exists for this site' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create content page' },
      { status: 500 }
    );
  }
}