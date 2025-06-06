import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Sitemap, SitemapPage } from '@/types/sitemap';

const DATA_DIR = path.join(process.cwd(), 'data');
const SITEMAPS_FILE = path.join(DATA_DIR, 'sitemaps.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Read sitemaps from JSON file
async function readSitemaps(): Promise<Sitemap[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(SITEMAPS_FILE, 'utf8');
    const sitemaps = JSON.parse(data);
    return sitemaps.map((sitemap: any) => ({
      ...sitemap,
      createdAt: new Date(sitemap.createdAt),
      updatedAt: new Date(sitemap.updatedAt),
      pages: sitemap.pages.map((page: any) => convertPageDates(page))
    }));
  } catch (error) {
    return [];
  }
}

// Convert page dates recursively
function convertPageDates(page: any): SitemapPage {
  return {
    ...page,
    createdAt: new Date(page.createdAt),
    updatedAt: new Date(page.updatedAt),
    children: page.children.map((child: any) => convertPageDates(child))
  };
}

// Write sitemaps to JSON file
async function writeSitemaps(sitemaps: Sitemap[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(SITEMAPS_FILE, JSON.stringify(sitemaps, null, 2));
}

// GET /api/sites/[siteId]/sitemap - Get sitemap for a site
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const sitemaps = await readSitemaps();
    let sitemap = sitemaps.find(s => s.siteId === siteId);
    
    if (!sitemap) {
      // Create a new sitemap for this site if it doesn't exist
      const now = new Date();
      sitemap = {
        id: crypto.randomUUID(),
        siteId: siteId, // This should match the site ID from sites.json
        pages: [],
        createdAt: now,
        updatedAt: now
      };
      
      // Save the new sitemap
      sitemaps.push(sitemap);
      await writeSitemaps(sitemaps);
    }

    return NextResponse.json(sitemap);
  } catch (error) {
    console.error('Error reading sitemap:', error);
    return NextResponse.json(
      { error: 'Failed to read sitemap' },
      { status: 500 }
    );
  }
}

// PUT /api/sites/[siteId]/sitemap - Update sitemap for a site
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const body = await request.json();
    const { pages } = body;

    if (!Array.isArray(pages)) {
      return NextResponse.json(
        { error: 'Pages must be an array' },
        { status: 400 }
      );
    }

    const sitemaps = await readSitemaps();
    const sitemapIndex = sitemaps.findIndex(s => s.siteId === siteId);
    
    const now = new Date();
    
    if (sitemapIndex === -1) {
      // Create new sitemap
      const newSitemap: Sitemap = {
        id: crypto.randomUUID(),
        siteId: siteId,
        pages,
        createdAt: now,
        updatedAt: now
      };
      sitemaps.push(newSitemap);
    } else {
      // Update existing sitemap
      sitemaps[sitemapIndex] = {
        ...sitemaps[sitemapIndex],
        pages,
        updatedAt: now
      };
    }

    await writeSitemaps(sitemaps);
    
    const updatedSitemap = sitemaps.find(s => s.siteId === siteId);
    return NextResponse.json(updatedSitemap);
  } catch (error) {
    console.error('Error updating sitemap:', error);
    return NextResponse.json(
      { error: 'Failed to update sitemap' },
      { status: 500 }
    );
  }
}