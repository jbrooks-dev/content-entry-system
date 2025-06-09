import { NextRequest, NextResponse } from 'next/server';
import { SitesDbService } from '@/lib/sites-db';
import { SitemapDbService } from '@/lib/sitemap-db';
import { ContentPagesDbService } from '@/lib/content-pages-db';
import { WordPressExportService } from '@/lib/wordpress-export';

// GET /api/sites/[siteId]/export/download - Download export file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'wxr';

    // Get site data
    const site = await SitesDbService.getSiteById(siteId);
    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    // Get sitemap
    const sitemap = await SitemapDbService.getSitemap(siteId);

    // Get content pages
    const contentPages = await ContentPagesDbService.getContentPages(siteId);

    if (format === 'json') {
      // JSON export
      const exportData = {
        site,
        sitemap,
        contentPages,
        exportedAt: new Date().toISOString()
      };

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${site.name.replace(/[^a-zA-Z0-9]/g, '_')}_export.json"`
        }
      });
    }

    if (format === 'wxr') {
      // WordPress XML export
      try {
        // First generate the export data
        const exportData = WordPressExportService.generateExportData(
          sitemap,
          contentPages,
          site.name,
          site.productionUrl || site.devUrl || 'https://example.com'
        );
        
        // Then generate the WXR content
        const wxrContent = WordPressExportService.generateWXR(exportData);
        return new NextResponse(wxrContent, {
          headers: {
            'Content-Type': 'application/xml',
            'Content-Disposition': `attachment; filename="${site.name.replace(/[^a-zA-Z0-9]/g, '_')}_wordpress_export.xml"`
          }
        });
      } catch (wxrError) {
        console.error('WordPress export failed:', wxrError);
        return NextResponse.json(
          { error: 'Failed to generate WordPress export' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Unsupported export format' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error downloading export:', error);
    return NextResponse.json(
      { error: 'Failed to download export' },
      { status: 500 }
    );
  }
}