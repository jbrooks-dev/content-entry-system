"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Site {
  id: string;
  name: string;
  devUrl: string;
  productionUrl: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export default function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ siteId: string }>;
}) {
  const [siteId, setSiteId] = useState<string>("");
  const [siteName, setSiteName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSiteData = async () => {
      try {
        const resolvedParams = await params;
        setSiteId(resolvedParams.siteId);

        // Fetch all sites and find the one we need (workaround for routing conflicts)
        const response = await fetch("/api/sites");
        if (response.ok) {
          const sites: Site[] = await response.json();
          const currentSite = sites.find(
            (site) => site.id === resolvedParams.siteId
          );

          if (currentSite) {
            setSiteName(currentSite.name);
          } else {
            console.warn(`Site not found with ID: ${resolvedParams.siteId}`);
            setSiteName(`Site: ${resolvedParams.siteId}`);
          }
        } else {
          console.error(
            "Failed to fetch sites data:",
            response.status,
            response.statusText
          );
          setSiteName(`Site: ${resolvedParams.siteId}`);
        }
      } catch (error) {
        console.error("Error loading site data:", error);
        const resolvedParams = await params;
        setSiteId(resolvedParams.siteId);
        setSiteName(`Site: ${resolvedParams.siteId}`);
      } finally {
        setLoading(false);
      }
    };

    loadSiteData();
  }, [params]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation breadcrumb */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-12 justify-between">
            {loading ? (
              <div className="flex items-center">
                <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
              </div>
            ) : (
              <span
                className="text-sm text-gray-600"
                title={`Site ID: ${siteId}`}
              >
                {siteName}
              </span>
            )}
            <Link
              href="/"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
            >
              Main Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {children}
    </div>
  );
}
