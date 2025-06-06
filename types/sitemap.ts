export interface SitemapPage {
  id: string;
  title: string;
  url: string;
  contentPageId?: string; // Reference to content page if it exists
  children: SitemapPage[];
  parentId?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sitemap {
  id: string;
  siteId: string;
  pages: SitemapPage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentPage {
  id: string;
  siteId: string;
  title: string;
  url: string;
  metaDescription?: string;
  content?: string; // JSON string from EditorJS
  contentHtml?: string; // Parsed HTML from EditorJS
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}