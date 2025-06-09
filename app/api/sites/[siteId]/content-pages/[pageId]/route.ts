import { NextRequest, NextResponse } from 'next/server';
import { ContentPagesDbService } from '@/lib/content-pages-db';

// GET /api/sites/[siteId]/content-pages/[pageId] - Get content page by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const page = await ContentPagesDbService.getContentPageById(pageId);
    
    if (!page) {
      return NextResponse.json(
        { error: 'Content page not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(page);
  } catch (error) {
    console.error('Error fetching content page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content page' },
      { status: 500 }
    );
  }
}

// PUT /api/sites/[siteId]/content-pages/[pageId] - Update content page
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; pageId: string }> }
) {
  try {
    const { pageId } = await params;
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

    const updatedPage = await ContentPagesDbService.updateContentPage(pageId, pageData);
    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error('Error updating content page:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage === 'Content page not found') {
      return NextResponse.json(
        { error: 'Content page not found' },
        { status: 404 }
      );
    }
    if (errorMessage.includes('already exists')) {
      return NextResponse.json(
        { error: 'A page with this URL already exists for this site' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update content page' },
      { status: 500 }
    );
  }
}

// DELETE /api/sites/[siteId]/content-pages/[pageId] - Delete content page
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; pageId: string }> }
) {
  try {
    const { pageId } = await params;
    await ContentPagesDbService.deleteContentPage(pageId);
    return NextResponse.json({ message: 'Content page deleted successfully' });
  } catch (error) {
    console.error('Error deleting content page:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage === 'Content page not found') {
      return NextResponse.json(
        { error: 'Content page not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete content page' },
      { status: 500 }
    );
  }
}