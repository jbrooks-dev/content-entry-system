import { sql } from './db';
import { Site } from '@/types/site';

export class SitesDbService {
  // Get all sites
  static async getAllSites(): Promise<Site[]> {
    try {
      const result = await sql`
        SELECT 
          id, 
          name, 
          dev_url as "devUrl", 
          production_url as "productionUrl", 
          notes, 
          created_at as "createdAt", 
          updated_at as "updatedAt",
          client,
          host,
          custom_host as "customHost",
          template,
          header_scripts as "headerScripts",
          body_scripts as "bodyScripts",
          footer_scripts as "footerScripts"
        FROM sites 
        ORDER BY created_at DESC
      `;
      
      return result.map(row => ({
        id: row.id,
        name: row.name,
        devUrl: row.devUrl,
        productionUrl: row.productionUrl,
        notes: row.notes,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        client: row.client,
        host: row.host,
        customHost: row.customHost,
        template: row.template,
        headerScripts: row.headerScripts,
        bodyScripts: row.bodyScripts,
        footerScripts: row.footerScripts 
      }));
    } catch (error) {
      console.error('Error fetching sites:', error);
      throw new Error('Failed to fetch sites');
    }
  }

  // Get site by ID
  static async getSiteById(id: string): Promise<Site | null> {
    try {
      const result = await sql`
        SELECT 
          id, 
          name, 
          dev_url as "devUrl", 
          production_url as "productionUrl", 
          notes, 
          created_at as "createdAt", 
          updated_at as "updatedAt",
          client,
          host,
          custom_host as "customHost",
          template,
          header_scripts as "headerScripts",
          body_scripts as "bodyScripts",
          footer_scripts as "footerScripts"
        FROM sites 
        WHERE id = ${id}
      `;
      
      if (result.length === 0) {
        return null;
      }
      
      const row = result[0];
      return {
        id: row.id,
        name: row.name,
        devUrl: row.devUrl,
        productionUrl: row.productionUrl,
        notes: row.notes,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        client: row.client,
        host: row.host,
        customHost: row.customHost,
        template: row.template,
        headerScripts: row.headerScripts,
        bodyScripts: row.bodyScripts,
        footerScripts: row.footerScripts 
      };
    } catch (error) {
      console.error('Error fetching site by ID:', error);
      throw new Error('Failed to fetch site');
    }
  }

  // Create a new site
  static async createSite(siteData: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>): Promise<Site> {
    try {
      const result = await sql`
        INSERT INTO sites (name, dev_url, production_url, notes)
        VALUES (${siteData.name}, ${siteData.devUrl}, ${siteData.productionUrl}, ${siteData.notes}, ${siteData.client}, ${siteData.host}, ${siteData.customHost}, ${siteData.template}, ${siteData.headerScripts}${siteData.bodyScripts}, ${siteData.footerScripts})
        RETURNING 
          id, 
          name, 
          dev_url as "devUrl", 
          production_url as "productionUrl", 
          notes, 
          created_at as "createdAt", 
          updated_at as "updatedAt",
          client,
          host,
          custom_host as "customHost",
          template,
          header_scripts as "headerScripts",
          body_scripts as "bodyScripts",
          footer_scripts as "footerScripts"
      `;
      
      const row = result[0];
      return {
        id: row.id,
        name: row.name,
        devUrl: row.devUrl,
        productionUrl: row.productionUrl,
        notes: row.notes,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        client: row.client,
        host: row.host,
        customHost: row.customHost,
        template: row.template,
        headerScripts: row.headerScripts,
        bodyScripts: row.bodyScripts,
        footerScripts: row.footerScripts 
      };
    } catch (error) {
      console.error('Error creating site:', error);
      throw new Error('Failed to create site');
    }
  }

  // Update an existing site
  static async updateSite(id: string, siteData: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>): Promise<Site> {
    try {
      const result = await sql`
        UPDATE sites 
        SET 
          name = ${siteData.name},
          dev_url = ${siteData.devUrl},
          production_url = ${siteData.productionUrl},
          notes = ${siteData.notes},
          client = ${siteData.client},
          host = ${siteData.host},
          custom_host = ${siteData.customHost},
          template = ${siteData.template},
          header_scripts = ${siteData.headerScripts},
          body_scripts = ${siteData.bodyScripts},
          footer_scripts = ${siteData.footerScripts}
        WHERE id = ${id}
        RETURNING 
          id, 
          name, 
          dev_url as "devUrl", 
          production_url as "productionUrl", 
          notes, 
          created_at as "createdAt", 
          updated_at as "updatedAt",
          client,
          host,
          custom_host as "customHost",
          template,
          header_scripts as "headerScripts",
          body_scripts as "bodyScripts",
          footer_scripts as "footerScripts"
      `;
      
      if (result.length === 0) {
        throw new Error('Site not found');
      }
      
      const row = result[0];
      return {
        id: row.id,
        name: row.name,
        devUrl: row.devUrl,
        productionUrl: row.productionUrl,
        notes: row.notes,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        client: row.client,
        host: row.host,
        customHost: row.customHost,
        template: row.template,
        headerScripts: row.headerScripts,
        bodyScripts: row.bodyScripts,
        footerScripts: row.footerScripts 
      };
    } catch (error) {
      console.error('Error updating site:', error);
      throw new Error('Failed to update site');
    }
  }

  // Delete a site
  static async deleteSite(id: string): Promise<void> {
    try {
      const result = await sql`
        DELETE FROM sites 
        WHERE id = ${id}
        RETURNING id
      `;
      
      if (result.length === 0) {
        throw new Error('Site not found');
      }
    } catch (error) {
      console.error('Error deleting site:', error);
      throw new Error('Failed to delete site');
    }
  }
}