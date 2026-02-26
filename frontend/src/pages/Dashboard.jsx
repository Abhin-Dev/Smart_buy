/**
 * SmartBuy — Dashboard Page
 * Groww-inspired two-column layout with product cards, analytics summary,
 * trend table with tabs, and quick links.
 */
import React, { useEffect, useState } from 'react';
import { getTrends, getClusters, getRecommendations } from '../api';
import TrendChart from '../components/TrendChart';
import { ClusterPie } from '../components/ClusterChart';
import {
    Users, TrendingUp, ShoppingBag, Activity,
    ArrowUpRight, ArrowDownRight, Sparkles, ChevronRight,
    BarChart3, Upload, Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard({ user }) {
    const [trends, setTrends] = useState(null);
    const [clusters, setClusters] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('gainers');

    const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [trendRes, clusterRes, recRes] = await Promise.all([
                getTrends('7d').catch(() => null),
                getClusters().catch(() => null),
                getRecommendations().catch(() => null),
            ]);
            setTrends(trendRes?.data);
            setClusters(clusterRes?.data);
            setRecommendations(recRes?.data);
        } catch (err) {
            console.error('Dashboard load error:', err);
        }
        setLoading(false);
    };

    // Filtered trends by tab
    const trendItems = trends?.items || [];
    const gainers = trendItems.filter(t => t.trend === 'trend_up');
    const losers = trendItems.filter(t => t.trend === 'trend_down');
    const newTrends = trendItems.filter(t => t.trend === 'new_trend');

    const tabData = {
        gainers: gainers,
        losers: losers,
        new: newTrends,
    };

    // Top trending products for the card grid
    const topProducts = recommendations?.trending_products?.slice(0, 4) || [];

    // Quick links
    const quickLinks = [
        { label: 'Upload Dataset', icon: Upload, to: '/upload', badge: null },
        { label: 'Segmentation', icon: Users, to: '/segmentation', badge: clusters?.num_clusters ? `${clusters.num_clusters} segments` : null },
        { label: 'Drift Analysis', icon: Activity, to: '/drift', badge: null },
        { label: 'Recommendations', icon: ShoppingBag, to: '/recommendations', badge: recommendations?.recommendations?.length ? `${recommendations.recommendations.length} rules` : null },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ═══ LEFT COLUMN (2/3) ═══ */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Top Trending Products — card grid */}
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-4">
                            Top trending products on SmartBuy
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {topProducts.length > 0 ? topProducts.map((product, i) => {
                                const matchingTrend = trendItems.find(t => t.product === product);
                                return (
                                    <div key={i} className="glass-card p-4 hover:border-surface-300 transition-colors cursor-default">
                                        <div className="w-10 h-10 rounded-lg bg-surface-500 flex items-center justify-center mb-3">
                                            <ShoppingBag size={18} className="text-gray-400" />
                                        </div>
                                        <p className="text-sm font-medium text-white truncate mb-2">{product}</p>
                                        {matchingTrend ? (
                                            <>
                                                <p className="text-sm text-white font-semibold">
                                                    {matchingTrend.current_count} purchases
                                                </p>
                                                <p className={`text-xs font-medium ${matchingTrend.change_pct >= 0 ? 'text-groww-green' : 'text-groww-red'}`}>
                                                    {matchingTrend.change_pct >= 0 ? '+' : ''}{matchingTrend.change_pct}%
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-xs text-gray-500">—</p>
                                        )}
                                    </div>
                                );
                            }) : (
                                [1, 2, 3, 4].map(i => (
                                    <div key={i} className="glass-card p-4 animate-pulse">
                                        <div className="w-10 h-10 rounded-lg bg-surface-500 mb-3" />
                                        <div className="h-3 bg-surface-500 rounded w-3/4 mb-2" />
                                        <div className="h-3 bg-surface-500 rounded w-1/2" />
                                    </div>
                                ))
                            )}
                        </div>
                        <Link to="/recommendations" className="inline-flex items-center gap-1 text-groww-green text-sm font-medium mt-3 hover:underline">
                            See more <ChevronRight size={14} />
                        </Link>
                    </div>

                    {/* Top Movers Table with Tabs */}
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-4">Top movers today</h2>

                        {/* Tabs */}
                        <div className="flex gap-2 mb-4">
                            {[
                                { key: 'gainers', label: 'Gainers' },
                                { key: 'losers', label: 'Losers' },
                                { key: 'new', label: 'New Trends' },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all
                                        ${activeTab === tab.key
                                            ? 'bg-surface-500 border-surface-300 text-white'
                                            : 'bg-transparent border-surface-300 text-gray-400 hover:text-white hover:border-gray-500'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Table */}
                        <div className="glass-card overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-surface-300">
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                        <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current</th>
                                        <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Change</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(tabData[activeTab] || []).slice(0, 8).map((item, i) => (
                                        <tr key={i} className="border-b border-surface-300/50 table-row-hover transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-surface-500 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xs font-bold text-gray-400">{item.product?.slice(0, 2).toUpperCase()}</span>
                                                    </div>
                                                    <span className="text-white font-medium">{item.product}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-right text-white">{item.current_count}</td>
                                            <td className="px-5 py-3.5 text-right">
                                                <span className={`font-medium ${item.change_pct >= 0 ? 'text-groww-green' : 'text-groww-red'}`}>
                                                    {item.change_pct >= 0 ? '+' : ''}{item.change_pct}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {(tabData[activeTab] || []).length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-5 py-8 text-center text-gray-500">
                                                No data available. Upload a dataset to begin.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ═══ RIGHT COLUMN (1/3) ═══ */}
                <div className="space-y-6">
                    {/* Your Analytics — summary panel */}
                    <div className="glass-card p-5">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Your analytics</h3>
                        <p className="text-3xl font-bold text-white mb-4">
                            {clusters?.total_customers?.toLocaleString() || '0'}
                            <span className="text-sm font-normal text-gray-500 ml-2">customers</span>
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-surface-300/50">
                                <span className="text-sm text-gray-400">Segments</span>
                                <span className="text-sm font-medium text-white">{clusters?.num_clusters || 0}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-surface-300/50">
                                <span className="text-sm text-gray-400">Trending Up</span>
                                <span className="text-sm font-medium text-groww-green">
                                    +{gainers.length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-surface-300/50">
                                <span className="text-sm text-gray-400">Trending Down</span>
                                <span className="text-sm font-medium text-groww-red">
                                    -{losers.length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-gray-400">Association Rules</span>
                                <span className="text-sm font-medium text-white">
                                    {recommendations?.recommendations?.length || 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links — Products & Tools style */}
                    <div className="glass-card p-5">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Products & Tools</h3>
                        <div className="space-y-1">
                            {quickLinks.map((link, i) => (
                                <Link
                                    key={i}
                                    to={link.to}
                                    className="flex items-center justify-between py-3 px-2 rounded-lg
                                             hover:bg-surface-500 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-surface-500 group-hover:bg-surface-400
                                                      flex items-center justify-center transition-colors">
                                            <link.icon size={18} className="text-gray-400" />
                                        </div>
                                        <span className="text-sm font-medium text-white">{link.label}</span>
                                    </div>
                                    {link.badge && (
                                        <span className="text-xs font-medium badge-green px-2 py-1 rounded-md">
                                            {link.badge}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <TrendChart data={trendItems} title="Product Purchase Trends (7-day)" />
                </div>
                <div>
                    <ClusterPie data={clusters?.clusters || []} />
                </div>
            </div>

            {/* Loading overlay */}
            {loading && (
                <div className="fixed inset-0 bg-surface-900/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="glass-card p-8 flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-3 border-groww-green/30 border-t-groww-green rounded-full animate-spin" />
                        <p className="text-gray-400 text-sm">Loading dashboard...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
