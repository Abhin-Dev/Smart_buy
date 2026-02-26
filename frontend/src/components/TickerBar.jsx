/**
 * SmartBuy — Ticker Bar
 * Groww-style scrolling horizontal bar showing key metrics.
 */
import React, { useEffect, useState } from 'react';
import { getTrends, getClusters, getRecommendations } from '../api';

export default function TickerBar() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        loadTickerData();
    }, []);

    const loadTickerData = async () => {
        try {
            const [trendRes, clusterRes, recRes] = await Promise.all([
                getTrends('7d').catch(() => null),
                getClusters().catch(() => null),
                getRecommendations().catch(() => null),
            ]);

            const trends = trendRes?.data;
            const clusters = clusterRes?.data;
            const recs = recRes?.data;

            const tickerItems = [];

            // Customer count
            if (clusters?.total_customers) {
                tickerItems.push({
                    label: 'CUSTOMERS',
                    value: clusters.total_customers.toLocaleString(),
                    change: null,
                    type: 'neutral',
                });
            }

            // Segment count
            if (clusters?.num_clusters) {
                tickerItems.push({
                    label: 'SEGMENTS',
                    value: clusters.num_clusters,
                    change: null,
                    type: 'neutral',
                });
            }

            // Trending products
            const upCount = trends?.items?.filter(t => t.trend === 'trend_up').length || 0;
            const downCount = trends?.items?.filter(t => t.trend === 'trend_down').length || 0;

            if (upCount > 0) {
                tickerItems.push({
                    label: 'TRENDING UP',
                    value: upCount,
                    change: `+${upCount}`,
                    type: 'up',
                });
            }

            if (downCount > 0) {
                tickerItems.push({
                    label: 'TRENDING DOWN',
                    value: downCount,
                    change: `-${downCount}`,
                    type: 'down',
                });
            }

            // Top trending product details
            trends?.items?.slice(0, 5).forEach(item => {
                tickerItems.push({
                    label: item.product,
                    value: item.current_count,
                    change: item.change_pct !== 0
                        ? `${item.change_pct > 0 ? '+' : ''}${item.change_pct}%`
                        : null,
                    type: item.trend === 'trend_up' ? 'up' : item.trend === 'trend_down' ? 'down' : 'neutral',
                });
            });

            // Rules count
            if (recs?.recommendations?.length) {
                tickerItems.push({
                    label: 'RULES',
                    value: recs.recommendations.length,
                    change: null,
                    type: 'neutral',
                });
            }

            setItems(tickerItems);
        } catch (err) {
            console.error('Ticker load error:', err);
        }
    };

    if (items.length === 0) return null;

    const colorMap = {
        up: 'text-groww-green',
        down: 'text-groww-red',
        neutral: 'text-gray-400',
    };

    // Duplicate items for seamless looping
    const doubled = [...items, ...items];

    return (
        <div className="ticker-bar py-2 px-4">
            <div className="ticker-track animate-marquee">
                {doubled.map((item, idx) => (
                    <span key={idx} className="inline-flex items-center gap-2 text-sm">
                        <span className="text-gray-400 font-medium">{item.label}</span>
                        <span className="text-white font-semibold">{item.value}</span>
                        {item.change && (
                            <span className={`font-medium ${colorMap[item.type]}`}>
                                {item.change}
                            </span>
                        )}
                    </span>
                ))}
            </div>
        </div>
    );
}
