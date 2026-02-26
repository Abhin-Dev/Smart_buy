/**
 * SmartBuy — KPI Card Component
 * Groww-style compact stat card with green/red accents.
 */
import React from 'react';

const colorMap = {
    green: {
        icon: 'bg-groww-green/15 text-groww-green',
        value: 'text-groww-green',
    },
    red: {
        icon: 'bg-groww-red/15 text-groww-red',
        value: 'text-groww-red',
    },
    blue: {
        icon: 'bg-groww-blue/15 text-groww-blue',
        value: 'text-groww-blue',
    },
    neutral: {
        icon: 'bg-gray-500/15 text-gray-400',
        value: 'text-white',
    },
};

export default function KPICard({ title, value, subtitle, icon: Icon, color = 'neutral' }) {
    const scheme = colorMap[color] || colorMap.neutral;

    return (
        <div className="glass-card p-5 animate-fade-in">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        {title}
                    </p>
                    <p className={`text-2xl font-bold ${scheme.value} mb-0.5`}>{value}</p>
                    {subtitle && (
                        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
                {Icon && (
                    <div className={`p-2.5 rounded-lg ${scheme.icon}`}>
                        <Icon size={20} />
                    </div>
                )}
            </div>
        </div>
    );
}
