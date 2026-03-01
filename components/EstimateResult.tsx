"use client";

import ReactMarkdown from "react-markdown";
import { AgentName, AGENT_LABELS, SECTION_KEYWORDS } from "@/types/estimate";

interface Section {
  title: string;
  content: string;
  agentName: AgentName | null;
}

function matchAgent(title: string): AgentName | null {
  const lower = title.toLowerCase();
  for (const [keyword, agent] of Object.entries(SECTION_KEYWORDS)) {
    if (lower.includes(keyword)) return agent;
  }
  return null;
}

function parseSections(markdown: string): Section[] {
  const parts = markdown.split(/^(?=## )/m);
  return parts.filter((p) => p.trim()).map((part) => {
    const match = part.match(/^## (.+)\n([\s\S]*)$/);
    if (match) {
      return {
        title: match[1].trim(),
        content: match[2].trim(),
        agentName: matchAgent(match[1].trim()),
      };
    }
    return { title: "", content: part.trim(), agentName: null };
  });
}

interface EstimateResultProps {
  markdown: string;
  title: string;
  streaming?: boolean;
  onRegenerate?: (agentName: AgentName) => void;
  regeneratingSection?: AgentName | null;
}

export function EstimateResult({
  markdown,
  title,
  streaming,
  onRegenerate,
  regeneratingSection,
}: EstimateResultProps) {
  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `견적서_${new Date().toISOString().slice(0, 10)}_${title}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePdf = () => {
    const content = document.getElementById("estimate-content");
    if (!content) return;

    const clone = content.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("[data-no-print]").forEach((el) => el.remove());

    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>견적서 - ${title}</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1a1a1a; line-height: 1.6; }
h1 { font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 8px; }
h2 { font-size: 20px; margin-top: 24px; color: #333; }
h3 { font-size: 16px; }
table { width: 100%; border-collapse: collapse; margin: 16px 0; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
th { background: #f5f5f5; }
ul, ol { padding-left: 24px; }
code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-size: 14px; }
pre { background: #f5f5f5; padding: 16px; border-radius: 4px; overflow-x: auto; }
blockquote { border-left: 4px solid #ddd; margin: 16px 0; padding: 8px 16px; color: #666; }
@media print { body { padding: 0; } }
</style></head>
<body>${clone.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.onload = () => printWindow.print();
  };

  const sections = !streaming ? parseSections(markdown) : null;

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">📄 견적서</h2>
        {!streaming && (
          <div className="flex gap-2">
            <button
              onClick={handlePdf}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-sm"
            >
              PDF 인쇄
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-sm"
            >
              .md 다운로드
            </button>
          </div>
        )}
      </div>

      <div
        id="estimate-content"
        className="prose prose-sm max-w-none bg-gray-50 dark:bg-gray-800 dark:prose-invert p-6 rounded-lg"
      >
        {streaming || !sections ? (
          <ReactMarkdown>{markdown}</ReactMarkdown>
        ) : (
          sections.map((section, i) => (
            <div key={i} className="relative group">
              {section.agentName && onRegenerate && (
                <button
                  data-no-print
                  onClick={() => onRegenerate(section.agentName!)}
                  disabled={!!regeneratingSection}
                  className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
                  title={`${AGENT_LABELS[section.agentName]} 재생성`}
                >
                  {regeneratingSection === section.agentName ? "⏳" : "🔄"}
                </button>
              )}
              {regeneratingSection === section.agentName ? (
                <div className="animate-pulse py-4">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  </div>
                </div>
              ) : (
                <ReactMarkdown>
                  {section.title
                    ? `## ${section.title}\n${section.content}`
                    : section.content}
                </ReactMarkdown>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
