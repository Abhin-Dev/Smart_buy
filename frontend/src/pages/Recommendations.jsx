/**
 * SmartBuy — Recommendations Page
 * Groww-styled association rules with green accents.
 */
import React, { useEffect, useState } from 'react';
import { getRecommendations } from '../api';
import {
    ShoppingBag, Search, ArrowRight, TrendingUp,
    Sparkles, RefreshCw,
} from 'lucide-react';

export default function Recommendations() {
    const [customerId, setCustomerId] = useState('');
    const [searchId, setSearchId] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async (cid = null) => {
        setLoading(true);
        try {
            const res = await getRecommendations(cid);
            setData(res.data);
        } catch (err) {
            console.error('Failed to load recommendations:', err);
        }
        setLoading(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchId(customerId);
        loadData(customerId || null);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Product Recommendations</h1>
                <p className="text-gray-500 mt-1 text-sm">
                    Association rules powered by the Apriori algorithm
                </p>
            </div>

            {/* Customer search */}
            <div className="glass-card p-5">
                <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                    <Search size={14} className="text-groww-green" />
                    Personalise Recommendations
                </h3>
                <form onSubmit={handleSearch} className="flex gap-3">
                    <input
                        id="customer-search"
                        type="text"
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                        placeholder="Enter Customer ID (e.g. CUST001)"
                        className="flex-1 px-4 py-2.5 bg-surface-700 border border-surface-300 rounded-lg
                       text-white placeholder-gray-600 focus:outline-none focus:border-groww-green/50
                       focus:ring-2 focus:ring-groww-green/20 transition-all text-sm"
                    />
                    <button
                        type="submit"
                        className="px-5 py-2.5 btn-primary rounded-lg text-sm flex items-center gap-2"
                    >
                        <Search size={14} /> Search
                    </button>
                    {searchId && (
                        <button
                            type="button"
                            onClick={() => { setCustomerId(''); setSearchId(''); loadData(null); }}
                            className="px-4 py-2.5 glass-card text-sm text-gray-400 hover:text-white transition-all"
                        >
                            Clear
                        </button>
                    )}
                </form>
                {data?.cluster_label != null && (
                    <p className="mt-3 text-sm text-groww-green">
                        <Sparkles size={14} className="inline mr-1" />
                        Customer belongs to <span className="font-semibold">
                            {['At Risk', 'Loyal', 'Big Spenders', 'New Customers'][data.cluster_label] || `Cluster ${data.cluster_label}`}
                        </span> segment — recommendations are personalised.
                    </p>
                )}
            </div>

            {/* Trending products */}
            <div className="glass-card p-5">
                <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-groww-green" />
                    Trending Products
                </h3>
                <div className="flex flex-wrap gap-2">
                    {data?.trending_products?.map((product, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg bg-groww-green/10
                                     border border-groww-green/20 text-sm text-groww-green font-medium
                                     flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-groww-green/20 flex items-center justify-center
                               text-[10px] font-bold text-groww-green-light">
                                {i + 1}
                            </span>
                            {product}
                        </span>
                    )) || (
                            <p className="text-gray-500 text-sm">No data available.</p>
                        )}
                </div>
            </div>

            {/* Association Rules table */}
            <div className="glass-card overflow-hidden">
                <div className="p-5 border-b border-surface-300">
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                        <ShoppingBag size={18} className="text-groww-blue" />
                        Association Rules — "Bought Together"
                    </h3>
                </div>
                {!data?.recommendations?.length ? (
                    <p className="p-5 text-gray-500 text-sm">
                        No association rules found. Upload more data to generate recommendations.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-surface-300">
                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">If Customer Buys</th>
                                    <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase" />
                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">They May Also Buy</th>
                                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Confidence</th>
                                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Lift</th>
                                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Support</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recommendations.map((rule, i) => (
                                    <tr key={i} className="border-b border-surface-300/50 table-row-hover transition-colors">
                                        <td className="px-5 py-3">
                                            <span className="px-2.5 py-1 rounded-md badge-green text-xs font-medium">
                                                {rule.antecedent}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <ArrowRight size={14} className="text-gray-600 mx-auto" />
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="px-2.5 py-1 rounded-md badge-blue text-xs font-medium">
                                                {rule.consequent}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right text-gray-300 font-mono">
                                            {(rule.confidence * 100).toFixed(1)}%
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <span className={`font-mono font-semibold
                                              ${rule.lift >= 2 ? 'text-groww-green' :
                                                    rule.lift >= 1.5 ? 'text-groww-blue' : 'text-gray-300'}`}>
                                                {rule.lift.toFixed(2)}×
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right text-gray-500 font-mono">
                                            {(rule.support * 100).toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
