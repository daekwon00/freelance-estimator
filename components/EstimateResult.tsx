"use client";

export function EstimateResult({ markdown }: { markdown: string }) {
  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `견적서_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">📄 견적서</h2>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          .md 다운로드
        </button>
      </div>
      <pre className="bg-gray-50 p-6 rounded-lg whitespace-pre-wrap text-sm">
        {markdown}
      </pre>
    </div>
  );
}
