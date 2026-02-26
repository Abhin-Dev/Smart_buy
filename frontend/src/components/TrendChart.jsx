/**
 * SmartBuy — Trend Chart Component
 * Bar chart with Groww's green/red color scheme.
 */
import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const trendColors = {
    trend_up: '#00B386',
    trend_down: '#EB5B3C',
    new_trend: '#5367FF',
    stable: '#4B5563',
};

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="bg-surface-600 border border-surface-300 rounded-lg p-3 text-sm shadow-xl">
            <p className="font-semibold text-white">{d.product}</p>
            <p className="text-gray-400">Current: {d.current_count}</p>
            <p className="text-gray-400">Previous: {d.previous_count}</p>
            <p className={d.trend === 'trend_up' ? 'text-groww-green' : d.trend === 'trend_down' ? 'text-groww-red' : 'text-groww-blue'}>
                {d.change_pct > 0 ? '+' : ''}{d.change_pct}%
            </p>
        </div>
    );
};

export default function TrendChart({ data = [], title = 'Purchase Trends' }) {
    if (!data.length) {
        return (
            <div className="glass-card p-6 text-center text-gray-500">
                <p>No trend data available. Upload a dataset first.</p>
            </div>
        );
    }

    const chartData = data.slice(0, 12);

    return (
        <div className="glass-card p-6 animate-fade-in">
            <h3 className="text-base font-semibold text-white mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2128" />
                    <XAxis
                        dataKey="product"
                        tick={{ fill: '#6B7280', fontSize: 11 }}
                        angle={-35}
                        textAnchor="end"
                        interval={0}
                    />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="current_count" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, idx) => (
                            <Cell key={idx} fill={trendColors[entry.trend] || '#4B5563'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
