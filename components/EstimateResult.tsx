"use client";

import ReactMarkdown from "react-markdown";

interface EstimateResultProps {
  markdown: string;
  title: string;
  streaming?: boolean;
}

export function EstimateResult({ markdown, title, streaming }: EstimateResultProps) {
  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `견적서_${new Date().toISOString().slice(0, 10)}_${title}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">📄 견적서</h2>
        {!streaming && (
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            .md 다운로드
          </button>
        )}
      </div>
      <div className="prose prose-sm max-w-none bg-gray-50 dark:bg-gray-800 dark:prose-invert p-6 rounded-lg">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}
