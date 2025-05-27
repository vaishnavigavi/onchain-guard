"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { NavBar } from "../../../components/NavBar";

// Chart imports
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

type AnomalyRecord = {
  timestamp: string;
  anomaly_score: number;
};

interface AnomalyResponse {
  wallet: string;
  anomaly_score: number;
  net_token_flow: number;
  send_recv_ratio: number;
}

interface Transfer {
  tx_hash: string;
  block_number: number;
  token_symbol: string;
  from_addr: string;
  to_addr: string;
  value: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function WalletDetail() {
  const params = useParams();
  const address = params?.address;

  // Fetch current anomaly data
  const { data: anomaly, error: anomalyError } = useSWR<AnomalyResponse>(
    address ? `/api/anomaly/${address}` : null,
    fetcher
  );

  // Fetch anomaly history for time-series
  const { data: history } = useSWR<AnomalyRecord[]>(
    address ? `/api/anomaly-history/${address}` : null,
    fetcher
  );

  // Fetch recent token transfers
  const { data: transfers, error: transfersError } = useSWR<Transfer[]>(
    address ? `/api/transfers/${address}?limit=20` : null,
    fetcher
  );

  if (!address) {
    return <div className="p-6">No wallet address specified.</div>;
  }
  if (anomalyError) {
    return <div className="p-6 text-red-500">Failed to load wallet data.</div>;
  }
  if (!anomaly) {
    return <div className="p-6">Loading wallet details…</div>;
  }

  const txList = Array.isArray(transfers) ? transfers : [];

  return (
    <>
      <NavBar />
      <main className="p-6 space-y-8">
        <section>
          <h1 className="text-2xl font-bold mb-4">Wallet Detail</h1>
          <h2 className="text-lg font-mono mb-6 break-all">{anomaly.wallet}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 border rounded shadow">
              <h3 className="font-semibold">Anomaly Score</h3>
              <p className="text-xl">{anomaly.anomaly_score.toFixed(3)}</p>
            </div>
            <div className="p-4 border rounded shadow">
              <h3 className="font-semibold">Net Token Flow</h3>
              <p className="text-xl">{anomaly.net_token_flow.toLocaleString()}</p>
            </div>
            <div className="p-4 border rounded shadow">
              <h3 className="font-semibold">Send/Recv Ratio</h3>
              <p className="text-xl">{anomaly.send_recv_ratio.toFixed(2)}</p>
            </div>
          </div>
        </section>

        {/* Anomaly Score Over Time */}
        {history && history.length > 0 && (
          <section>
            <h3 className="text-xl font-semibold mb-2">Anomaly Score Over Time</h3>
            <div className="w-full h-64">
              <ResponsiveContainer>
                <LineChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" tickFormatter={(ts) => new Date(ts).toLocaleDateString()} />
                  <YAxis domain={[0, 'auto']} />
                  <Tooltip labelFormatter={(ts) => new Date(ts).toLocaleString()} />
                  <Line type="monotone" dataKey="anomaly_score" stroke="#8884d8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Recent Transfers */}
        <section>
          <h3 className="text-xl font-semibold mb-2">Recent Transfers</h3>
          {transfersError && <p className="text-red-500">Failed to load transfers.</p>}
          {!transfers && <p>Loading transfers…</p>}
          {transfers && txList.length === 0 && (
            <p className="text-gray-500">No transfers found for this wallet.</p>
          )}
          {txList.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Block</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Token</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">From</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">To</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Value</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {txList.map(tx => (
                    <tr key={tx.tx_hash} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">{tx.block_number}</td>
                      <td className="px-4 py-2 text-sm">{tx.token_symbol}</td>
                      <td className="px-4 py-2 text-sm break-all">{tx.from_addr}</td>
                      <td className="px-4 py-2 text-sm break-all">{tx.to_addr}</td>
                      <td className="px-4 py-2 text-sm text-right">{tx.value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
