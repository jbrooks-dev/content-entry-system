import { sql } from './db';
import { Sitemap, SitemapPage } from '@/types/sitemap';

export class SitemapDbService {
  // Get sitemap for a site
  static async getSitemap(siteId: string): Promise<Sitemap> {
    try {
      const result = await sql`
        SELECT 
          id, 
          site_id as "siteId", 
          pages, 
          created_at as "createdAt", 
          updated_at as "updatedAt"
        FROM sitemaps 
        WHERE site_id = ${siteId}
      `;
      
      if (result.length === 0) {
        // Create a new sitemap for this site if it doesn't exist
        const newSitemap = await this.createSitemap(siteId);
        return newSitemap;
      }
      
      const row = result[0];
      return {
        id: row.id,
        siteId: row.siteId,
        pages: this.convertPageDates(row.pages),
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt)
      };
    } catch (error) {
      console.error('Error fetching sitemap:', error);
      throw new Error('Failed to fetch sitemap');
    }
  }

  // Create a new sitemap
  static async createSitemap(siteId: string): Promise<Sitemap> {
    try {
      const result = await sql`
        INSERT INTO sitemaps (site_id, pages)
        VALUES (${siteId}, ${JSON.stringify([])})
        RETURNING 
          id, 
          site_id as "siteId", 
          pages, 
          created_at as "createdAt", 
          updated_at as "updatedAt"
      `;
      
      const row = result[0];
      return {
        id: row.id,
        siteId: row.siteId,
        pages: [],
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt)
      };
    } catch (error) {
      console.error('Error creating sitemap:', error);
      throw new Error('Failed to create sitemap');
    }
  }

  // Update sitemap for a site
  static async updateSitemap(siteId: string, pages: SitemapPage[]): Promise<Sitemap> {
    try {
      // First check if sitemap exists
      const existing = await sql`
        SELECT id FROM sitemaps WHERE site_id = ${siteId}
      `;
      
      let result;
      if (existing.length === 0) {
        // Create new sitemap
        result = await sql`
          INSERT INTO sitemaps (site_id, pages)
          VALUES (${siteId}, ${JSON.stringify(pages)})
          RETURNING 
            id, 
            site_id as "siteId", 
            pages, 
            created_at as "createdAt", 
            updated_at as "updatedAt"
        `;
      } else {
        // Update existing sitemap
        result = await sql`
          UPDATE sitemaps 
          SET pages = ${JSON.stringify(pages)}
          WHERE site_id = ${siteId}
          RETURNING 
            id, 
            site_id as "siteId", 
            pages, 
            created_at as "createdAt", 
            updated_at as "updatedAt"
        `;
      }
      
      const row = result[0];
      return {
        id: row.id,
        siteId: row.siteId,
        pages: this.convertPageDates(row.pages),
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt)
      };
    } catch (error) {
      console.error('Error updating sitemap:', error);
      throw new Error('Failed to update sitemap');
    }
  }

  // Convert page dates recursively (helper function)
  private static convertPageDates(pages: any[]): SitemapPage[] {
    return pages.map((page: any) => ({
      ...page,
      createdAt: new Date(page.createdAt),
      updatedAt: new Date(page.updatedAt),
      children: this.convertPageDates(page.children || [])
    }));
  }

  // Delete sitemap for a site
  static async deleteSitemap(siteId: string): Promise<void> {
    try {
      await sql`
        DELETE FROM sitemaps 
        WHERE site_id = ${siteId}
      `;
    } catch (error) {
      console.error('Error deleting sitemap:', error);
      throw new Error('Failed to delete sitemap');
    }
  }
}