"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";
import { saveAs } from "file-saver";

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Anomaly {
  wallet: string;
  anomaly_score: number;
  net_token_flow: number;
  send_recv_ratio: number;
}

export default function AnomaliesPage() {
  const [topN, setTopN] = useState(50);
  const [query, setQuery] = useState("");

  // 1) fetch the data
  const { data = [], error } = useSWR<Anomaly[]>(
    `/api/anomalies?top_n=${topN}`,
    fetcher
  );

  // 2) apply text-filter on wallet
  const filtered = useMemo(() => {
    return data.filter(w =>
      w.wallet.toLowerCase().includes(query.toLowerCase())
    );
  }, [data, query]);

  if (error) return <div className="p-4 text-red-500">Failed to load anomalies.</div>;
  if (!data)  return <div className="p-4">Loading…</div>;

  // 3) CSV export of the *filtered* rows
  const exportCSV = () => {
    const header = ["wallet","anomaly_score","net_token_flow","send_recv_ratio"];
    const rows = filtered.map(w => [
      w.wallet,
      w.anomaly_score.toFixed(6),
      w.net_token_flow,
      w.send_recv_ratio.toFixed(6),
    ]);
    const csv = [header, ...rows]
      .map(r => r.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `anomalies_top${topN}.csv`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Top {topN} Suspicious Wallets</h1>

      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <label htmlFor="topN">Show Top:</label>
        <input
          id="topN"
          type="number"
          value={topN}
          min={10}
          max={500}
          step={10}
          onChange={e => setTopN(Number(e.target.value))}
          className="border rounded px-2 py-1 w-20"
        />

        <input
          type="text"
          placeholder="Filter by address…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="border rounded px-2 py-1 flex-1 min-w-[200px]"
        />

        <button
          onClick={exportCSV}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Wallet</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Score</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Net Flow</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Send/Recv Ratio</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map(w => (
              <tr key={w.wallet} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm">
                  <Link
                    href={`/wallet/${w.wallet}`}
                    className="text-blue-600 hover:underline"
                  >
                    {w.wallet}
                  </Link>
                </td>
                <td className="px-4 py-2 text-sm text-right">
                  {w.anomaly_score.toFixed(3)}
                </td>
                <td className="px-4 py-2 text-sm text-right">
                  {w.net_token_flow.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-sm text-right">
                  {w.send_recv_ratio.toFixed(2)}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  No wallets match “{query}”
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
