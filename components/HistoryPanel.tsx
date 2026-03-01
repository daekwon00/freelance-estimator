"use client";

import { useState, useEffect } from "react";
import { EstimateHistoryItem } from "@/types/estimate";
import { getHistory, deleteHistory, clearHistory } from "@/lib/history";

interface HistoryPanelProps {
  onLoad: (item: EstimateHistoryItem) => void;
  refreshKey: number;
}

export function HistoryPanel({ onLoad, refreshKey }: HistoryPanelProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<EstimateHistoryItem[]>([]);

  useEffect(() => {
    setItems(getHistory());
  }, [refreshKey]);

  const handleDelete = (id: string) => {
    deleteHistory(id);
    setItems(getHistory());
  };

  const handleClearAll = () => {
    if (!confirm("모든 히스토리를 삭제하시겠습니까?")) return;
    clearHistory();
    setItems([]);
  };

  if (items.length === 0) return null;

  return (
    <div className="mt-6 border border-gray-200 dark:border-gray-700 rounded-lg">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-3 text-left text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
      >
        <span>과거 견적 ({items.length})</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <button
                  onClick={() => onLoad(item)}
                  className="flex-1 text-left hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <span className="font-medium">{item.title}</span>
                  <span className="ml-2 text-gray-400 text-xs">
                    {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="ml-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                  title="삭제"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleClearAll}
              className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400"
            >
              전체 삭제
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
