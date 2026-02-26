/**
 * SmartBuy — Cluster Chart Component
 * Pie chart + scatter visualisation with Groww-style colors.
 */
import React from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    Tooltip, Legend, ScatterChart, Scatter,
    XAxis, YAxis, CartesianGrid, ZAxis,
} from 'recharts';

const CLUSTER_COLORS = ['#00B386', '#5367FF', '#F7A928', '#EB5B3C', '#A855F7'];
const CLUSTER_LABELS = ['At Risk', 'Loyal', 'Big Spenders', 'New Customers'];

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="bg-surface-600 border border-surface-300 rounded-lg p-3 text-sm shadow-xl">
            <p className="font-semibold text-white">
                {CLUSTER_LABELS[d.cluster_label] || `Cluster ${d.cluster_label}`}
            </p>
            <p className="text-gray-400">Customers: {d.count || d.customer_id}</p>
            {d.avg_monetary != null && <p className="text-gray-400">Avg Spend: ${d.avg_monetary}</p>}
        </div>
    );
};

export function ClusterPie({ data = [] }) {
    if (!data.length) {
        return (
            <div className="glass-card p-6 text-center text-gray-500">
                <p>No cluster data available.</p>
            </div>
        );
    }

    const chartData = data.map((c) => ({
        ...c,
        name: CLUSTER_LABELS[c.cluster_label] || `Cluster ${c.cluster_label}`,
    }));

    return (
        <div className="glass-card p-6 animate-fade-in">
            <h3 className="text-base font-semibold text-white mb-4">Cluster Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={110}
                        paddingAngle={3}
                        strokeWidth={0}
                    >
                        {chartData.map((_, idx) => (
                            <Cell key={idx} fill={CLUSTER_COLORS[idx % CLUSTER_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        formatter={(value) => <span className="text-gray-400 text-sm">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export function ClusterScatter({ customers = [] }) {
    if (!customers.length) return null;

    const groups = {};
    customers.forEach((c) => {
        if (!groups[c.cluster_label]) groups[c.cluster_label] = [];
        groups[c.cluster_label].push(c);
    });

    return (
        <div className="glass-card p-6 animate-fade-in">
            <h3 className="text-base font-semibold text-white mb-4">
                Customer Segments (Frequency vs Monetary)
            </h3>
            <ResponsiveContainer width="100%" height={350}>
                <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2128" />
                    <XAxis
                        dataKey="frequency"
                        name="Frequency"
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        label={{ value: 'Frequency', position: 'bottom', fill: '#4B5563' }}
                    />
                    <YAxis
                        dataKey="monetary"
                        name="Monetary"
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        label={{ value: 'Monetary ($)', angle: -90, position: 'insideLeft', fill: '#4B5563' }}
                    />
                    <ZAxis dataKey="recency" range={[40, 400]} name="Recency" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    {Object.entries(groups).map(([label, points]) => (
                        <Scatter
                            key={label}
                            name={CLUSTER_LABELS[parseInt(label)] || `Cluster ${label}`}
                            data={points}
                            fill={CLUSTER_COLORS[parseInt(label) % CLUSTER_COLORS.length]}
                            opacity={0.8}
                        />
                    ))}
                    <Legend
                        formatter={(value) => <span className="text-gray-400 text-sm">{value}</span>}
                    />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}
