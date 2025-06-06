import { Site } from '@/types/site';

export class SitesService {
  private static baseUrl = '/api/sites';

  // Get all sites
  static async getAllSites(): Promise<Site[]> {
    try {
      const response = await fetch(this.baseUrl, {
        cache: 'no-store' // Ensure fresh data
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sites: ${response.statusText}`);
      }
      
      const sites = await response.json();
      return sites.map((site: any) => ({
        ...site,
        createdAt: new Date(site.createdAt),
        updatedAt: new Date(site.updatedAt)
      }));
    } catch (error) {
      console.error('Error fetching sites:', error);
      throw error;
    }
  }

  // Get a specific site by ID
  static async getSiteById(id: string): Promise<Site | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        cache: 'no-store'
      });
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch site: ${response.statusText}`);
      }
      
      const site = await response.json();
      return {
        ...site,
        createdAt: new Date(site.createdAt),
        updatedAt: new Date(site.updatedAt)
      };
    } catch (error) {
      console.error('Error fetching site:', error);
      throw error;
    }
  }

  // Create a new site
  static async createSite(siteData: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>): Promise<Site> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(siteData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create site');
      }
      
      const site = await response.json();
      return {
        ...site,
        createdAt: new Date(site.createdAt),
        updatedAt: new Date(site.updatedAt)
      };
    } catch (error) {
      console.error('Error creating site:', error);
      throw error;
    }
  }

  // Update an existing site
  static async updateSite(id: string, siteData: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>): Promise<Site> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(siteData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update site');
      }
      
      const site = await response.json();
      return {
        ...site,
        createdAt: new Date(site.createdAt),
        updatedAt: new Date(site.updatedAt)
      };
    } catch (error) {
      console.error('Error updating site:', error);
      throw error;
    }
  }

  // Delete a site
  static async deleteSite(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete site');
      }
    } catch (error) {
      console.error('Error deleting site:', error);
      throw error;
    }
  }
}