"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { SitemapPage } from "@/types/sitemap";

interface SitemapTreeItemProps {
  page: SitemapPage;
  level: number;
  onEdit: (page: SitemapPage) => void;
  onDelete: (pageId: string) => void;
  onMove: (
    draggedId: string,
    targetId: string,
    position: "before" | "after" | "child"
  ) => void;
}

export const SitemapTreeItem: React.FC<SitemapTreeItemProps> = ({
  page,
  level,
  onEdit,
  onDelete,
  onMove,
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<
    "before" | "after" | "child" | null
  >(null);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const element = itemRef.current;
    if (!element) return;

    // Make item draggable
    const cleanupDraggable = draggable({
      element,
      getInitialData: () => ({ pageId: page.id, type: "sitemap-page" }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });

    // Make item a drop target
    const cleanupDropTarget = dropTargetForElements({
      element,
      canDrop: ({ source }) => {
        return (
          source.data.type === "sitemap-page" && source.data.pageId !== page.id
        );
      },
      onDragEnter: ({ location, source }) => {
        const rect = element.getBoundingClientRect();
        const clientY = location.current.input.clientY;
        const clientX = location.current.input.clientX;

        if (clientY === undefined || clientX === undefined) return;

        // Calculate relative position with more precision
        const relativeY = (clientY - rect.top) / rect.height;
        const relativeX = (clientX - rect.left) / rect.width;

        // More generous and accurate zones
        const topZone = 0.25; // Top 25%
        const bottomZone = 0.75; // Bottom 25%

        // Also consider horizontal position - if user is dragging more to the right,
        // they're more likely wanting to create a child relationship
        const isRightSide = relativeX > 0.3;

        if (relativeY < topZone && !isRightSide) {
          setDragPosition("before");
        } else if (relativeY > bottomZone && !isRightSide) {
          setDragPosition("after");
        } else {
          // Default to child for middle area or when dragging to the right
          setDragPosition("child");
        }

        // Debug logging to help track accuracy
        console.log("Drop zone:", {
          relativeY: relativeY.toFixed(2),
          relativeX: relativeX.toFixed(2),
          position:
            relativeY < topZone && !isRightSide
              ? "before"
              : relativeY > bottomZone && !isRightSide
              ? "after"
              : "child",
        });
      },
      // Add onDragOver for continuous feedback
      // onDragOver: ({ location }) => {
      //   console.log('onDragOver', location);
      //   const rect = element.getBoundingClientRect();
      //   const clientY = location.current.input.clientY;
      //   const clientX = location.current.input.clientX;

      //   if (clientY === undefined || clientX === undefined) return;

      //   const relativeY = (clientY - rect.top) / rect.height;
      //   const relativeX = (clientX - rect.left) / rect.width;

      //   const topZone = 0.25;
      //   const bottomZone = 0.75;
      //   const isRightSide = relativeX > 0.3;

      //   let newPosition: "before" | "after" | "child";

      //   if (relativeY < topZone && !isRightSide) {
      //     newPosition = "before";
      //   } else if (relativeY > bottomZone && !isRightSide) {
      //     newPosition = "after";
      //   } else {
      //     newPosition = "child";
      //   }

      //   // Only update if position actually changed to reduce re-renders
      //   if (newPosition !== dragPosition) {
      //     setDragPosition(newPosition);
      //   }
      // },
      onDragLeave: () => setDragPosition(null),
      onDrop: ({ source }) => {
        const draggedPageId = source.data.pageId as string;
        if (dragPosition && draggedPageId !== page.id) {
          console.log(
            "Dropping:",
            draggedPageId,
            "onto:",
            page.id,
            "as:",
            dragPosition
          );
          onMove(draggedPageId, page.id, dragPosition);
        }
        setDragPosition(null);
      },
    });

    return () => {
      cleanupDraggable();
      cleanupDropTarget();
    };
  }, [page.id, dragPosition, onMove]);

  const hasChildren = page.children && page.children.length > 0;
  const paddingLeft = level * 20; // Reduced padding for better nesting

  return (
    <div className="relative">
      {/* Drop indicators with better positioning */}
      {dragPosition === "before" && (
        <>
          <div
            className="absolute top-0 left-0 right-0 h-1 bg-blue-500 z-20 rounded shadow-sm"
            style={{ marginLeft: paddingLeft + 20 }}
          />
          <div className="absolute top-0 left-4 bg-blue-500 text-white text-xs px-2 py-1 rounded-b shadow-sm z-20">
            Drop before
          </div>
        </>
      )}
      {dragPosition === "after" && (
        <>
          <div
            className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 z-20 rounded shadow-sm"
            style={{ marginLeft: paddingLeft + 20 }}
          />
          <div className="absolute bottom-0 left-4 bg-blue-500 text-white text-xs px-2 py-1 rounded-t shadow-sm z-20">
            Drop after
          </div>
        </>
      )}
      {dragPosition === "child" && (
        <div className="absolute inset-1 bg-blue-50 border-2 border-blue-400 border-dashed rounded-md z-20 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium shadow-sm">
            Drop as child page
          </div>
        </div>
      )}

      <div
        ref={itemRef}
        className={`
          group flex items-center py-4 px-3 hover:bg-gray-50 cursor-move relative transition-all duration-150
          ${isDragging ? "opacity-50 z-10 scale-105" : ""}
          ${
            dragPosition === "child"
              ? "bg-blue-50 ring-2 ring-blue-400 shadow-sm"
              : ""
          }
          ${dragPosition === "before" ? "border-t-2 border-blue-500" : ""}
          ${dragPosition === "after" ? "border-b-2 border-blue-500" : ""}
          ${level > 0 ? "border-l border-gray-200 ml-4" : ""}
          rounded-sm
        `}
        style={{ paddingLeft: paddingLeft }}
      >
        {/* Tree lines for visual hierarchy */}
        {level > 0 && (
          <div
            className="absolute left-0 top-0 bottom-0 w-px bg-gray-200"
            style={{ left: paddingLeft - 10 }}
          />
        )}

        {/* Horizontal tree line */}
        {level > 0 && (
          <div
            className="absolute top-1/2 w-3 h-px bg-gray-200"
            style={{ left: paddingLeft - 10 }}
          />
        )}

        {/* Expand/Collapse button */}
        <div className="w-5 h-5 mr-1 flex items-center justify-center">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 12 12"
                >
                  <path d="M3 5l3 3 3-3H3z" />
                </svg>
              ) : (
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 12 12"
                >
                  <path d="M5 3l3 3-3 3V3z" />
                </svg>
              )}
            </button>
          ) : (
            <div className="w-4 h-4" />
          )}
        </div>

        {/* Drag handle */}
        <div className="w-4 h-4 mr-2 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-70 group-hover:opacity-100 transition-opacity">
          <svg
            className="w-3 h-3 text-gray-500"
            fill="currentColor"
            viewBox="0 0 12 12"
          >
            <circle cx="2" cy="3" r="1" />
            <circle cx="6" cy="3" r="1" />
            <circle cx="10" cy="3" r="1" />
            <circle cx="2" cy="9" r="1" />
            <circle cx="6" cy="9" r="1" />
            <circle cx="10" cy="9" r="1" />
          </svg>
        </div>

        {/* Page icon */}
        <div className="w-4 h-4 mr-3">
          {hasChildren ? (
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          )}
        </div>

        {/* Page content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {page.title}
              </h4>
              <p className="text-xs text-gray-500 truncate">{page.url}</p>
              {hasChildren && (
                <p className="text-xs text-blue-600 mt-1">
                  {page.children.length} child page
                  {page.children.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="ml-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {page.contentPageId && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Content
                </span>
              )}
              <button
                onClick={() => onEdit(page)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit page"
              >
                <svg
                  className="w-4 h-4"
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
              </button>
              <button
                onClick={() => onDelete(page.id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete page"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Render children with expand/collapse */}
      {hasChildren && isExpanded && (
        <div className="relative">
          {page.children.map((child, index) => (
            <div key={child.id} className="relative">
              {/* Vertical line for last child */}
              {level >= 0 && index === page.children.length - 1 && (
                <div
                  className="absolute top-0 w-px bg-gray-200"
                  style={{
                    left: paddingLeft + 10,
                    height: "50%",
                  }}
                />
              )}
              <SitemapTreeItem
                page={child}
                level={level + 1}
                onEdit={onEdit}
                onDelete={onDelete}
                onMove={onMove}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
