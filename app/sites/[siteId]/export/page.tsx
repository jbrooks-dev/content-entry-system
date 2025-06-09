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

// Default stats for when data is loading or unavailable
const defaultStats: ExportStats = {
  totalPages: 0,
  publishedPages: 0,
  draftPages: 0,
  pagesWithContent: 0,
  exportDate: new Date().toISOString(),
};

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

      // Ensure stats object exists with default values
      const safeInfo: ExportInfo = {
        ...info,
        stats: info.stats || defaultStats,
      };

      setExportInfo(safeInfo);
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
      link.download =
        result.filename || `${exportInfo.site.name}-export.${exportFormat}`;
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

  // Safe access to stats with fallback
  const stats = exportInfo?.stats || defaultStats;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">
              Loading export information...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!exportInfo) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Export Not Available
            </h1>
            <p className="text-gray-600 mb-6">
              Unable to load export information for this site.
            </p>
            <Link
              href={`/sites/${siteId}`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href={`/sites/${siteId}`}
                className="text-blue-600 hover:text-blue-700 font-medium mb-2 inline-block"
              >
                ← Back to Site
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                WordPress Export
              </h1>
              <p className="text-gray-600 mt-2">
                Export your site content to WordPress format
              </p>
            </div>
          </div>
        </div>

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
                  {stats.totalPages}
                </div>
                <div className="text-sm text-gray-500">Total Pages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.publishedPages}
                </div>
                <div className="text-sm text-gray-500">Published</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.draftPages}
                </div>
                <div className="text-sm text-gray-500">Drafts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.pagesWithContent}
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
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Export Options
            </h2>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Export Format
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="format"
                      value="wxr"
                      checked={exportFormat === "wxr"}
                      onChange={(e) => setExportFormat(e.target.value as "wxr")}
                      className="form-radio text-blue-600"
                    />
                    <span className="ml-2">
                      <span className="font-medium">WordPress XML (WXR)</span>
                      <span className="text-gray-500 text-sm block">
                        Standard WordPress export format for importing into
                        WordPress sites
                      </span>
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="format"
                      value="json"
                      checked={exportFormat === "json"}
                      onChange={(e) =>
                        setExportFormat(e.target.value as "json")
                      }
                      className="form-radio text-blue-600"
                    />
                    <span className="ml-2">
                      <span className="font-medium">JSON</span>
                      <span className="text-gray-500 text-sm block">
                        Raw data export for custom processing or backup
                      </span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Ready to Export
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Download your site content in {exportFormat.toUpperCase()}{" "}
                  format
                </p>
              </div>

              <button
                onClick={handleExport}
                disabled={
                  exporting ||
                  (!exportInfo.hasSitemap && !exportInfo.hasContent)
                }
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  exporting ||
                  (!exportInfo.hasSitemap && !exportInfo.hasContent)
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {exporting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="opacity-25"
                      ></circle>
                      <path
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        className="opacity-75"
                      ></path>
                    </svg>
                    Generating Export...
                  </span>
                ) : (
                  `Export ${exportFormat.toUpperCase()}`
                )}
              </button>
            </div>

            {/* Warning for empty export */}
            {!exportInfo.hasSitemap && !exportInfo.hasContent && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This site has no sitemap or content
                  pages. The export will be empty. Consider adding some content
                  before exporting.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
