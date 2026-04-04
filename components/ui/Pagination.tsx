import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("…");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    )
      pages.push(i);
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 py-6">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2.5 rounded-xl bg-white border border-gray-200 disabled:opacity-30 cursor-pointer shadow-xs hover:bg-gray-50 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-gray-600" />
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="w-9 text-center text-xs font-black text-gray-300 select-none"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer ${
              p === currentPage
                ? "bg-blue-600 text-white shadow-md scale-110"
                : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 shadow-xs"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2.5 rounded-xl bg-white border border-gray-200 disabled:opacity-30 cursor-pointer shadow-xs hover:bg-gray-50 transition-colors"
      >
        <ChevronRight className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
};
