import React from "react";
import Link from "next/link";
import { Site } from "@/types/site";

interface SiteCardProps {
  site: Site;
  onEdit: (site: Site) => void;
  onSelect: (site: Site) => void;
  onDelete?: (site: Site) => void;
}

export const SiteCard: React.FC<SiteCardProps> = ({
  site,
  onEdit,
  onSelect,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{site.name}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(site)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(site)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div>
          <span className="text-sm font-medium text-gray-500">Dev URL:</span>
          <p className="text-sm text-gray-700 break-all">
            {site.devUrl || "Not set"}
          </p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">
            Production URL:
          </span>
          <p className="text-sm text-gray-700 break-all">
            {site.productionUrl || "Not set"}
          </p>
        </div>
        {site.notes && (
          <div>
            <span className="text-sm font-medium text-gray-500">Notes:</span>
            <p className="text-sm text-gray-700">{site.notes}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        {/* <span className="text-xs text-gray-400">
          Created {site.createdAt.toLocaleDateString()}
        </span> */}
        <div className="flex gap-2">
          <Link
            href={`/sites/${site.id}`}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href={`/sites/${site.id}/sitemap`}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Sitemap
          </Link>
          <Link
            href={`/sites/${site.id}/content`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Pages
          </Link>
        </div>
      </div>
    </div>
  );
};
