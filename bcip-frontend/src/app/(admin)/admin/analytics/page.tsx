'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export default function AnalyticsPage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
        >
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-50">Analytics & Reports</h1>
                <p className="text-slate-400 mt-1">
                    System-wide performance metrics and reporting
                </p>
            </div>

            {/* Coming Soon Notice */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="bg-gradient-to-br from-emerald-400/10 to-emerald-500/5 border border-emerald-400/20 rounded-2xl p-8 text-center backdrop-blur-xl"
            >
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    <BarChart3 size={48} className="mx-auto text-emerald-400 mb-4" />
                </motion.div>
                <h3 className="text-lg font-semibold text-slate-50 mb-2">
                    Advanced Analytics Coming Soon
                </h3>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    Comprehensive reporting features including trend analysis, performance metrics,
                    business comparisons, and exportable reports are currently in development.
                </p>
            </motion.div>

            {/* Quick Stats Preview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Avg Resolution Time', value: '24.5h', icon: Clock, color: 'blue' },
                    { label: 'Resolution Rate', value: '87%', icon: CheckCircle, color: 'emerald' },
                    { label: 'Response Time', value: '2.3h', icon: TrendingUp, color: 'purple' },
                    { label: 'Satisfaction Score', value: '4.2/5', icon: BarChart3, color: 'orange' }
                ].map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-6 backdrop-blur-xl"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-400">{stat.label}</span>
                                <Icon size={20} className="text-emerald-400" />
                            </div>
                            <div className="text-2xl font-bold text-slate-50">{stat.value}</div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Available Reports */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-6 backdrop-blur-xl"
            >
                <h2 className="text-lg font-semibold text-slate-50 mb-4">Available Reports</h2>
                <div className="space-y-3">
                    {[
                        { title: 'Complaint Volume Report', desc: 'Track complaint trends over time' },
                        { title: 'Performance Metrics', desc: 'Business and agent performance analysis' },
                        { title: 'Category Analysis', desc: 'Breakdown by complaint category' }
                    ].map((report, index) => (
                        <motion.div
                            key={report.title}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="flex items-center justify-between p-4 bg-white/5 border border-white/[0.08] rounded-xl hover:bg-white/[0.08] transition"
                        >
                            <div>
                                <h3 className="font-medium text-slate-50">{report.title}</h3>
                                <p className="text-sm text-slate-400">
                                    {report.desc}
                                </p>
                            </div>
                            <button className="px-3 py-1.5 text-sm bg-white/5 text-slate-400 rounded-lg cursor-not-allowed border border-white/[0.08]">
                                Coming Soon
                            </button>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
