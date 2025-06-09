import React, { useState, useEffect } from "react";
import { Site } from "@/types/site";

interface SiteFormProps {
  site?: Site;
  onSave: (siteData: Omit<Site, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

export const SiteForm: React.FC<SiteFormProps> = ({
  site,
  onSave,
  onCancel,
}) => {
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

  useEffect(() => {
    if (site) {
      setFormData({
        name: site.name || "",
        devUrl: site.devUrl || "",
        productionUrl: site.productionUrl || "",
        notes: site.notes || "",
        client: site.client || "",
        host: site.host || "WPEngine",
        customHost: site.customHost || "",
        template: site.template || "Premier",
        headerScripts: site.headerScripts || "",
        bodyScripts: site.bodyScripts || "",
        footerScripts: site.footerScripts || "",
      });
    }
  }, [site]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      // Validate custom host if 'Other' is selected
      if (formData.host === "Other" && !formData.customHost.trim()) {
        alert("Custom host is required when 'Other' is selected");
        return;
      }

      onSave({
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
      });
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {site ? "Edit Site" : "Create New Site"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Site Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter site name"
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

              <div className="mt-4">
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

            {/* Hosting & Template */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Hosting & Template
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="mt-2">
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

            {/* Scripts */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Scripts
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="headerScripts"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Header Scripts
                  </label>
                  <p className="text-xs text-gray-500 mb-1">
                    Scripts for the &lt;head&gt; section
                  </p>
                  <textarea
                    id="headerScripts"
                    name="headerScripts"
                    value={formData.headerScripts}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="<script>...</script>"
                  />
                </div>

                <div>
                  <label
                    htmlFor="bodyScripts"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Body Scripts
                  </label>
                  <p className="text-xs text-gray-500 mb-1">
                    Scripts for after opening &lt;body&gt; tag
                  </p>
                  <textarea
                    id="bodyScripts"
                    name="bodyScripts"
                    value={formData.bodyScripts}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="<script>...</script>"
                  />
                </div>

                <div>
                  <label
                    htmlFor="footerScripts"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Footer Scripts
                  </label>
                  <p className="text-xs text-gray-500 mb-1">
                    Scripts for before closing &lt;/body&gt; tag
                  </p>
                  <textarea
                    id="footerScripts"
                    name="footerScripts"
                    value={formData.footerScripts}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="<script>...</script>"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
              >
                {site ? "Update Site" : "Create Site"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
