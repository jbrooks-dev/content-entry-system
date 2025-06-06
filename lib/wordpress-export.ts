import { SitemapPage, ContentPage, Sitemap } from '@/types/sitemap';
import { WordPressExportData, WordPressPost, WordPressExportOptions } from '@/types/wordpress';

export class WordPressExportService {
  // Generate WordPress export data from sitemap and content
  static generateExportData(
    sitemap: Sitemap,
    contentPages: ContentPage[],
    siteName: string,
    siteUrl: string,
    options: Partial<WordPressExportOptions> = {}
  ): WordPressExportData {
    const exportDate = new Date().toISOString();
    
    // Convert sitemap pages to WordPress posts
    const posts: WordPressPost[] = [];
    let postId = 1;

    // Process sitemap pages recursively
    const processPages = (pages: SitemapPage[], parentId?: number, menuOrder = 0) => {
      pages.forEach((page, index) => {
        // Find corresponding content page
        const contentPage = contentPages.find(cp => cp.id === page.contentPageId);
        
        // Create WordPress post
        const wpPost: WordPressPost = {
          id: postId++,
          title: page.title,
          content: contentPage?.contentHtml || '',
          excerpt: contentPage?.metaDescription || '',
          status: contentPage?.status === 'published' ? 'publish' : 'draft',
          type: 'page', // All sitemap items become pages in WordPress
          slug: this.generateSlug(page.url),
          date: contentPage?.updatedAt.toISOString() || page.updatedAt.toISOString(),
          author: 'admin',
          categories: [],
          tags: [],
          parentId,
          menuOrder: menuOrder + index,
          metaDescription: contentPage?.metaDescription
        };

        posts.push(wpPost);

        // Process child pages
        if (page.children && page.children.length > 0) {
          processPages(page.children, wpPost.id, 0);
        }
      });
    };

    processPages(sitemap.pages);

    return {
      site: {
        name: siteName,
        url: siteUrl,
        description: `Exported from Content Entry System`,
        language: 'en-US',
        exportDate
      },
      posts,
      categories: [],
      tags: []
    };
  }

  // Generate WXR (WordPress eXtended RSS) format
  static generateWXR(exportData: WordPressExportData): string {
    const { site, posts } = exportData;
    
    const wxr = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:wfw="http://wellformedweb.org/CommentAPI/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:wp="http://wordpress.org/export/1.2/">

<channel>
  <title>${this.escapeXml(site.name)}</title>
  <link>${this.escapeXml(site.url)}</link>
  <description>${this.escapeXml(site.description)}</description>
  <pubDate>${new Date(site.exportDate).toUTCString()}</pubDate>
  <language>${site.language}</language>
  <wp:wxr_version>1.2</wp:wxr_version>
  <wp:base_site_url>${this.escapeXml(site.url)}</wp:base_site_url>
  <wp:base_blog_url>${this.escapeXml(site.url)}</wp:base_blog_url>

  <generator>Content Entry System WordPress Exporter</generator>

${posts.map(post => this.generatePostXML(post)).join('\n')}

</channel>
</rss>`;

    return wxr;
  }

  // Generate individual post XML
  private static generatePostXML(post: WordPressPost): string {
    return `  <item>
    <title>${this.escapeXml(post.title)}</title>
    <link>${this.escapeXml(post.slug)}</link>
    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    <dc:creator><![CDATA[${post.author}]]></dc:creator>
    <guid isPermaLink="false">${post.slug}</guid>
    <description></description>
    <content:encoded><![CDATA[${post.content}]]></content:encoded>
    <excerpt:encoded><![CDATA[${post.excerpt}]]></excerpt:encoded>
    <wp:post_id>${post.id}</wp:post_id>
    <wp:post_date>${new Date(post.date).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '')}</wp:post_date>
    <wp:post_date_gmt>${new Date(post.date).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '')}</wp:post_date_gmt>
    <wp:comment_status>closed</wp:comment_status>
    <wp:ping_status>closed</wp:ping_status>
    <wp:post_name>${this.escapeXml(post.slug)}</wp:post_name>
    <wp:status>${post.status}</wp:status>
    <wp:post_parent>${post.parentId || 0}</wp:post_parent>
    <wp:menu_order>${post.menuOrder}</wp:menu_order>
    <wp:post_type>${post.type}</wp:post_type>
    <wp:post_password></wp:post_password>
    <wp:is_sticky>0</wp:is_sticky>
${post.metaDescription ? `    <wp:postmeta>
      <wp:meta_key>_yoast_wpseo_metadesc</wp:meta_key>
      <wp:meta_value><![CDATA[${post.metaDescription}]]></wp:meta_value>
    </wp:postmeta>` : ''}
  </item>`;
  }

  // Generate slug from URL
  private static generateSlug(url: string): string {
    return url.replace(/^\//, '').replace(/\/$/, '') || 'home';
  }

  // Escape XML special characters
  private static escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Generate JSON export format
  static generateJSON(exportData: WordPressExportData): string {
    return JSON.stringify(exportData, null, 2);
  }

  // Get export statistics
  static getExportStats(exportData: WordPressExportData) {
    const totalPages = exportData.posts.filter(p => p.type === 'page').length;
    const publishedPages = exportData.posts.filter(p => p.type === 'page' && p.status === 'publish').length;
    const draftPages = exportData.posts.filter(p => p.type === 'page' && p.status === 'draft').length;
    const pagesWithContent = exportData.posts.filter(p => p.content.trim().length > 0).length;

    return {
      totalPages,
      publishedPages,
      draftPages,
      pagesWithContent,
      exportDate: exportData.site.exportDate
    };
  }
}