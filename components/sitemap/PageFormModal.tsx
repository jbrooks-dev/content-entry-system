"use client";

import React, { useState, useEffect } from "react";
import { SitemapPage, ContentPage } from "@/types/sitemap";

interface PageFormModalProps {
  page?: SitemapPage;
  contentPages: ContentPage[];
  onSave: (title: string, url: string, contentPageId?: string) => void;
  onCancel: () => void;
  onCreateContentPage: (title: string, url: string) => Promise<void>;
}

export const PageFormModal: React.FC<PageFormModalProps> = ({
  page,
  contentPages,
  onSave,
  onCancel,
  onCreateContentPage,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    contentPageId: "",
  });
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [isCreatingContent, setIsCreatingContent] = useState(false);

  useEffect(() => {
    if (page) {
      setFormData({
        title: page.title,
        url: page.url,
        contentPageId: page.contentPageId || "",
      });
      setMode(page.contentPageId ? "existing" : "new");
    } else {
      setFormData({ title: "", url: "", contentPageId: "" });
      setMode("existing");
    }
  }, [page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.url.trim()) return;

    if (mode === "new") {
      setIsCreatingContent(true);
      try {
        await onCreateContentPage(formData.title, formData.url);
        // The parent component will handle updating the content pages list
        // and we'll switch to existing mode
      } catch (error) {
        console.error("Failed to create content page:", error);
        setIsCreatingContent(false);
        return;
      }
      setIsCreatingContent(false);
    } else {
      onSave(
        formData.title,
        formData.url,
        mode === "existing" ? formData.contentPageId : undefined
      );
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const generateUrlFromTitle = (title: string) => {
    const url =
      "/" +
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    setFormData((prev) => ({ ...prev, url }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {page ? "Edit Page" : "Add Page"}
          </h2>

          {/* Mode Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Page Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode("existing")}
                className={`p-3 text-center border rounded-lg transition-colors ${
                  mode === "existing"
                    ? "bg-green-50 border-green-300 text-green-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="text-sm font-medium">Existing Page</div>
                <div className="text-xs text-gray-500">Link to content</div>
              </button>

              <button
                type="button"
                onClick={() => setMode("new")}
                className={`p-3 text-center border rounded-lg transition-colors ${
                  mode === "new"
                    ? "bg-purple-50 border-purple-300 text-purple-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="text-sm font-medium">New Content</div>
                <div className="text-xs text-gray-500">Create & link</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Existing Content Page Selection */}
            {mode === "existing" && (
              <div>
                <label
                  htmlFor="contentPageId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Select Content Page
                </label>
                <select
                  id="contentPageId"
                  name="contentPageId"
                  value={formData.contentPageId}
                  onChange={(e) => {
                    handleChange(e);
                    const selectedPage = contentPages.find(
                      (p) => p.id === e.target.value
                    );
                    if (selectedPage) {
                      setFormData((prev) => ({
                        ...prev,
                        title: selectedPage.title,
                        url: selectedPage.url,
                      }));
                    }
                  }}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a content page...</option>
                  {contentPages.map((page) => (
                    <option key={page.id} value={page.id}>
                      {page.title} ({page.url})
                    </option>
                  ))}
                </select>
                {contentPages.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    No content pages available. Switch to &quot;New Content&quot; to
                    create one.
                  </p>
                )}
              </div>
            )}

            {/* Page Title */}
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
                onChange={handleChange}
                onBlur={() => {
                  if (!formData.url && formData.title) {
                    generateUrlFromTitle(formData.title);
                  }
                }}
                required
                disabled={mode === "existing" && (formData.contentPageId!==undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter page title"
              />
            </div>

            {/* Page URL */}
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
                onChange={handleChange}
                required
                disabled={mode === "existing"  && (formData.contentPageId!==undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="/page-url"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL should start with / (e.g., /about-us)
              </p>
            </div>

            {/* Mode-specific help text */}
            {mode === "new" && (
              <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                <p className="text-sm text-purple-700">
                  This will create a new content page and link it to this
                  sitemap entry.
                </p>
              </div>
            )}

            {mode === "existing" && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-700">
                  This will link an existing content page to this sitemap entry.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={
                  isCreatingContent ||
                  (mode === "existing" && !formData.contentPageId)
                }
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isCreatingContent && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {page ? "Update Page" : "Add Page"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={isCreatingContent}
                className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
