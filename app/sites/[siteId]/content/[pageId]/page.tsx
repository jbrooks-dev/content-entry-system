"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ContentPage } from "@/types/sitemap";
import { SitemapService } from "@/lib/sitemap";
import WysiwygEditor, {
  WysiwygEditorRef,
} from "@/components/content/WysiwygEditor";

export default function ContentEditor() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.siteId as string;
  const pageId = params.pageId as string;
  const isNewPage = pageId === "new";

  const editorRef = useRef<WysiwygEditorRef>(null);

  const [page, setPage] = useState<ContentPage | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    metaDescription: "",
    status: "draft" as "draft" | "published",
  });
  const [loading, setLoading] = useState(!isNewPage);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addToSitemap, setAddToSitemap] = useState(false);

  useEffect(() => {
    if (!isNewPage) {
      loadPage();
    }
  }, [pageId, siteId, isNewPage]);

  const loadPage = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/sites/${siteId}/content-pages/${pageId}`
      );
      if (!response.ok) {
        throw new Error("Page not found");
      }

      const pageData = await response.json();
      const loadedPage = {
        ...pageData,
        createdAt: new Date(pageData.createdAt),
        updatedAt: new Date(pageData.updatedAt),
      };

      setPage(loadedPage);
      setFormData({
        title: loadedPage.title,
        url: loadedPage.url,
        metaDescription: loadedPage.metaDescription || "",
        status: loadedPage.status,
      });
    } catch (err) {
      setError("Failed to load page. Please try again.");
      console.error("Error loading page:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.url.trim()) {
      setError("Title and URL are required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Get content from editor
      const { editorData, html } = (await editorRef.current?.save()) || {
        editorData: { blocks: [] },
        html: "",
      };

      const pageData = {
        title: formData.title.trim(),
        url: formData.url.trim(),
        metaDescription: formData.metaDescription.trim(),
        content: JSON.stringify(editorData),
        contentHtml: html,
        status: formData.status,
      };

      let savedPage;

      if (isNewPage) {
        // Create new page
        const response = await fetch(`/api/sites/${siteId}/content-pages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pageData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create page");
        }

        savedPage = await response.json();
      } else {
        // Update existing page
        const response = await fetch(
          `/api/sites/${siteId}/content-pages/${pageId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(pageData),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update page");
        }

        savedPage = await response.json();
      }

      // Add to sitemap if requested
      if (addToSitemap && isNewPage) {
        try {
          const sitemap = await SitemapService.getSitemap(siteId);
          const newSitemapPage = SitemapService.createSitemapPage(
            savedPage.title,
            savedPage.url,
            undefined,
            savedPage.id
          );
          const newPages = [...sitemap.pages, newSitemapPage];
          await SitemapService.updateSitemap(siteId, newPages);
        } catch (sitemapError) {
          console.warn("Failed to add to sitemap:", sitemapError);
          // Don't fail the whole operation if sitemap addition fails
        }
      }

      // Redirect to content list or stay on edit page
      if (isNewPage) {
        router.push(`/sites/${siteId}/content`);
      } else {
        setPage({
          ...savedPage,
          createdAt: new Date(savedPage.createdAt),
          updatedAt: new Date(savedPage.updatedAt),
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to save page. Please try again.");
      console.error("Error saving page:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateUrlFromTitle = () => {
    if (formData.title && !formData.url) {
      const url =
        "/" +
        formData.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim();
      setFormData((prev) => ({ ...prev, url }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  const initialEditorData = page?.content
    ? JSON.parse(page.content)
    : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link
                href={`/sites/${siteId}/content`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4"
              >
                ← Back to Content Pages
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isNewPage ? "Create New Page" : "Edit Page"}
                </h1>
                <p className="text-sm text-gray-600">
                  {isNewPage
                    ? "Create a new content page"
                    : `Editing: ${page?.title}`}
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
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                {isNewPage ? "Create Page" : "Save Changes"}
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
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Page Content
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Use the editor below to create your page content
                </p>
              </div>

              <div className="p-6">
                <WysiwygEditor
                  ref={editorRef}
                  initialData={initialEditorData}
                  placeholder="Start writing your page content..."
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Page Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Page Settings
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Page Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    onBlur={generateUrlFromTitle}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter page title"
                  />
                </div>

                <div>
                  <label
                    htmlFor="url"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Page URL *
                  </label>
                  <input
                    type="text"
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="/page-url"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL should start with / (e.g., /about-us)
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="metaDescription"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Meta Description
                  </label>
                  <textarea
                    id="metaDescription"
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleFormChange}
                    rows={3}
                    maxLength={160}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description for search engines (160 chars max)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.metaDescription.length}/160 characters
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                {isNewPage && (
                  <div className="pt-4 border-t border-gray-200">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={addToSitemap}
                        onChange={(e) => setAddToSitemap(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Add to sitemap after creating
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      This will automatically add the page to your site&apos;s
                      navigation structure.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h3>
              </div>

              <div className="p-6 space-y-3">
                <Link
                  href={`/sites/${siteId}/sitemap`}
                  className="block w-full text-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Manage Sitemap
                </Link>
                <Link
                  href={`/sites/${siteId}/content`}
                  className="block w-full text-center bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  All Content Pages
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
