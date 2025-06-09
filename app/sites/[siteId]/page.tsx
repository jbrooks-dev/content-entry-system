"use client";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function SiteManagement() {
  const params = useParams();
  const siteId = params.siteId as string;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Site Management
        </h1>
        <p className="text-gray-600">
          Manage content, pages, and settings for your WordPress site.
        </p>
      </div>

      {/* Management Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* SiteMap Creation */}
        <Link
          href={`/sites/${siteId}/sitemap`}
          className="block bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-4">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <path
                    d="M12 12H7.6C7.03995 12 6.75992 12 6.54601 12.109C6.35785 12.2049 6.20487 12.3578 6.10899 12.546C6 12.7599 6 13.0399 6 13.6V16M12 12H16.4C16.9601 12 17.2401 12 17.454 12.109C17.6422 12.2049 17.7951 12.3578 17.891 12.546C18 12.7599 18 13.0399 18 13.6V16M12 12V8M11.1 8H12.9C13.4601 8 13.7401 8 13.954 7.89101C14.1422 7.79513 14.2951 7.64215 14.391 7.45399C14.5 7.24008 14.5 6.96005 14.5 6.4V4.6C14.5 4.03995 14.5 3.75992 14.391 3.54601C14.2951 3.35785 14.1422 3.20487 13.954 3.10899C13.7401 3 13.4601 3 12.9 3H11.1C10.5399 3 10.2599 3 10.046 3.10899C9.85785 3.20487 9.70487 3.35785 9.60899 3.54601C9.5 3.75992 9.5 4.03995 9.5 4.6V6.4C9.5 6.96005 9.5 7.24008 9.60899 7.45399C9.70487 7.64215 9.85785 7.79513 10.046 7.89101C10.2599 8 10.5399 8 11.1 8ZM5.1 21H6.9C7.46005 21 7.74008 21 7.95399 20.891C8.14215 20.7951 8.29513 20.6422 8.39101 20.454C8.5 20.2401 8.5 19.9601 8.5 19.4V17.6C8.5 17.0399 8.5 16.7599 8.39101 16.546C8.29513 16.3578 8.14215 16.2049 7.95399 16.109C7.74008 16 7.46005 16 6.9 16H5.1C4.53995 16 4.25992 16 4.04601 16.109C3.85785 16.2049 3.70487 16.3578 3.60899 16.546C3.5 16.7599 3.5 17.0399 3.5 17.6V19.4C3.5 19.9601 3.5 20.2401 3.60899 20.454C3.70487 20.6422 3.85785 20.7951 4.04601 20.891C4.25992 21 4.53995 21 5.1 21ZM17.1 21H18.9C19.4601 21 19.7401 21 19.954 20.891C20.1422 20.7951 20.2951 20.6422 20.391 20.454C20.5 20.2401 20.5 19.9601 20.5 19.4V17.6C20.5 17.0399 20.5 16.7599 20.391 16.546C20.2951 16.3578 20.1422 16.2049 19.954 16.109C19.7401 16 19.4601 16 18.9 16H17.1C16.5399 16 16.2599 16 16.046 16.109C15.8578 16.2049 15.7049 16.3578 15.609 16.546C15.5 16.7599 15.5 17.0399 15.5 17.6V19.4C15.5 19.9601 15.5 20.2401 15.609 20.454C15.7049 20.6422 15.8578 20.7951 16.046 20.891C16.2599 21 16.5399 21 17.1 21Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </g>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              SiteMap Creation
            </h3>
          </div>
          <p className="text-gray-600 text-sm">
            Create and manage the structure of your WordPress site with an
            intuitive sitemap builder.
          </p>
        </Link>

        {/* Content Entry */}
        <Link
          href={`/sites/${siteId}/content`}
          className="block bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mr-4">
              <svg
                fill="currentColor"
                height="200px"
                width="200px"
                version="1.1"
                id="Layer_1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className="h-6 w-6"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <g>
                    <g>
                      <path d="M421.286,121.468V60.734h-118.47L242.083,0H20.279v390.532h70.435v60.734h70.437V512h330.571V121.468H421.286z M250.992,51.925l8.809,8.809l24.253,24.253l14.871,14.871h-47.932V51.925z M50.696,360.115V30.417h169.879v99.859h99.857v229.839 H90.714H50.696z M121.131,420.849v-30.317h229.718V108.768l-17.617-17.617h57.635v30.317v299.381H161.151H121.131z M461.304,481.583H191.568v-30.317h229.719V151.885h40.018V481.583z"></path>
                    </g>
                  </g>
                </g>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Content Pages
            </h3>
          </div>
          <p className="text-gray-600 text-sm">
            Create, edit, and manage all content pages with a powerful WYSIWYG
            editor.
          </p>
        </Link>

        {/* Content Pages List */}
        {/* <Link
          href={`/sites/${siteId}/pages`}
          className="block bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-purple-600"
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
            <h3 className="text-lg font-semibold text-gray-900">
              Content Pages
            </h3>
          </div>
          <p className="text-gray-600 text-sm">
            View and manage all content pages created for this site in one
            organized list.
          </p>
        </Link> */}

        {/* WordPress Export */}
        <Link
          href={`/sites/${siteId}/export`}
          className="block bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-orange-600"
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
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              WordPress Export
            </h3>
          </div>
          <p className="text-gray-600 text-sm">
            Export your content as a WordPress WXR file for easy import into
            your WordPress site.
          </p>
        </Link>

        {/* Site Settings */}
        <Link
          href={`/sites/${siteId}/settings`}
          className="block bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Site Settings
            </h3>
          </div>
          <p className="text-gray-600 text-sm">
            Configure site settings, URLs, and other preferences for this
            WordPress site.
          </p>
        </Link>

        {/* Analytics/Stats */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 opacity-50">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
          </div>
          <p className="text-gray-600 text-sm">
            View content statistics and performance metrics. (Coming Soon)
          </p>
        </div>
      </div>
    </div>
  );
}
