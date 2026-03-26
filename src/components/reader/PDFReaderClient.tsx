"use client";

import { useEffect, useCallback, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import Link from "next/link";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  bookSlug: string;
  bookTitle: string;
}

export default function PDFReaderClient({ bookSlug, bookTitle }: Props) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch signed download URL from our API
  useEffect(() => {
    async function fetchPdfUrl() {
      try {
        const res = await fetch(`/api/books/read/${bookSlug}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load book");
          setLoading(false);
          return;
        }

        setPdfUrl(data.url);
      } catch {
        setError("Failed to load book");
        setLoading(false);
      }
    }

    fetchPdfUrl();
  }, [bookSlug]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "s" || e.key === "c")) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [handleKeyDown, handleContextMenu]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  return (
    <div className="reader-secure min-h-screen bg-bg-warm flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-border px-4 py-3 flex items-center justify-between">
        <Link href="/library" className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Library</span>
        </Link>

        <h1 className="text-text-primary font-bold text-sm truncate max-w-xs sm:max-w-md">
          {bookTitle}
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
            className="p-1.5 rounded border border-border text-text-muted hover:text-text-primary text-sm transition-colors"
          >
            −
          </button>
          <span className="text-text-muted text-xs w-10 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale((s) => Math.min(2, s + 0.1))}
            className="p-1.5 rounded border border-border text-text-muted hover:text-text-primary text-sm transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* PDF */}
      <div className="flex-1 overflow-auto flex justify-center py-8 px-4">
        {loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-border border-t-brand-orange" />
          </div>
        )}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-600 text-base mb-1">{error}</p>
            <p className="text-text-muted text-sm">Please try again later.</p>
          </div>
        )}
        {pdfUrl && (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-border border-t-brand-orange" />
              </div>
            }
            error={
              <div className="text-center py-20">
                <p className="text-red-600 text-base mb-1">Failed to load PDF</p>
                <p className="text-text-muted text-sm">Please try again later.</p>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="shadow-lg rounded-sm"
            />
          </Document>
        )}
      </div>

      {/* Bottom nav */}
      <div className="sticky bottom-0 bg-white border-t border-border px-4 py-3 flex items-center justify-center gap-4">
        <button
          onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
          disabled={pageNumber <= 1}
          className="btn-outline text-sm !py-1.5 !px-4 disabled:opacity-30"
        >
          ← Prev
        </button>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={pageNumber}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (val >= 1 && val <= numPages) setPageNumber(val);
            }}
            className="w-12 text-center bg-bg-accent text-text-primary rounded px-2 py-1 text-sm border border-border"
            min={1}
            max={numPages}
          />
          <span className="text-text-muted text-sm">of {numPages}</span>
        </div>
        <button
          onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
          disabled={pageNumber >= numPages}
          className="btn-outline text-sm !py-1.5 !px-4 disabled:opacity-30"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
