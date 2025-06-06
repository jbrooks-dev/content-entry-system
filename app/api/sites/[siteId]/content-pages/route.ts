import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { ContentPage } from '@/types/sitemap';

const DATA_DIR = path.join(process.cwd(), 'data');
const CONTENT_PAGES_FILE = path.join(DATA_DIR, 'content-pages.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Read content pages from JSON file
async function readContentPages(): Promise<ContentPage[]> {
  try {
    await ensureDataDir();
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
  await ensureDataDir();
  await fs.writeFile(CONTENT_PAGES_FILE, JSON.stringify(pages, null, 2));
}

// GET /api/sites/[siteId]/content-pages - Get content pages for a site
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const allPages = await readContentPages();
    const sitePages = allPages.filter(page => page.siteId === siteId);
    return NextResponse.json(sitePages);
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

    const allPages = await readContentPages();
    
    // Check for duplicate URL within the same site
    const existingPage = allPages.find(page => 
      page.siteId === siteId && page.url === url.trim()
    );
    
    if (existingPage) {
      return NextResponse.json(
        { error: 'A page with this URL already exists' },
        { status: 400 }
      );
    }

    const now = new Date();
    
    const newPage: ContentPage = {
      id: crypto.randomUUID(),
      siteId: siteId,
      title: title.trim(),
      url: url.trim(),
      metaDescription: metaDescription?.trim() || '',
      content: content || '',
      contentHtml: contentHtml || '',
      status: status || 'draft',
      createdAt: now,
      updatedAt: now
    };

    allPages.push(newPage);
    await writeContentPages(allPages);

    return NextResponse.json(newPage, { status: 201 });
  } catch (error) {
    console.error('Error creating content page:', error);
    return NextResponse.json(
      { error: 'Failed to create content page' },
      { status: 500 }
    );
  }
}