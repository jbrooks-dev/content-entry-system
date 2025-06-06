"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SitemapPage, Sitemap, ContentPage } from "@/types/sitemap";
import { SitemapService } from "@/lib/sitemap";
import { SitemapTreeItem } from "@/components/sitemap/SitemapTreeItem";
import { PageFormModal } from "@/components/sitemap/PageFormModal";

export default function SitemapEditor() {
  const params = useParams();
  const siteId = params.siteId as string;

  const [sitemap, setSitemap] = useState<Sitemap | null>(null);
  const [contentPages, setContentPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPageForm, setShowPageForm] = useState(false);
  const [editingPage, setEditingPage] = useState<SitemapPage | undefined>();

  useEffect(() => {
    loadData();
  }, [siteId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(siteId);
      const [sitemapData, contentPagesData] = await Promise.all([
        SitemapService.getSitemap(siteId),
        SitemapService.getContentPages(siteId),
      ]);
      setSitemap(sitemapData);
      setContentPages(contentPagesData);
    } catch (err) {
      setError("Failed to load sitemap data. Please try again.");
      console.error("Error loading sitemap:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveSitemap = async (pages: SitemapPage[]) => {
    if (!sitemap) return;

    try {
      setSaving(true);
      setError(null);
      const updatedSitemap = await SitemapService.updateSitemap(siteId, pages);
      setSitemap(updatedSitemap);
    } catch (err) {
      setError("Failed to save sitemap. Please try again.");
      console.error("Error saving sitemap:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddPage = () => {
    setEditingPage(undefined);
    setShowPageForm(true);
  };

  const handleEditPage = (page: SitemapPage) => {
    setEditingPage(page);
    setShowPageForm(true);
  };

  const handleDeletePage = async (pageId: string) => {
    if (
      !sitemap ||
      !confirm(
        "Are you sure you want to delete this page? This will also delete all child pages."
      )
    ) {
      return;
    }

    const newPages = SitemapService.removePageFromTree(sitemap.pages, pageId);
    await saveSitemap(newPages);
  };

  const handleMovePage = async (
    draggedId: string,
    targetId: string,
    position: "before" | "after" | "child"
  ) => {
    if (!sitemap) return;

    console.log("Moving page:", { draggedId, targetId, position });

    // Use the new movePageInTree method
    const newPages = SitemapService.movePageInTree(
      sitemap.pages,
      draggedId,
      targetId,
      position
    );

    console.log("New pages structure:", newPages);

    await saveSitemap(newPages);
  };

  const handleAddContentPageToSitemap = async (contentPage: ContentPage) => {
    if (!sitemap) return;

    // Check if this content page is already in the sitemap
    const isAlreadyInSitemap = sitemap.pages.some(
      (sitemapPage) =>
        sitemapPage.contentPageId === contentPage.id ||
        SitemapService.findPageWithContentId(sitemap.pages, contentPage.id)
    );

    if (isAlreadyInSitemap) {
      alert("This content page is already in the sitemap.");
      return;
    }

    // Create a new sitemap page linked to the content page
    const newSitemapPage = SitemapService.createSitemapPage(
      contentPage.title,
      contentPage.url,
      undefined,
      contentPage.id
    );

    // Add to the bottom of the root level
    const newPages = [...sitemap.pages, newSitemapPage];
    await saveSitemap(newPages);
  };

  const handleSavePage = async (
    title: string,
    url: string,
    contentPageId?: string
  ) => {
    if (!sitemap) return;

    if (editingPage) {
      // Update existing page
      const updatePageInTree = (pages: SitemapPage[]): SitemapPage[] => {
        return pages.map((page) => {
          if (page.id === editingPage.id) {
            return {
              ...page,
              title,
              url,
              contentPageId,
              updatedAt: new Date(),
            };
          }
          return {
            ...page,
            children: updatePageInTree(page.children),
          };
        });
      };

      const newPages = updatePageInTree(sitemap.pages);
      await saveSitemap(newPages);
    } else {
      // Create new page
      const newPage = SitemapService.createSitemapPage(
        title,
        url,
        undefined,
        contentPageId
      );
      const newPages = [...sitemap.pages, newPage];
      await saveSitemap(newPages);
    }

    setShowPageForm(false);
    setEditingPage(undefined);
  };

  const handleCreateContentPage = async (title: string, url: string) => {
    try {
      const newContentPage = await SitemapService.createContentPage(
        siteId,
        title,
        url
      );
      setContentPages((prev) => [...prev, newContentPage]);

      // After creating the content page, save the sitemap page with the link
      await handleSavePage(title, url, newContentPage.id);
    } catch (err) {
      console.error("Error creating content page:", err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sitemap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link
                href={`/sites/${siteId}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4"
              >
                ← Back to Site
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Sitemap Editor
                </h1>
                <p className="text-sm text-gray-600">
                  Create and organize your site structure
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {saving && (
                <div className="flex items-center text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-sm">Saving...</span>
                </div>
              )}
              <button
                onClick={handleAddPage}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Page
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg
                className="w-5 h-5 text-red-400 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div>
                <p className="text-red-800">{error}</p>
                <button
                  onClick={loadData}
                  className="text-red-600 hover:text-red-800 text-sm font-medium mt-1"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sitemap Tree */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Site Structure
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Drag and drop pages to reorganize your site structure
                </p>
              </div>

              <div className="p-6">
                {sitemap && sitemap.pages.length > 0 ? (
                  <div className="space-y-1">
                    {sitemap.pages.map((page) => (
                      <SitemapTreeItem
                        key={page.id}
                        page={page}
                        level={0}
                        onEdit={handleEditPage}
                        onDelete={handleDeletePage}
                        onMove={handleMovePage}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No pages yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Get started by adding your first page to the sitemap.
                    </p>
                    <button
                      onClick={handleAddPage}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
                    >
                      Add Your First Page
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Content Pages
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Available content pages ({contentPages.length})
                </p>
              </div>

              <div className="p-6">
                {contentPages.length > 0 ? (
                  <div className="space-y-3">
                    {contentPages.map((page) => {
                      // Check if this content page is already in the sitemap
                      const isInSitemap = sitemap?.pages.some(
                        (sitemapPage) =>
                          sitemapPage.contentPageId === page.id ||
                          SitemapService.findPageWithContentId(
                            sitemap.pages,
                            page.id
                          )
                      );

                      return (
                        <div
                          key={page.id}
                          className="p-3 bg-gray-50 rounded-md"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900">
                                {page.title}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {page.url}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                    page.status === "published"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {page.status}
                                </span>
                                {isInSitemap && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                    In Sitemap
                                  </span>
                                )}
                              </div>
                            </div>
                            {!isInSitemap && (
                              <button
                                onClick={() =>
                                  handleAddContentPageToSitemap(page)
                                }
                                disabled={saving}
                                className="ml-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                                title="Add to sitemap"
                              >
                                Add
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">
                      No content pages created yet.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h3>
              </div>

              <div className="p-6 space-y-3">
                <Link
                  href={`/sites/${siteId}/content`}
                  className="block w-full text-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Manage Content
                </Link>
                <Link
                  href={`/sites/${siteId}/export`}
                  className="block w-full text-center bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Export to WordPress
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Page Form Modal */}
      {showPageForm && (
        <PageFormModal
          page={editingPage}
          contentPages={contentPages}
          onSave={handleSavePage}
          onCancel={() => {
            setShowPageForm(false);
            setEditingPage(undefined);
          }}
          onCreateContentPage={handleCreateContentPage}
        />
      )}
    </div>
  );
}
