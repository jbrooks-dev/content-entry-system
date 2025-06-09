import { NextRequest, NextResponse } from 'next/server';
import { SitesDbService } from '@/lib/sites-db';
import { SitemapDbService } from '@/lib/sitemap-db';
import { ContentPagesDbService } from '@/lib/content-pages-db';
import { WordPressExportService } from '@/lib/wordpress-export';

// GET /api/sites/[siteId]/export - Generate export data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json';

    console.log('Export API - Getting data for siteId:', siteId);

    // Get site data
    const site = await SitesDbService.getSiteById(siteId);
    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    console.log('Export API - Site found:', site.name);

    // Get sitemap
    const sitemap = await SitemapDbService.getSitemap(siteId);
    console.log('Export API - Sitemap pages count:', sitemap?.pages?.length || 0);
    console.log('Export API - Sitemap structure:', JSON.stringify(sitemap, null, 2));

    // Get content pages
    const contentPages = await ContentPagesDbService.getContentPages(siteId);
    console.log('Export API - Content pages count:', contentPages?.length || 0);
    console.log('Export API - Content pages:', contentPages?.map(p => ({ id: p.id, title: p.title, url: p.url })));

    // If this is just for getting export info (not downloading), return the info
    if (!searchParams.get('download')) {
      // Check if we have actual sitemap pages
      const hasSitemapPages = sitemap && sitemap.pages && sitemap.pages.length > 0;
      const hasContentPages = contentPages && contentPages.length > 0;

      console.log('Export API - hasSitemapPages:', hasSitemapPages);
      console.log('Export API - hasContentPages:', hasContentPages);

      // Generate preview statistics
      let stats;
      if (hasSitemapPages) {
        try {
          const wpExportData = WordPressExportService.generateExportData(
            sitemap,
            contentPages,
            site.name,
            site.productionUrl || site.devUrl || 'https://example.com'
          );
          stats = WordPressExportService.getExportStats(wpExportData);
          console.log('Export API - Generated stats:', stats);
        } catch (error) {
          console.error('Export API - Error generating stats:', error);
          stats = {
            totalPages: 0,
            publishedPages: 0,
            draftPages: 0,
            pagesWithContent: 0,
            exportDate: new Date().toISOString()
          };
        }
      } else {
        stats = {
          totalPages: 0,
          publishedPages: 0,
          draftPages: 0,
          pagesWithContent: 0,
          exportDate: new Date().toISOString()
        };
      }

      const result = {
        site: {
          id: site.id,
          name: site.name,
          url: site.productionUrl || site.devUrl || ''
        },
        stats,
        hasSitemap: hasSitemapPages,
        hasContent: hasContentPages
      };

      console.log('Export API - Final result:', result);
      return NextResponse.json(result);
    }

    const exportData = {
      site,
      sitemap,
      contentPages,
      exportedAt: new Date().toISOString()
    };

    if (format === 'wxr') {
      // WordPress XML export
      try {
        // First generate the export data
        const wpExportData = WordPressExportService.generateExportData(
          sitemap,
          contentPages,
          site.name,
          site.productionUrl || site.devUrl || 'https://example.com'
        );
        
        // Then generate the WXR content
        const wxrContent = WordPressExportService.generateWXR(wpExportData);
        return new NextResponse(wxrContent, {
          headers: {
            'Content-Type': 'application/xml',
            'Content-Disposition': `attachment; filename="${site.name.replace(/[^a-zA-Z0-9]/g, '_')}_export.xml"`
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

    // Default JSON export
    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Error generating export:', error);
    return NextResponse.json(
      { error: 'Failed to generate export' },
      { status: 500 }
    );
  }
}

// POST /api/sites/[siteId]/export - Generate and prepare download
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const body = await request.json();
    const { format = 'json' } = body;

    // Get site data
    const site = await SitesDbService.getSiteById(siteId);
    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    // Get sitemap and content pages
    const sitemap = await SitemapDbService.getSitemap(siteId);
    const contentPages = await ContentPagesDbService.getContentPages(siteId);

    // Prepare export data
    const exportData = {
      site,
      sitemap,
      contentPages,
      exportedAt: new Date().toISOString(),
      format
    };

    return NextResponse.json({
      message: 'Export prepared successfully',
      data: exportData,
      downloadUrl: `/api/sites/${siteId}/export/download?format=${format}`
    });
  } catch (error) {
    console.error('Error preparing export:', error);
    return NextResponse.json(
      { error: 'Failed to prepare export' },
      { status: 500 }
    );
  }
}