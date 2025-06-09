import { sql } from './db';
import { ContentPage } from '@/types/sitemap';

export class ContentPagesDbService {
  // Get content pages for a site
  static async getContentPages(siteId: string): Promise<ContentPage[]> {
    try {
      const result = await sql`
        SELECT 
          id, 
          site_id as "siteId", 
          title, 
          url, 
          meta_description as "metaDescription", 
          content, 
          content_html as "contentHtml", 
          status, 
          created_at as "createdAt", 
          updated_at as "updatedAt"
        FROM content_pages 
        WHERE site_id = ${siteId}
        ORDER BY created_at DESC
      `;
      
      return result.map(row => ({
        id: row.id,
        siteId: row.siteId,
        title: row.title,
        url: row.url,
        metaDescription: row.metaDescription,
        content: row.content ? JSON.stringify(row.content) : undefined,
        contentHtml: row.contentHtml,
        status: row.status as 'draft' | 'published',
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt)
      }));
    } catch (error) {
      console.error('Error fetching content pages:', error);
      throw new Error('Failed to fetch content pages');
    }
  }

  // Get content page by ID
  static async getContentPageById(pageId: string): Promise<ContentPage | null> {
    try {
      const result = await sql`
        SELECT 
          id, 
          site_id as "siteId", 
          title, 
          url, 
          meta_description as "metaDescription", 
          content, 
          content_html as "contentHtml", 
          status, 
          created_at as "createdAt", 
          updated_at as "updatedAt"
        FROM content_pages 
        WHERE id = ${pageId}
      `;
      
      if (result.length === 0) {
        return null;
      }
      
      const row = result[0];
      return {
        id: row.id,
        siteId: row.siteId,
        title: row.title,
        url: row.url,
        metaDescription: row.metaDescription,
        content: row.content ? JSON.stringify(row.content) : undefined,
        contentHtml: row.contentHtml,
        status: row.status as 'draft' | 'published',
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt)
      };
    } catch (error) {
      console.error('Error fetching content page by ID:', error);
      throw new Error('Failed to fetch content page');
    }
  }

  // Create a new content page
  static async createContentPage(
    siteId: string, 
    pageData: {
      title: string;
      url: string;
      metaDescription?: string;
      content?: string;
      contentHtml?: string;
      status: 'draft' | 'published';
    }
  ): Promise<ContentPage> {
    try {
      // Parse content if it's a string
      const contentJson = pageData.content ? JSON.parse(pageData.content) : null;
      
      const result = await sql`
        INSERT INTO content_pages (
          site_id, 
          title, 
          url, 
          meta_description, 
          content, 
          content_html, 
          status
        )
        VALUES (
          ${siteId}, 
          ${pageData.title}, 
          ${pageData.url}, 
          ${pageData.metaDescription || null}, 
          ${contentJson}, 
          ${pageData.contentHtml || null}, 
          ${pageData.status}
        )
        RETURNING 
          id, 
          site_id as "siteId", 
          title, 
          url, 
          meta_description as "metaDescription", 
          content, 
          content_html as "contentHtml", 
          status, 
          created_at as "createdAt", 
          updated_at as "updatedAt"
      `;
      
      const row = result[0];
      return {
        id: row.id,
        siteId: row.siteId,
        title: row.title,
        url: row.url,
        metaDescription: row.metaDescription,
        content: row.content ? JSON.stringify(row.content) : undefined,
        contentHtml: row.contentHtml,
        status: row.status as 'draft' | 'published',
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt)
      };
    } catch (error) {
      console.error('Error creating content page:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('duplicate key')) {
        throw new Error('A page with this URL already exists for this site');
      }
      throw new Error('Failed to create content page');
    }
  }

  // Update an existing content page
  static async updateContentPage(
    pageId: string, 
    pageData: {
      title: string;
      url: string;
      metaDescription?: string;
      content?: string;
      contentHtml?: string;
      status: 'draft' | 'published';
    }
  ): Promise<ContentPage> {
    try {
      // Parse content if it's a string
      const contentJson = pageData.content ? JSON.parse(pageData.content) : null;
      
      const result = await sql`
        UPDATE content_pages 
        SET 
          title = ${pageData.title},
          url = ${pageData.url},
          meta_description = ${pageData.metaDescription || null},
          content = ${contentJson},
          content_html = ${pageData.contentHtml || null},
          status = ${pageData.status}
        WHERE id = ${pageId}
        RETURNING 
          id, 
          site_id as "siteId", 
          title, 
          url, 
          meta_description as "metaDescription", 
          content, 
          content_html as "contentHtml", 
          status, 
          created_at as "createdAt", 
          updated_at as "updatedAt"
      `;
      
      if (result.length === 0) {
        throw new Error('Content page not found');
      }
      
      const row = result[0];
      return {
        id: row.id,
        siteId: row.siteId,
        title: row.title,
        url: row.url,
        metaDescription: row.metaDescription,
        content: row.content ? JSON.stringify(row.content) : undefined,
        contentHtml: row.contentHtml,
        status: row.status as 'draft' | 'published',
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt)
      };
    } catch (error) {
      console.error('Error updating content page:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('duplicate key')) {
        throw new Error('A page with this URL already exists for this site');
      }
      throw new Error('Failed to update content page');
    }
  }

  // Delete a content page
  static async deleteContentPage(pageId: string): Promise<void> {
    try {
      const result = await sql`
        DELETE FROM content_pages 
        WHERE id = ${pageId}
        RETURNING id
      `;
      
      if (result.length === 0) {
        throw new Error('Content page not found');
      }
    } catch (error) {
      console.error('Error deleting content page:', error);
      throw new Error('Failed to delete content page');
    }
  }

  // Get content pages by site and status
  static async getContentPagesByStatus(siteId: string, status: 'draft' | 'published'): Promise<ContentPage[]> {
    try {
      const result = await sql`
        SELECT 
          id, 
          site_id as "siteId", 
          title, 
          url, 
          meta_description as "metaDescription", 
          content, 
          content_html as "contentHtml", 
          status, 
          created_at as "createdAt", 
          updated_at as "updatedAt"
        FROM content_pages 
        WHERE site_id = ${siteId} AND status = ${status}
        ORDER BY created_at DESC
      `;
      
      return result.map(row => ({
        id: row.id,
        siteId: row.siteId,
        title: row.title,
        url: row.url,
        metaDescription: row.metaDescription,
        content: row.content ? JSON.stringify(row.content) : undefined,
        contentHtml: row.contentHtml,
        status: row.status as 'draft' | 'published',
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt)
      }));
    } catch (error) {
      console.error('Error fetching content pages by status:', error);
      throw new Error('Failed to fetch content pages');
    }
  }
}