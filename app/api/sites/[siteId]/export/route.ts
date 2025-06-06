import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Sitemap, ContentPage } from '@/types/sitemap';
import { WordPressExportService } from '@/lib/wordpress-export';

const DATA_DIR = path.join(process.cwd(), 'data');
const SITES_FILE = path.join(DATA_DIR, 'sites.json');
const SITEMAPS_FILE = path.join(DATA_DIR, 'sitemaps.json');
const CONTENT_PAGES_FILE = path.join(DATA_DIR, 'content-pages.json');

// Read data files
async function readSites() {
  try {
    const data = await fs.readFile(SITES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function readSitemaps(): Promise<Sitemap[]> {
  try {
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

function convertPageDates(page: any): any {
  return {
    ...page,
    createdAt: new Date(page.createdAt),
    updatedAt: new Date(page.updatedAt),
    children: page.children.map((child: any) => convertPageDates(child))
  };
}

// POST /api/sites/[siteId]/export - Generate WordPress export
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const body = await request.json();
    const { format = 'wxr', includeContent = true } = body;

    // Get site data
    const sites = await readSites();
    const site = sites.find((s: any) => s.id === siteId);
    
    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    // Get sitemap
    const sitemaps = await readSitemaps();
    const sitemap = sitemaps.find(s => s.siteId === siteId);
    
    if (!sitemap) {
      return NextResponse.json(
        { error: 'Sitemap not found for this site' },
        { status: 404 }
      );
    }

    // Get content pages
    const allContentPages = await readContentPages();
    const contentPages = allContentPages.filter(page => page.siteId === siteId);

    // Generate export data
    const exportData = WordPressExportService.generateExportData(
      sitemap,
      contentPages,
      site.name,
      site.productionUrl || site.devUrl || 'https://example.com',
      { includeContent }
    );

    // Generate export file content
    let fileContent: string;
    let mimeType: string;
    let filename: string;

    if (format === 'wxr') {
      fileContent = WordPressExportService.generateWXR(exportData);
      mimeType = 'application/xml';
      filename = `${site.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-export.xml`;
    } else {
      fileContent = WordPressExportService.generateJSON(exportData);
      mimeType = 'application/json';
      filename = `${site.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-export.json`;
    }

    // Get export statistics
    const stats = WordPressExportService.getExportStats(exportData);

    return NextResponse.json({
      success: true,
      filename,
      stats,
      downloadUrl: `/api/sites/${siteId}/export/download?format=${format}&timestamp=${Date.now()}`
    });

  } catch (error) {
    console.error('Error generating export:', error);
    return NextResponse.json(
      { error: 'Failed to generate export' },
      { status: 500 }
    );
  }
}

// GET /api/sites/[siteId]/export - Get export information
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    // Get site data
    const sites = await readSites();
    const site = sites.find((s: any) => s.id === siteId);
    
    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    // Get sitemap
    const sitemaps = await readSitemaps();
    const sitemap = sitemaps.find(s => s.siteId === siteId);
    
    // Get content pages
    const allContentPages = await readContentPages();
    const contentPages = allContentPages.filter(page => page.siteId === siteId);

    // Generate preview statistics
    const previewData = sitemap ? WordPressExportService.generateExportData(
      sitemap,
      contentPages,
      site.name,
      site.productionUrl || site.devUrl || 'https://example.com'
    ) : null;

    const stats = previewData ? WordPressExportService.getExportStats(previewData) : {
      totalPages: 0,
      publishedPages: 0,
      draftPages: 0,
      pagesWithContent: 0,
      exportDate: new Date().toISOString()
    };

    return NextResponse.json({
      site: {
        id: site.id,
        name: site.name,
        url: site.productionUrl || site.devUrl || ''
      },
      stats,
      hasSitemap: !!sitemap,
      hasContent: contentPages.length > 0
    });

  } catch (error) {
    console.error('Error getting export info:', error);
    return NextResponse.json(
      { error: 'Failed to get export information' },
      { status: 500 }
    );
  }
}
