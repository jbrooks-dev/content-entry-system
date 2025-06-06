export interface WordPressExportOptions {
  includeContent: boolean;
  includePages: boolean;
  includePosts: boolean;
  includeMedia: boolean;
  exportFormat: 'wxr' | 'json';
  baseUrl: string;
  siteName: string;
  siteDescription: string;
}

export interface WordPressPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  status: 'publish' | 'draft' | 'private';
  type: 'post' | 'page';
  slug: string;
  date: string;
  author: string;
  categories: string[];
  tags: string[];
  parentId?: number;
  menuOrder: number;
  metaDescription?: string;
}

export interface WordPressExportData {
  site: {
    name: string;
    url: string;
    description: string;
    language: string;
    exportDate: string;
  };
  posts: WordPressPost[];
  categories: Array<{
    id: number;
    name: string;
    slug: string;
    description: string;
  }>;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
    description: string;
  }>;
}