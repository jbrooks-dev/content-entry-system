"use client";

import React, { useState, useEffect } from "react";
import { Site } from "@/types/site";
import { SiteCard } from "@/components/SiteCard";
import { SiteForm } from "@/components/SiteForm";
import { SitesService } from "@/lib/sites";

export default function Dashboard() {
  const [sites, setSites] = useState<Site[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load sites from API on component mount
  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      setLoading(true);
      setError(null);
      const sitesData = await SitesService.getAllSites();
      setSites(sitesData);
    } catch (err) {
      setError("Failed to load sites. Please try again.");
      console.error("Error loading sites:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSite = () => {
    setEditingSite(undefined);
    setShowForm(true);
  };

  const handleEditSite = (site: Site) => {
    setEditingSite(site);
    setShowForm(true);
  };

  const handleSaveSite = async (
    siteData: Omit<Site, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      setError(null);

      if (editingSite) {
        // Update existing site
        const updatedSite = await SitesService.updateSite(
          editingSite.id,
          siteData
        );
        setSites((prev) =>
          prev.map((site) => (site.id === editingSite.id ? updatedSite : site))
        );
      } else {
        // Create new site
        const newSite = await SitesService.createSite(siteData);
        setSites((prev) => [...prev, newSite]);
      }

      setShowForm(false);
      setEditingSite(undefined);
    } catch (err) {
      setError(
        editingSite ? "Failed to update site." : "Failed to create site."
      );
      console.error("Error saving site:", err);
    }
  };

  const handleSelectSite = (site: Site) => {
    // This would navigate to the site management page
    console.log("Selected site:", site);
    alert(
      `Selected site: ${site.name}\n(Navigation to site management would be implemented here)`
    );
  };

  const handleDeleteSite = async (site: Site) => {
    if (
      !confirm(
        `Are you sure you want to delete "${site.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setError(null);
      await SitesService.deleteSite(site.id);
      setSites((prev) => prev.filter((s) => s.id !== site.id));
    } catch (err) {
      setError("Failed to delete site.");
      console.error("Error deleting site:", err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSite(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Content Entry System
              </h1>
              <p className="text-sm text-gray-600">
                Manage WordPress sites and content
              </p>
            </div>
            <button
              onClick={handleCreateSite}
              disabled={loading}
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
              New Site
            </button>
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
                  onClick={loadSites}
                  className="text-red-600 hover:text-red-800 text-sm font-medium mt-1"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          // Loading state
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sites...</p>
          </div>
        ) : sites.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No sites yet
            </h2>
            <p className="text-gray-600 mb-6">
              Get started by creating your first WordPress site to manage
              content for.
            </p>
            <button
              onClick={handleCreateSite}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Create Your First Site
            </button>
          </div>
        ) : (
          // Sites grid
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Sites ({sites.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sites.map((site) => (
                <SiteCard
                  key={site.id}
                  site={site}
                  onEdit={handleEditSite}
                  onSelect={handleSelectSite}
                  onDelete={handleDeleteSite}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Site Form Modal */}
      {showForm && (
        <SiteForm
          site={editingSite}
          onSave={handleSaveSite}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
