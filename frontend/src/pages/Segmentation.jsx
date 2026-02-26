/**
 * SmartBuy — Customer Segmentation Page
 * Groww-style dark cards, colored badges, and clean tables.
 */
import React, { useEffect, useState } from 'react';
import { getClusters } from '../api';
import { ClusterPie, ClusterScatter } from '../components/ClusterChart';
import { Users, RefreshCw } from 'lucide-react';

const CLUSTER_LABELS = ['At Risk', 'Loyal', 'Big Spenders', 'New Customers'];
const CLUSTER_BADGES = ['badge-red', 'badge-green', 'badge-blue', 'badge-gray'];
const CLUSTER_DOTS = ['bg-groww-red', 'bg-groww-green', 'bg-groww-blue', 'bg-groww-orange'];

export default function Segmentation() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getClusters();
            setData(res.data);
        } catch (err) {
            console.error('Failed to load clusters:', err);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Customer Segmentation</h1>
                    <p className="text-gray-500 mt-1 text-sm">K-Means clustering based on RFM analysis</p>
                </div>
                <button
                    onClick={loadData}
                    className="px-4 py-2 glass-card flex items-center gap-2 text-sm text-gray-400
                     hover:text-white hover:border-surface-300 transition-all"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {!data || data.total_customers === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Users size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-500">No segmentation data. Upload a dataset first.</p>
                </div>
            ) : (
                <>
                    {/* Summary cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {data.clusters.map((c) => (
                            <div key={c.cluster_label} className="glass-card p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-2.5 h-2.5 rounded-full ${CLUSTER_DOTS[c.cluster_label] || 'bg-gray-500'}`} />
                                    <h4 className="text-sm font-semibold text-white">
                                        {CLUSTER_LABELS[c.cluster_label] || `Cluster ${c.cluster_label}`}
                                    </h4>
                                </div>
                                <p className="text-2xl font-bold text-white">{c.count}</p>
                                <div className="mt-2 space-y-1 text-xs text-gray-500">
                                    <p>Avg Recency: {c.avg_recency} days</p>
                                    <p>Avg Frequency: {c.avg_frequency}</p>
                                    <p>Avg Monetary: ${c.avg_monetary}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ClusterPie data={data.clusters} />
                        <ClusterScatter customers={data.customers} />
                    </div>

                    {/* Customer Table */}
                    <div className="glass-card overflow-hidden">
                        <div className="p-5 border-b border-surface-300">
                            <h3 className="text-base font-semibold text-white">Customer Details</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-surface-300">
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer ID</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Segment</th>
                                        <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Recency</th>
                                        <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Frequency</th>
                                        <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monetary</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.customers.map((c, i) => (
                                        <tr key={i} className="border-b border-surface-300/50 table-row-hover transition-colors">
                                            <td className="px-5 py-3 text-gray-300 font-mono text-xs">{c.customer_id}</td>
                                            <td className="px-5 py-3">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
                                                    ${CLUSTER_BADGES[c.cluster_label] || 'badge-gray'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full
                                                        ${CLUSTER_DOTS[c.cluster_label] || 'bg-gray-500'}`} />
                                                    {CLUSTER_LABELS[c.cluster_label] || `Cluster ${c.cluster_label}`}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right text-gray-300">{c.recency} days</td>
                                            <td className="px-5 py-3 text-right text-gray-300">{c.frequency}</td>
                                            <td className="px-5 py-3 text-right text-gray-300">${c.monetary.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
