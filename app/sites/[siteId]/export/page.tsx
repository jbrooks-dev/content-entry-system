"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface ExportStats {
  totalPages: number;
  publishedPages: number;
  draftPages: number;
  pagesWithContent: number;
  exportDate: string;
}

interface ExportInfo {
  site: {
    id: string;
    name: string;
    url: string;
  };
  stats: ExportStats;
  hasSitemap: boolean;
  hasContent: boolean;
}

export default function WordPressExport() {
  const params = useParams();
  const siteId = params.siteId as string;

  const [exportInfo, setExportInfo] = useState<ExportInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<"wxr" | "json">("wxr");

  useEffect(() => {
    loadExportInfo();
  }, [siteId]);

  const loadExportInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/sites/${siteId}/export`);
      if (!response.ok) {
        throw new Error("Failed to load export information");
      }

      const info = await response.json();
      setExportInfo(info);
    } catch (err) {
      setError("Failed to load export information. Please try again.");
      console.error("Error loading export info:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!exportInfo) return;

    try {
      setExporting(true);
      setError(null);

      // Generate export
      const response = await fetch(`/api/sites/${siteId}/export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          format: exportFormat,
          includeContent: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate export");
      }

      const result = await response.json();

      // Trigger download
      const downloadUrl = result.downloadUrl;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError("Failed to export. Please try again.");
      console.error("Error exporting:", err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading export information...</p>
        </div>
      </div>
    );
  }

  if (!exportInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No export information available.</p>
        </div>
      </div>
    );
  }

  const canExport = exportInfo.hasSitemap && exportInfo.hasContent;

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
                  WordPress Export
                </h1>
                <p className="text-sm text-gray-600">
                  Export your content to WordPress WXR format
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Site Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Site Information
            </h2>
          </div>

          <div className="p-6">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Site Name</dt>
                <dd className="text-sm text-gray-900">
                  {exportInfo.site.name}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Site URL</dt>
                <dd className="text-sm text-gray-900">
                  {exportInfo.site.url || "Not specified"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Export Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Export Preview
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Overview of content that will be exported
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {exportInfo.stats.totalPages}
                </div>
                <div className="text-sm text-gray-500">Total Pages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {exportInfo.stats.publishedPages}
                </div>
                <div className="text-sm text-gray-500">Published</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {exportInfo.stats.draftPages}
                </div>
                <div className="text-sm text-gray-500">Drafts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {exportInfo.stats.pagesWithContent}
                </div>
                <div className="text-sm text-gray-500">With Content</div>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center">
                <div
                  className={`w-4 h-4 rounded-full mr-3 ${
                    exportInfo.hasSitemap ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-sm text-gray-700">
                  Sitemap{" "}
                  {exportInfo.hasSitemap ? "Available" : "Not Available"}
                </span>
              </div>
              <div className="flex items-center">
                <div
                  className={`w-4 h-4 rounded-full mr-3 ${
                    exportInfo.hasContent ? "bg-green-500" : "bg-yellow-500"
                  }`}
                ></div>
                <span className="text-sm text-gray-700">
                  Content Pages{" "}
                  {exportInfo.hasContent ? "Available" : "None Created"}
                </span>
              </div>
            </div>

            {!canExport && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <svg
                    className="w-5 h-5 text-yellow-400 mr-3"
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
                    <h3 className="text-yellow-800 font-medium">
                      Export Not Available
                    </h3>
                    <p className="text-yellow-700 text-sm mt-1">
                      {!exportInfo.hasSitemap &&
                        "You need to create a sitemap first. "}
                      {!exportInfo.hasContent &&
                        "You need to create some content pages first."}
                    </p>
                    <div className="mt-3 space-x-3">
                      {!exportInfo.hasSitemap && (
                        <Link
                          href={`/sites/${siteId}/sitemap`}
                          className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                        >
                          Create Sitemap →
                        </Link>
                      )}
                      {!exportInfo.hasContent && (
                        <Link
                          href={`/sites/${siteId}/content`}
                          className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                        >
                          Create Content →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Export Options */}
        {canExport && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Export Options
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Choose your export format and settings
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Export Format
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setExportFormat("wxr")}
                      className={`p-4 text-left border rounded-lg transition-colors ${
                        exportFormat === "wxr"
                          ? "bg-blue-50 border-blue-300 text-blue-700"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="font-medium">
                        WordPress WXR (Recommended)
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Standard WordPress export format (.xml)
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExportFormat("json")}
                      className={`p-4 text-left border rounded-lg transition-colors ${
                        exportFormat === "json"
                          ? "bg-purple-50 border-purple-300 text-purple-700"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="font-medium">JSON Format</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Structured data format (.json)
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Actions */}
        {canExport && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Generate Export
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Create and download your WordPress export file
              </p>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Ready to Export
                  </h3>
                  <p className="text-sm text-gray-500">
                    Export format:{" "}
                    <span className="font-medium">
                      {exportFormat.toUpperCase()}
                    </span>
                  </p>
                </div>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-md font-medium transition-colors flex items-center gap-2"
                >
                  {exporting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
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
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  {exporting ? "Generating..." : "Download Export"}
                </button>
              </div>

              {/* Help Text */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-blue-800 font-medium mb-2">
                  How to Import
                </h4>
                <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                  <li>Download the export file using the button above</li>
                  <li>In your WordPress admin, go to Tools → Import</li>
                  <li>
                    Choose &quot;WordPress&quot; and install the importer if
                    needed
                  </li>
                  <li>Upload your export file and follow the import wizard</li>
                  <li>Map authors and choose import options as needed</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href={`/sites/${siteId}/sitemap`}
              className="flex items-center justify-center bg-white border border-gray-300 rounded-md px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
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
              Manage Sitemap
            </Link>

            <Link
              href={`/sites/${siteId}/content`}
              className="flex items-center justify-center bg-white border border-gray-300 rounded-md px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Content
            </Link>

            <button
              onClick={loadExportInfo}
              className="flex items-center justify-center bg-white border border-gray-300 rounded-md px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh Stats
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
