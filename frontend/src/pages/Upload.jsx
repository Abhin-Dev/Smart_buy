/**
 * SmartBuy — Dataset Upload Page
 * Groww-styled with green accents, dark dropzone, and metric cards.
 */
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadDataset } from '../api';
import {
    Upload as UploadIcon, FileSpreadsheet, CheckCircle2,
    AlertCircle, Loader2, Brain, Target, TrendingUp, Users,
    Sparkles, BarChart3,
} from 'lucide-react';

export default function Upload() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setResult(null);
            setError(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/csv': ['.csv'] },
        maxFiles: 1,
    });

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setError(null);
        try {
            const res = await uploadDataset(file);
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Upload failed. Please try again.');
        }
        setUploading(false);
    };

    const formatScore = (val) => {
        if (val === null || val === undefined) return '—';
        return (val * 100).toFixed(1) + '%';
    };

    const getScoreColor = (val) => {
        if (val === null || val === undefined) return 'text-gray-400';
        if (val >= 0.5) return 'text-groww-green';
        if (val >= 0.3) return 'text-groww-orange';
        return 'text-groww-red';
    };

    const getScoreLabel = (val) => {
        if (val === null || val === undefined) return 'N/A';
        if (val >= 0.7) return 'Excellent';
        if (val >= 0.5) return 'Good';
        if (val >= 0.3) return 'Fair';
        return 'Weak';
    };

    const metrics = result?.ml_metrics;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Upload Dataset</h1>
                <p className="text-gray-500 mt-1 text-sm">
                    Upload a CSV retail transaction dataset to start analysis
                </p>
            </div>

            {/* Expected format */}
            <div className="glass-card p-5">
                <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                    <FileSpreadsheet size={14} className="text-groww-green" />
                    Expected CSV Columns
                </h3>
                <div className="flex flex-wrap gap-2">
                    {['InvoiceNo', 'Product', 'Quantity', 'Price', 'CustomerID', 'DateTime'].map(col => (
                        <span key={col} className="px-3 py-1 rounded-md bg-groww-green/10 text-groww-green text-xs font-mono">
                            {col}
                        </span>
                    ))}
                </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
                {...getRootProps()}
                id="dropzone"
                className={`glass-card p-12 text-center cursor-pointer transition-all duration-300
                     ${isDragActive
                        ? 'border-groww-green/50 bg-groww-green/5 glow-green'
                        : 'hover:border-surface-300 hover:bg-surface-600/50'}`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all
                          ${isDragActive
                            ? 'bg-groww-green/15 text-groww-green scale-110'
                            : 'bg-surface-500 text-gray-400'}`}>
                        <UploadIcon size={24} />
                    </div>
                    <div>
                        <p className="text-base font-medium text-gray-200">
                            {isDragActive ? 'Drop your CSV here' : 'Drag & drop your CSV file'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                    </div>
                </div>
            </div>

            {/* Selected file + Upload button */}
            {file && !result && (
                <div className="glass-card p-4 flex items-center justify-between animate-slide-up">
                    <div className="flex items-center gap-3">
                        <FileSpreadsheet size={18} className="text-groww-green" />
                        <div>
                            <p className="text-sm font-medium text-white">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                    </div>
                    <button
                        id="upload-btn"
                        onClick={handleUpload}
                        disabled={uploading}
                        className="px-5 py-2 btn-primary rounded-lg text-sm flex items-center gap-2
                                 disabled:opacity-50 shadow-lg glow-green"
                    >
                        {uploading ? (
                            <><Loader2 size={14} className="animate-spin" /> Processing...</>
                        ) : (
                            <><UploadIcon size={14} /> Upload & Analyse</>
                        )}
                    </button>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="glass-card p-4 border-groww-red/30 bg-groww-red/5 flex items-start gap-3 animate-slide-up">
                    <AlertCircle size={18} className="text-groww-red mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-groww-red">Upload Error</p>
                        <p className="text-sm text-groww-red/80 mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* Success result */}
            {result && (
                <div className="space-y-5 animate-slide-up">
                    <div className="glass-card p-4 border-groww-green/20 bg-groww-green/5 flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-groww-green mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-groww-green">Upload Successful</p>
                            <p className="text-sm text-gray-400 mt-1">{result.message}</p>
                        </div>
                    </div>

                    {/* ML Accuracy Metrics */}
                    {metrics && (
                        <div className="glass-card p-5 glow-green animate-fade-in">
                            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                                <Brain size={18} className="text-groww-green" />
                                ML Model Accuracy & Metrics
                            </h3>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                                {/* Silhouette Score */}
                                <div className="bg-surface-700 rounded-lg p-4 border border-surface-300">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Target size={14} className="text-groww-green" />
                                        <span className="text-xs text-gray-500 font-medium">Silhouette Score</span>
                                    </div>
                                    <p className={`text-xl font-bold ${getScoreColor(metrics.silhouette_score)}`}>
                                        {metrics.silhouette_score !== null
                                            ? metrics.silhouette_score.toFixed(4)
                                            : '—'}
                                    </p>
                                    <p className={`text-xs mt-1 ${getScoreColor(metrics.silhouette_score)}`}>
                                        {getScoreLabel(metrics.silhouette_score)}
                                    </p>
                                </div>

                                {/* Clusters */}
                                <div className="bg-surface-700 rounded-lg p-4 border border-surface-300">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users size={14} className="text-groww-blue" />
                                        <span className="text-xs text-gray-500 font-medium">Clusters Created</span>
                                    </div>
                                    <p className="text-xl font-bold text-white">
                                        {metrics.clusters_created}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {metrics.customers_segmented} customers
                                    </p>
                                </div>

                                {/* Avg Confidence */}
                                <div className="bg-surface-700 rounded-lg p-4 border border-surface-300">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp size={14} className="text-groww-green" />
                                        <span className="text-xs text-gray-500 font-medium">Avg Confidence</span>
                                    </div>
                                    <p className="text-xl font-bold text-groww-green">
                                        {formatScore(metrics.avg_confidence)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">association rules</p>
                                </div>

                                {/* Avg Lift */}
                                <div className="bg-surface-700 rounded-lg p-4 border border-surface-300">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BarChart3 size={14} className="text-groww-orange" />
                                        <span className="text-xs text-gray-500 font-medium">Avg Lift</span>
                                    </div>
                                    <p className="text-xl font-bold text-groww-orange">
                                        {metrics.avg_lift !== null ? metrics.avg_lift.toFixed(2) + 'x' : '—'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {metrics.rules_generated} rules found
                                    </p>
                                </div>
                            </div>

                            {/* Explanation */}
                            <div className="bg-surface-700 rounded-lg p-4 border border-surface-300/50">
                                <div className="flex items-start gap-3">
                                    <Sparkles size={14} className="text-groww-green mt-0.5 flex-shrink-0" />
                                    <div className="text-xs text-gray-500 space-y-1">
                                        <p className="font-medium text-gray-400">How to read these metrics:</p>
                                        <p><span className="text-groww-green">Silhouette Score</span> — Measures how well customers fit their clusters (−1 to 1). Above 0.5 = good separation.</p>
                                        <p><span className="text-groww-green">Confidence</span> — Probability that product B is bought when product A is bought.</p>
                                        <p><span className="text-groww-orange">Lift</span> — How much more likely products are bought together vs independently. Above 1.0 = positive association.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Cluster Summary Table */}
                            {metrics.cluster_summary && metrics.cluster_summary.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-400 mb-3">Cluster Summary</h4>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-surface-300">
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Cluster</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Customers</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Avg Recency</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Avg Frequency</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Avg Monetary</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {metrics.cluster_summary.map((c, i) => (
                                                    <tr key={i} className="border-b border-surface-300/50 table-row-hover transition-colors">
                                                        <td className="px-4 py-2">
                                                            <span className="px-2 py-0.5 rounded-md badge-green text-xs font-medium">
                                                                Cluster {c.cluster}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-gray-300">{c.count}</td>
                                                        <td className="px-4 py-2 text-gray-300">{c.avg_recency} days</td>
                                                        <td className="px-4 py-2 text-gray-300">{c.avg_frequency}</td>
                                                        <td className="px-4 py-2 text-gray-300">${c.avg_monetary}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Columns */}
                    <div className="glass-card p-5">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Detected Columns</h3>
                        <div className="flex flex-wrap gap-2">
                            {result.columns.map(col => (
                                <span key={col} className="px-3 py-1 rounded-md badge-green text-xs font-mono">
                                    {col}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Preview Table */}
                    <div className="glass-card overflow-hidden">
                        <div className="p-5 border-b border-surface-300">
                            <h3 className="text-sm font-medium text-gray-400">Data Preview (first 10 rows)</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-surface-300">
                                        {result.columns.map(col => (
                                            <th key={col} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.preview.map((row, i) => (
                                        <tr key={i} className="border-b border-surface-300/50 table-row-hover transition-colors">
                                            {result.columns.map(col => (
                                                <td key={col} className="px-5 py-3 text-gray-300 whitespace-nowrap">
                                                    {String(row[col] ?? '')}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
