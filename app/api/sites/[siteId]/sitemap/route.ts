import { NextRequest, NextResponse } from 'next/server';
import { SitemapDbService } from '@/lib/sitemap-db';
import { SitemapPage } from '@/types/sitemap';

// GET /api/sites/[siteId]/sitemap - Get sitemap for a site
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const sitemap = await SitemapDbService.getSitemap(siteId);
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

    const updatedSitemap = await SitemapDbService.updateSitemap(siteId, pages);
    return NextResponse.json(updatedSitemap);
  } catch (error) {
    console.error('Error updating sitemap:', error);
    return NextResponse.json(
      { error: 'Failed to update sitemap' },
      { status: 500 }
    );
  }
}

// DELETE /api/sites/[siteId]/sitemap - Delete sitemap for a site
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    await SitemapDbService.deleteSitemap(siteId);
    return NextResponse.json({ message: 'Sitemap deleted successfully' });
  } catch (error) {
    console.error('Error deleting sitemap:', error);
    return NextResponse.json(
      { error: 'Failed to delete sitemap' },
      { status: 500 }
    );
  }
}