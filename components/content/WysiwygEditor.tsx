"use client";

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";

// EditorJS types and imports
interface EditorJSBlock {
  id?: string;
  type: string;
  data: any;
}

interface EditorJSData {
  time?: number;
  blocks: EditorJSBlock[];
  version?: string;
}

export interface WysiwygEditorRef {
  save: () => Promise<{ editorData: EditorJSData; html: string }>;
  clear: () => void;
}

interface WysiwygEditorProps {
  initialData?: EditorJSData;
  onChange?: (data: EditorJSData) => void;
  placeholder?: string;
}

const WysiwygEditor = forwardRef<WysiwygEditorRef, WysiwygEditorProps>(
  (
    { initialData, onChange, placeholder = "Start writing your content..." },
    ref
  ) => {
    const editorRef = useRef<any>(null);
    const holderRef = useRef<HTMLDivElement>(null);
    const [isEditorReady, setIsEditorReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useImperativeHandle(ref, () => ({
      save: async () => {
        if (!editorRef.current || !isEditorReady) {
          return { editorData: { blocks: [] }, html: "" };
        }

        try {
          const savedData = await editorRef.current.save();
          const html = await convertToHTML(savedData);
          return { editorData: savedData, html };
        } catch (error) {
          console.error("Error saving editor data:", error);
          return { editorData: { blocks: [] }, html: "" };
        }
      },
      clear: () => {
        if (editorRef.current && isEditorReady) {
          editorRef.current.clear();
        }
      },
    }));

    useEffect(() => {
      let isMounted = true;

      const initEditor = async () => {
        try {
          setIsLoading(true);

          // Dynamic imports for EditorJS and plugins
          const [
            { default: EditorJS },
            { default: Header },
            { default: List },
            { default: Paragraph },
            { default: Quote },
            { default: Code },
            { default: Delimiter },
            { default: Table },
          ] = await Promise.all([
            import("@editorjs/editorjs"),
            import("@editorjs/header"),
            import("@editorjs/list"),
            import("@editorjs/paragraph"),
            import("@editorjs/quote"),
            import("@editorjs/code"),
            import("@editorjs/delimiter"),
            import("@editorjs/table"),
          ]);

          if (!isMounted || !holderRef.current) return;

          editorRef.current = new EditorJS({
            holder: holderRef.current,
            placeholder,
            data: initialData || { blocks: [] },
            tools: {
              header: {
                class: Header as any,
                config: {
                  placeholder: "Enter a header",
                  levels: [1, 2, 3, 4, 5, 6],
                  defaultLevel: 2,
                },
              },
              paragraph: {
                class: Paragraph as any,
                inlineToolbar: true,
              },
              list: {
                class: List as any,
                inlineToolbar: true,
                config: {
                  defaultStyle: "unordered",
                },
              },
              quote: {
                class: Quote as any,
                inlineToolbar: true,
                shortcut: "CMD+SHIFT+O",
                config: {
                  quotePlaceholder: "Enter a quote",
                  captionPlaceholder: "Quote's author",
                },
              },
              code: {
                class: Code as any,
                shortcut: "CMD+SHIFT+C",
              },
              delimiter: Delimiter as any,
              table: {
                class: Table as any,
                inlineToolbar: true,
                config: {
                  rows: 2,
                  cols: 3,
                },
              },
            },
            onChange: async () => {
              if (onChange && editorRef.current && isEditorReady) {
                try {
                  const data = await editorRef.current.save();
                  onChange(data);
                } catch (error) {
                  console.error("Error in onChange:", error);
                }
              }
            },
            onReady: () => {
              if (isMounted) {
                setIsEditorReady(true);
                setIsLoading(false);
              }
            },
          });
        } catch (error) {
          console.error("Error initializing editor:", error);
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

      initEditor();

      // Cleanup
      return () => {
        isMounted = false;
        if (
          editorRef.current &&
          typeof editorRef.current.destroy === "function"
        ) {
          try {
            editorRef.current.destroy();
          } catch (error) {
            console.error("Error destroying editor:", error);
          }
          editorRef.current = null;
        }
        setIsEditorReady(false);
      };
    }, []);

    // Convert EditorJS data to HTML
    const convertToHTML = async (data: EditorJSData): Promise<string> => {
      try {
        // Simple HTML conversion without external library for now
        let html = "";

        data.blocks.forEach((block) => {
          switch (block.type) {
            case "header":
              html += `<h${block.data.level || 2}>${block.data.text || ""}</h${
                block.data.level || 2
              }>`;
              break;
            case "paragraph":
              html += `<p>${block.data.text || ""}</p>`;
              break;
            case "list":
              // Fix list item processing to handle both string and object formats
              const listItems = (block.data.items || [])
                .map((item: any) => {
                  // Handle both string items and object items
                  let itemText = "";
                  if (typeof item === "string") {
                    itemText = item;
                  } else if (item && typeof item === "object") {
                    // EditorJS sometimes stores list items as objects with content/text property
                    itemText =
                      item.content || item.text || item.value || String(item);
                  } else {
                    itemText = String(item || "");
                  }
                  return `<li>${itemText}</li>`;
                })
                .join("");
              html +=
                block.data.style === "ordered"
                  ? `<ol>${listItems}</ol>`
                  : `<ul>${listItems}</ul>`;
              break;
            case "quote":
              html += `<blockquote><p>${block.data.text || ""}</p>${
                block.data.caption ? `<cite>${block.data.caption}</cite>` : ""
              }</blockquote>`;
              break;
            case "code":
              html += `<pre><code>${block.data.code || ""}</code></pre>`;
              break;
            case "delimiter":
              html += "<hr>";
              break;
            case "table":
              if (block.data.content && Array.isArray(block.data.content)) {
                const rows = block.data.content
                  .map((row: string[]) => {
                    const cells = row
                      .map((cell) => `<td>${cell || ""}</td>`)
                      .join("");
                    return `<tr>${cells}</tr>`;
                  })
                  .join("");
                html += `<table><tbody>${rows}</tbody></table>`;
              }
              break;
            default:
              // Handle unknown block types gracefully
              if (block.data.text) {
                html += `<p>${block.data.text}</p>`;
              }
          }
        });

        return html;
      } catch (error) {
        console.error("Error converting to HTML:", error);
        return "";
      }
    };

    return (
      <div className="min-h-[400px] border border-gray-300 rounded-md relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading editor...</p>
            </div>
          </div>
        )}
        <div
          ref={holderRef}
          className="prose max-w-none p-4"
          style={{ minHeight: "400px" }}
        />
      </div>
    );
  }
);

WysiwygEditor.displayName = "WysiwygEditor";

export default WysiwygEditor;
