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
  });

  useEffect(() => {
    if (site) {
      setFormData({
        name: site.name,
        devUrl: site.devUrl,
        productionUrl: site.productionUrl,
        notes: site.notes,
      });
    }
  }, [site]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSave(formData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {site ? "Edit Site" : "Create New Site"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
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
