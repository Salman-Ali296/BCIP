'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileDown,
    FileText,
    Calendar,
    Filter,
    Download,
    TrendingUp,
    Users,
    Building2,
    BarChart3
} from 'lucide-react';

type ReportType = 'complaints' | 'businesses' | 'users' | 'analytics' | 'performance';
type DateRange = '7d' | '30d' | '90d' | 'custom';

export default function AdminReportsPage() {
    const [reportType, setReportType] = useState<ReportType>('complaints');
    const [dateRange, setDateRange] = useState<DateRange>('30d');
    const [format, setFormat] = useState<'csv' | 'pdf'>('csv');
    const [generating, setGenerating] = useState(false);

    const reportTypes = [
        {
            id: 'complaints' as ReportType,
            name: 'Complaints Report',
            description: 'Complete complaint data with categories, priorities, and resolutions',
            icon: FileText,
            color: 'emerald'
        },
        {
            id: 'businesses' as ReportType,
            name: 'Business Report',
            description: 'Business registrations, activity, and complaint volumes',
            icon: Building2,
            color: 'blue'
        },
        {
            id: 'users' as ReportType,
            name: 'Users Report',
            description: 'User accounts, roles, and activity metrics',
            icon: Users,
            color: 'purple'
        },
        {
            id: 'analytics' as ReportType,
            name: 'Analytics Report',
            description: 'Trends, distributions, and performance metrics',
            icon: BarChart3,
            color: 'orange'
        },
        {
            id: 'performance' as ReportType,
            name: 'Performance Report',
            description: 'Resolution times, response rates, and satisfaction scores',
            icon: TrendingUp,
            color: 'teal'
        }
    ];

    const handleGenerate = async () => {
        setGenerating(true);
        // Simulate report generation
        await new Promise(resolve => setTimeout(resolve, 2000));
        setGenerating(false);
        
        // In production, this would trigger actual report generation and download
        alert(`Generated ${reportType} report for ${dateRange} as ${format.toUpperCase()}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
        >
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-50">Platform Reports</h1>
                <p className="text-slate-400 mt-1">
                    Generate and export comprehensive platform data reports
                </p>
            </div>

            {/* Report Type Selection */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-6 backdrop-blur-xl"
            >
                <h2 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
                    <FileText size={20} className="text-emerald-400" />
                    Select Report Type
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reportTypes.map((report, index) => {
                        const Icon = report.icon;
                        const isSelected = reportType === report.id;
                        return (
                            <motion.button
                                key={report.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 + index * 0.05 }}
                                onClick={() => setReportType(report.id)}
                                className={`text-left p-4 rounded-xl border-2 transition ${
                                    isSelected
                                        ? 'bg-emerald-400/10 border-emerald-400/30'
                                        : 'bg-white/5 border-white/[0.08] hover:border-emerald-400/20'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                        isSelected ? 'bg-emerald-400/20' : 'bg-white/5'
                                    }`}>
                                        <Icon size={20} className={isSelected ? 'text-emerald-400' : 'text-slate-400'} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-semibold mb-1 ${
                                            isSelected ? 'text-emerald-400' : 'text-slate-50'
                                        }`}>
                                            {report.name}
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                            {report.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Report Configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Date Range */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-6 backdrop-blur-xl"
                >
                    <h2 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
                        <Calendar size={20} className="text-emerald-400" />
                        Date Range
                    </h2>
                    <div className="space-y-3">
                        {[
                            { value: '7d' as DateRange, label: 'Last 7 Days' },
                            { value: '30d' as DateRange, label: 'Last 30 Days' },
                            { value: '90d' as DateRange, label: 'Last 90 Days' },
                            { value: 'custom' as DateRange, label: 'Custom Range' }
                        ].map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setDateRange(option.value)}
                                className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                                    dateRange === option.value
                                        ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400'
                                        : 'bg-white/5 border-white/[0.08] text-slate-50 hover:border-emerald-400/20'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    {dateRange === 'custom' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 space-y-3"
                        >
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    From Date
                                </label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    To Date
                                </label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition"
                                />
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Export Format */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-6 backdrop-blur-xl"
                >
                    <h2 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
                        <FileDown size={20} className="text-emerald-400" />
                        Export Format
                    </h2>
                    <div className="space-y-3">
                        <button
                            onClick={() => setFormat('csv')}
                            className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                                format === 'csv'
                                    ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400'
                                    : 'bg-white/5 border-white/[0.08] text-slate-50 hover:border-emerald-400/20'
                            }`}
                        >
                            <div className="font-medium">CSV (Spreadsheet)</div>
                            <div className="text-xs text-slate-400 mt-1">
                                Best for data analysis in Excel or Google Sheets
                            </div>
                        </button>
                        <button
                            onClick={() => setFormat('pdf')}
                            className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                                format === 'pdf'
                                    ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400'
                                    : 'bg-white/5 border-white/[0.08] text-slate-50 hover:border-emerald-400/20'
                            }`}
                        >
                            <div className="font-medium">PDF (Document)</div>
                            <div className="text-xs text-slate-400 mt-1">
                                Formatted report ready for printing or sharing
                            </div>
                        </button>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-400/10 border border-emerald-400/20 rounded-xl text-emerald-400 hover:bg-emerald-400/20 disabled:opacity-50 transition font-medium"
                    >
                        <Download size={20} className={generating ? 'animate-bounce' : ''} />
                        {generating ? 'Generating Report...' : 'Generate & Download Report'}
                    </button>
                </motion.div>
            </div>

            {/* Recent Reports */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-6 backdrop-blur-xl"
            >
                <h2 className="text-lg font-semibold text-slate-50 mb-4">Recent Reports</h2>
                <div className="space-y-3">
                    {[
                        { name: 'Complaints Report - Last 30 Days', date: '2 hours ago', size: '2.4 MB', format: 'CSV' },
                        { name: 'Business Analytics', date: '1 day ago', size: '1.8 MB', format: 'PDF' },
                        { name: 'User Activity Report', date: '3 days ago', size: '856 KB', format: 'CSV' }
                    ].map((report, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.45 + index * 0.05 }}
                            className="flex items-center justify-between p-4 bg-white/5 border border-white/[0.08] rounded-xl hover:bg-white/[0.08] transition"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-400/10 rounded-lg flex items-center justify-center">
                                    <FileText size={20} className="text-emerald-400" />
                                </div>
                                <div>
                                    <div className="font-medium text-slate-50">{report.name}</div>
                                    <div className="text-xs text-slate-400">
                                        {report.date} • {report.size} • {report.format}
                                    </div>
                                </div>
                            </div>
                            <button className="p-2 hover:bg-white/5 rounded-lg transition">
                                <Download size={16} className="text-emerald-400" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Info Note */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-blue-400/10 border border-blue-400/20 rounded-2xl p-4"
            >
                <p className="text-sm text-blue-400">
                    <strong>Note:</strong> Reports are generated with current database data. Large date 
                    ranges may take longer to process. Generated reports are available for 7 days.
                </p>
            </motion.div>
        </motion.div>
    );
}
