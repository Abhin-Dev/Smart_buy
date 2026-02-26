/**
 * SmartBuy — Behaviour Drift Analysis Page
 * Groww-styled with green/red accents, rounded pill tabs, and clean table.
 */
import React, { useEffect, useState } from 'react';
import { getTrends, getDriftReport } from '../api';
import TrendChart from '../components/TrendChart';
import {
    Activity, ArrowUpRight, ArrowDownRight,
    Sparkles, Minus, RefreshCw, Clock,
} from 'lucide-react';

const WINDOWS = [
    { key: '1h', label: 'Last 1 Hour' },
    { key: '24h', label: 'Last 24 Hours' },
    { key: '7d', label: 'Last 7 Days' },
];

const trendConfig = {
    trend_up: { icon: ArrowUpRight, color: 'text-groww-green', bg: 'badge-green', label: 'Trending Up' },
    trend_down: { icon: ArrowDownRight, color: 'text-groww-red', bg: 'badge-red', label: 'Trending Down' },
    new_trend: { icon: Sparkles, color: 'text-groww-blue', bg: 'badge-blue', label: 'New Trend' },
    stable: { icon: Minus, color: 'text-gray-400', bg: 'badge-gray', label: 'Stable' },
};

export default function DriftAnalysis() {
    const [activeWindow, setActiveWindow] = useState('7d');
    const [trends, setTrends] = useState(null);
    const [fullReport, setFullReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadTrends(); }, [activeWindow]);
    useEffect(() => { loadFullReport(); }, []);

    const loadTrends = async () => {
        setLoading(true);
        try {
            const res = await getTrends(activeWindow);
            setTrends(res.data);
        } catch (err) {
            console.error('Failed to load trends:', err);
        }
        setLoading(false);
    };

    const loadFullReport = async () => {
        try {
            const res = await getDriftReport();
            setFullReport(res.data);
        } catch (err) {
            console.error('Failed to load drift report:', err);
        }
    };

    const summary = {
        trend_up: trends?.items?.filter(t => t.trend === 'trend_up').length || 0,
        trend_down: trends?.items?.filter(t => t.trend === 'trend_down').length || 0,
        new_trend: trends?.items?.filter(t => t.trend === 'new_trend').length || 0,
        stable: trends?.items?.filter(t => t.trend === 'stable').length || 0,
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Behaviour Drift Analysis</h1>
                    <p className="text-gray-500 mt-1 text-sm">Detect changing purchase patterns over time</p>
                </div>
                <button
                    onClick={loadTrends}
                    className="px-4 py-2 glass-card flex items-center gap-2 text-sm text-gray-400
                     hover:text-white transition-all"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* Window selector — pill buttons */}
            <div className="flex gap-2">
                {WINDOWS.map(w => (
                    <button
                        key={w.key}
                        onClick={() => setActiveWindow(w.key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-2
                            ${activeWindow === w.key
                                ? 'bg-groww-green border-groww-green text-white'
                                : 'bg-transparent border-surface-300 text-gray-400 hover:text-white hover:border-gray-500'
                            }`}
                    >
                        <Clock size={12} />
                        {w.label}
                    </button>
                ))}
            </div>

            {/* Summary pills */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(trendConfig).map(([key, cfg]) => (
                    <div key={key} className="glass-card p-4 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center
                            ${key === 'trend_up' ? 'bg-groww-green/15' :
                                key === 'trend_down' ? 'bg-groww-red/15' :
                                    key === 'new_trend' ? 'bg-groww-blue/15' : 'bg-gray-500/15'}`}>
                            <cfg.icon size={18} className={cfg.color} />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white">{summary[key]}</p>
                            <p className="text-xs text-gray-500">{cfg.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Trend chart */}
            <TrendChart
                data={trends?.items || []}
                title={`Purchase Trends — ${WINDOWS.find(w => w.key === activeWindow)?.label}`}
            />

            {/* Detailed drift table */}
            <div className="glass-card overflow-hidden">
                <div className="p-5 border-b border-surface-300">
                    <h3 className="text-base font-semibold text-white">Drift Details</h3>
                </div>
                {!trends?.items?.length ? (
                    <p className="p-5 text-gray-500 text-sm">No drift data available. Upload a dataset first.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-surface-300">
                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                    <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trend</th>
                                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current</th>
                                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Previous</th>
                                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Change</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trends.items.map((item, i) => {
                                    const cfg = trendConfig[item.trend] || trendConfig.stable;
                                    return (
                                        <tr key={i} className="border-b border-surface-300/50 table-row-hover transition-colors">
                                            <td className="px-5 py-3 text-white font-medium">{item.product}</td>
                                            <td className="px-5 py-3 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${cfg.bg}`}>
                                                    <cfg.icon size={12} />
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right text-gray-300">{item.current_count}</td>
                                            <td className="px-5 py-3 text-right text-gray-300">{item.previous_count}</td>
                                            <td className={`px-5 py-3 text-right font-semibold ${cfg.color}`}>
                                                {item.change_pct > 0 ? '+' : ''}{item.change_pct}%
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
