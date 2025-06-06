import { Sitemap, SitemapPage, ContentPage } from '@/types/sitemap';

export class SitemapService {
  // Get sitemap for a site
  static async getSitemap(siteId: string): Promise<Sitemap> {
    console.log(siteId);
    try {
      const response = await fetch(`/api/sites/${siteId}/sitemap`, {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sitemap: ${response.statusText}`);
      }
      
      const sitemap = await response.json();
      return {
        ...sitemap,
        createdAt: new Date(sitemap.createdAt),
        updatedAt: new Date(sitemap.updatedAt),
        pages: sitemap.pages.map((page: any) => this.convertPageDates(page))
      };
    } catch (error) {
      console.error('Error fetching sitemap:', error);
      throw error;
    }
  }

  // Update sitemap for a site
  static async updateSitemap(siteId: string, pages: SitemapPage[]): Promise<Sitemap> {
    try {
      const response = await fetch(`/api/sites/${siteId}/sitemap`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pages }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update sitemap');
      }
      
      const sitemap = await response.json();
      return {
        ...sitemap,
        createdAt: new Date(sitemap.createdAt),
        updatedAt: new Date(sitemap.updatedAt),
        pages: sitemap.pages.map((page: any) => this.convertPageDates(page))
      };
    } catch (error) {
      console.error('Error updating sitemap:', error);
      throw error;
    }
  }

  // Get content pages for a site
  static async getContentPages(siteId: string): Promise<ContentPage[]> {
    try {
      const response = await fetch(`/api/sites/${siteId}/content-pages`, {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch content pages: ${response.statusText}`);
      }
      
      const pages = await response.json();
      return pages.map((page: any) => ({
        ...page,
        createdAt: new Date(page.createdAt),
        updatedAt: new Date(page.updatedAt)
      }));
    } catch (error) {
      console.error('Error fetching content pages:', error);
      throw error;
    }
  }

  // Create a basic content page
  static async createContentPage(siteId: string, title: string, url: string): Promise<ContentPage> {
    try {
      const response = await fetch(`/api/sites/${siteId}/content-pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, url }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create content page');
      }
      
      const page = await response.json();
      return {
        ...page,
        createdAt: new Date(page.createdAt),
        updatedAt: new Date(page.updatedAt)
      };
    } catch (error) {
      console.error('Error creating content page:', error);
      throw error;
    }
  }

  // Helper to convert page dates recursively
  private static convertPageDates(page: any): SitemapPage {
    return {
      ...page,
      createdAt: new Date(page.createdAt),
      updatedAt: new Date(page.updatedAt),
      children: page.children.map((child: any) => this.convertPageDates(child))
    };
  }

  // Create a new sitemap page
  static createSitemapPage(title: string, url: string, parentId?: string, contentPageId?: string): SitemapPage {
    const now = new Date();
    return {
      id: crypto.randomUUID(),
      title,
      url,
      contentPageId,
      children: [],
      parentId,
      order: 0,
      createdAt: now,
      updatedAt: now
    };
  }

  // Find a page in the tree structure
  static findPageInTree(pages: SitemapPage[], pageId: string): SitemapPage | null {
    for (const page of pages) {
      if (page.id === pageId) {
        return page;
      }
      const found = this.findPageInTree(page.children, pageId);
      if (found) {
        return found;
      }
    }
    return null;
  }

  // Remove a page from the tree structure
  static removePageFromTree(pages: SitemapPage[], pageId: string): SitemapPage[] {
    return pages.filter(page => {
      if (page.id === pageId) {
        return false;
      }
      page.children = this.removePageFromTree(page.children, pageId);
      return true;
    });
  }

  // Insert a page at a specific position in the tree
  static insertPageInTree(
    pages: SitemapPage[], 
    pageToInsert: SitemapPage, 
    targetId?: string, 
    position: 'before' | 'after' | 'child' = 'after'
  ): SitemapPage[] {
    if (!targetId) {
      // Add to root level
      return [...pages, pageToInsert];
    }

    // Handle root level insertions
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].id === targetId) {
        const newPages = [...pages];
        if (position === 'before') {
          newPages.splice(i, 0, pageToInsert);
        } else if (position === 'after') {
          newPages.splice(i + 1, 0, pageToInsert);
        } else if (position === 'child') {
          newPages[i] = {
            ...newPages[i],
            children: [...newPages[i].children, pageToInsert]
          };
        }
        return newPages;
      }
    }

    // Handle nested insertions
    return pages.map(page => {
      const updatedChildren = this.insertInChildren(page.children, pageToInsert, targetId, position);
      if (updatedChildren !== page.children) {
        return { ...page, children: updatedChildren };
      }
      return page;
    });
  }

  // Helper function to insert in children recursively
  private static insertInChildren(
    children: SitemapPage[],
    pageToInsert: SitemapPage,
    targetId: string,
    position: 'before' | 'after' | 'child'
  ): SitemapPage[] {
    // Check if target is at this level
    for (let i = 0; i < children.length; i++) {
      if (children[i].id === targetId) {
        const newChildren = [...children];
        if (position === 'before') {
          newChildren.splice(i, 0, pageToInsert);
        } else if (position === 'after') {
          newChildren.splice(i + 1, 0, pageToInsert);
        } else if (position === 'child') {
          newChildren[i] = {
            ...newChildren[i],
            children: [...newChildren[i].children, pageToInsert]
          };
        }
        return newChildren;
      }
    }

    // Check nested children
    for (let i = 0; i < children.length; i++) {
      const updatedGrandChildren = this.insertInChildren(
        children[i].children,
        pageToInsert,
        targetId,
        position
      );
      if (updatedGrandChildren !== children[i].children) {
        const newChildren = [...children];
        newChildren[i] = { ...newChildren[i], children: updatedGrandChildren };
        return newChildren;
      }
    }

    return children;
  }

  // Find a page with specific content ID
  static findPageWithContentId(pages: SitemapPage[], contentPageId: string): boolean {
    for (const page of pages) {
      if (page.contentPageId === contentPageId) {
        return true;
      }
      if (this.findPageWithContentId(page.children, contentPageId)) {
        return true;
      }
    }
    return false;
  }

  // Move a page within the tree structure
  static movePageInTree(
    pages: SitemapPage[],
    draggedId: string,
    targetId: string,
    position: 'before' | 'after' | 'child'
  ): SitemapPage[] {
    // First, find and remove the dragged page
    const draggedPage = this.findPageInTree(pages, draggedId);
    if (!draggedPage) {
      console.warn('Dragged page not found:', draggedId);
      return pages;
    }

    // Remove the dragged page from its current position
    const pagesWithoutDragged = this.removePageFromTree(pages, draggedId);

    // Insert the page at the new position
    return this.insertPageInTree(pagesWithoutDragged, draggedPage, targetId, position);
  }
}