import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { ContentPage } from '@/types/sitemap';

const DATA_DIR = path.join(process.cwd(), 'data');
const CONTENT_PAGES_FILE = path.join(DATA_DIR, 'content-pages.json');

// Read content pages from JSON file
async function readContentPages(): Promise<ContentPage[]> {
  try {
    const data = await fs.readFile(CONTENT_PAGES_FILE, 'utf8');
    const pages = JSON.parse(data);
    return pages.map((page: any) => ({
      ...page,
      createdAt: new Date(page.createdAt),
      updatedAt: new Date(page.updatedAt)
    }));
  } catch (error) {
    return [];
  }
}

// Write content pages to JSON file
async function writeContentPages(pages: ContentPage[]): Promise<void> {
  await fs.writeFile(CONTENT_PAGES_FILE, JSON.stringify(pages, null, 2));
}

// GET /api/sites/[siteId]/content-pages/[pageId] - Get a specific content page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; pageId: string }> }
) {
  try {
    const { siteId, pageId } = await params;
    const allPages = await readContentPages();
    const page = allPages.find(p => p.id === pageId && p.siteId === siteId);
    
    if (!page) {
      return NextResponse.json(
        { error: 'Content page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error('Error reading content page:', error);
    return NextResponse.json(
      { error: 'Failed to read content page' },
      { status: 500 }
    );
  }
}

// PUT /api/sites/[siteId]/content-pages/[pageId] - Update a specific content page
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; pageId: string }> }
) {
  try {
    const { siteId, pageId } = await params;
    const body = await request.json();
    const { title, url, metaDescription, content, contentHtml, status } = body;

    if (!title?.trim() || !url?.trim()) {
      return NextResponse.json(
        { error: 'Title and URL are required' },
        { status: 400 }
      );
    }

    const allPages = await readContentPages();
    const pageIndex = allPages.findIndex(p => p.id === pageId && p.siteId === siteId);
    
    if (pageIndex === -1) {
      return NextResponse.json(
        { error: 'Content page not found' },
        { status: 404 }
      );
    }

    // Check for duplicate URL (excluding current page)
    const existingPage = allPages.find(page => 
      page.siteId === siteId && 
      page.url === url.trim() && 
      page.id !== pageId
    );
    
    if (existingPage) {
      return NextResponse.json(
        { error: 'A page with this URL already exists' },
        { status: 400 }
      );
    }

    // Update the page
    allPages[pageIndex] = {
      ...allPages[pageIndex],
      title: title.trim(),
      url: url.trim(),
      metaDescription: metaDescription?.trim() || '',
      content: content || '',
      contentHtml: contentHtml || '',
      status: status || allPages[pageIndex].status,
      updatedAt: new Date()
    };

    await writeContentPages(allPages);
    return NextResponse.json(allPages[pageIndex]);
  } catch (error) {
    console.error('Error updating content page:', error);
    return NextResponse.json(
      { error: 'Failed to update content page' },
      { status: 500 }
    );
  }
}

// DELETE /api/sites/[siteId]/content-pages/[pageId] - Delete a specific content page
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; pageId: string }> }
) {
  try {
    const { siteId, pageId } = await params;
    const allPages = await readContentPages();
    const pageIndex = allPages.findIndex(p => p.id === pageId && p.siteId === siteId);
    
    if (pageIndex === -1) {
      return NextResponse.json(
        { error: 'Content page not found' },
        { status: 404 }
      );
    }

    // Remove the page
    const deletedPage = allPages.splice(pageIndex, 1)[0];
    await writeContentPages(allPages);
    
    return NextResponse.json({ 
      message: 'Content page deleted successfully', 
      page: deletedPage 
    });
  } catch (error) {
    console.error('Error deleting content page:', error);
    return NextResponse.json(
      { error: 'Failed to delete content page' },
      { status: 500 }
    );
  }
}