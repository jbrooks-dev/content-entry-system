"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Site } from "@/types/site";
import { SitesService } from "@/lib/sites";

export default function SiteSettings() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.siteId as string;

  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    devUrl: "",
    productionUrl: "",
    notes: "",
    client: "",
    host: "WPEngine",
    customHost: "",
    template: "Premier",
    headerScripts: "",
    bodyScripts: "",
    footerScripts: "",
  });

  // Load site data on component mount
  useEffect(() => {
    loadSite();
  }, [siteId]);

  const loadSite = async () => {
    try {
      setLoading(true);
      setError(null);
      const siteData = await SitesService.getSiteById(siteId);

      if (!siteData) {
        setError("Site not found");
        return;
      }

      setSite(siteData);
      setFormData({
        name: siteData.name || "",
        devUrl: siteData.devUrl || "",
        productionUrl: siteData.productionUrl || "",
        notes: siteData.notes || "",
        client: siteData.client || "",
        host: siteData.host || "WPEngine",
        customHost: siteData.customHost || "",
        template: siteData.template || "Premier",
        headerScripts: siteData.headerScripts || "",
        bodyScripts: siteData.bodyScripts || "",
        footerScripts: siteData.footerScripts || "",
      });
    } catch (err) {
      setError("Failed to load site data");
      console.error("Error loading site:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear custom host when host is not 'Other'
    if (name === "host" && value !== "Other") {
      setFormData((prev) => ({
        ...prev,
        customHost: "",
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Site name is required");
      return;
    }

    // Validate custom host if 'Other' is selected
    if (formData.host === "Other" && !formData.customHost.trim()) {
      setError("Custom host is required when 'Other' is selected");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      console.log('FORMDATA', formData)

      const updateData = {
        name: formData.name.trim(),
        devUrl: formData.devUrl.trim(),
        productionUrl: formData.productionUrl.trim(),
        notes: formData.notes.trim(),
        client: formData.client.trim(),
        host: formData.host,
        customHost: formData.host === "Other" ? formData.customHost.trim() : "",
        template: formData.template,
        headerScripts: formData.headerScripts.trim(),
        bodyScripts: formData.bodyScripts.trim(),
        footerScripts: formData.footerScripts.trim(),
      };

      const updatedSite = await SitesService.updateSite(siteId, updateData);
      setSite(updatedSite);
      setSuccessMessage("Site settings saved successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save site settings");
      console.error("Error saving site:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading site settings...</p>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Site Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The requested site could not be found.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.push(`/sites/${siteId}`)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Site Management
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Site Settings</h1>
        <p className="text-gray-600">
          Configure settings, URLs, and scripts for <strong>{site.name}</strong>
        </p>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">
                {successMessage}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Site Title *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter site title"
                />
              </div>

              <div>
                <label
                  htmlFor="client"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Client
                </label>
                <input
                  type="text"
                  id="client"
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter client name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="devUrl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Development URL
                </label>
                <input
                  type="url"
                  id="devUrl"
                  name="devUrl"
                  value={formData.devUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://dev.example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="productionUrl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Production URL
                </label>
                <input
                  type="url"
                  id="productionUrl"
                  name="productionUrl"
                  value={formData.productionUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional notes about this site..."
              />
            </div>
          </div>
        </div>

        {/* Hosting & Template */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Hosting & Template
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="host"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Host
                </label>
                <select
                  id="host"
                  name="host"
                  value={formData.host}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="WPEngine">WPEngine</option>
                  <option value="Siteground">Siteground</option>
                  <option value="AWS">AWS</option>
                  <option value="Other">Other</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Hosting information available in LastPass.
                </p>

                {formData.host === "Other" && (
                  <div className="mt-3">
                    <input
                      type="text"
                      name="customHost"
                      value={formData.customHost}
                      onChange={handleChange}
                      placeholder="Enter custom host name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="template"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Template
                </label>
                <select
                  id="template"
                  name="template"
                  value={formData.template}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Premier">Premier</option>
                  <option value="Pro">Pro</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Scripts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Scripts</h3>
            <p className="text-sm text-gray-600 mt-1">
              Add custom scripts that will be injected into different parts of
              your website.
            </p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label
                htmlFor="headerScripts"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Header Scripts
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Scripts added here will be inserted in the &lt;head&gt; section
                of your website.
              </p>
              <textarea
                id="headerScripts"
                name="headerScripts"
                value={formData.headerScripts}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="<script>
  // Header scripts go here
</script>"
              />
            </div>

            <div>
              <label
                htmlFor="bodyScripts"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Body Scripts
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Scripts added here will be inserted just after the opening
                &lt;body&gt; tag.
              </p>
              <textarea
                id="bodyScripts"
                name="bodyScripts"
                value={formData.bodyScripts}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="<script>
  // Body scripts go here
</script>"
              />
            </div>

            <div>
              <label
                htmlFor="footerScripts"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Footer Scripts
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Scripts added here will be inserted just before the closing
                &lt;/body&gt; tag.
              </p>
              <textarea
                id="footerScripts"
                name="footerScripts"
                value={formData.footerScripts}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="<script>
  // Footer scripts go here
</script>"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push(`/sites/${siteId}`)}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md font-medium transition-colors flex items-center gap-2"
          >
            {saving && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
