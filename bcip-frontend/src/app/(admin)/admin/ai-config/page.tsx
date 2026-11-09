'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Brain, CheckCircle, AlertCircle, Activity } from 'lucide-react';
import { getAISettings, getAIProcessingStats } from '@/lib/api/admin';

export default function AIConfigPage() {
    const {
        data: aiConfigData,
        isPending: loading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['admin-ai-config'],
        queryFn: async () => {
            const [settings, stats] = await Promise.all([
                getAISettings(),
                getAIProcessingStats(),
            ]);
            return { settings, stats };
        },
    });
    const settings = aiConfigData?.settings ?? null;
    const stats = aiConfigData?.stats ?? null;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading AI configuration...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <h1 className="text-2xl font-bold text-slate-50">AI Configuration</h1>
                <div className="bg-red-400/10 border border-red-400/20 rounded-2xl p-4">
                    <p className="text-red-400">
                        {error instanceof Error ? error.message : 'Failed to load AI configuration'}
                    </p>
                    <button
                        onClick={() => void refetch()}
                        className="mt-2 px-4 py-2 bg-red-400/10 border border-red-400/20 text-red-400 rounded-xl hover:bg-red-400/20 transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
        >
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-50">AI Configuration</h1>
                <p className="text-slate-400 mt-1">
                    Manage AI processing settings and monitor performance
                </p>
            </div>

            {/* Settings Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-6 backdrop-blur-xl"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-50">AI Processing</h3>
                        {settings?.aiEnabled ? (
                            <CheckCircle className="text-emerald-400" size={24} />
                        ) : (
                            <AlertCircle className="text-slate-600" size={24} />
                        )}
                    </div>
                    <div className="text-3xl font-bold text-slate-50 mb-2">
                        {settings?.aiEnabled ? 'Enabled' : 'Disabled'}
                    </div>
                    <p className="text-sm text-slate-400">
                        AI analysis is currently {settings?.aiEnabled ? 'active' : 'inactive'} for
                        all complaints
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-6 backdrop-blur-xl"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-50">Auto Processing</h3>
                        {settings?.autoProcessAI ? (
                            <CheckCircle className="text-emerald-400" size={24} />
                        ) : (
                            <AlertCircle className="text-slate-600" size={24} />
                        )}
                    </div>
                    <div className="text-3xl font-bold text-slate-50 mb-2">
                        {settings?.autoProcessAI ? 'On' : 'Off'}
                    </div>
                    <p className="text-sm text-slate-400">
                        Complaints are {settings?.autoProcessAI ? 'automatically' : 'manually'}{' '}
                        processed
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-6 backdrop-blur-xl"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-50">Duplicate Threshold</h3>
                        <Activity className="text-emerald-400" size={24} />
                    </div>
                    <div className="text-3xl font-bold text-slate-50 mb-2">
                        {((settings?.duplicateThreshold || 0) * 100).toFixed(0)}%
                    </div>
                    <p className="text-sm text-slate-400">
                        Similarity threshold for duplicate detection
                    </p>
                </motion.div>
            </div>

            {/* Processing Statistics */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-6 backdrop-blur-xl"
            >
                <h2 className="text-lg font-semibold text-slate-50 mb-6">
                    AI Processing Statistics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                        <div className="text-sm text-slate-400 mb-1">Total Processed</div>
                        <div className="text-3xl font-bold text-slate-50">
                            {stats?.totalProcessed.toLocaleString() || 0}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-slate-400 mb-1">Success Rate</div>
                        <div className="text-3xl font-bold text-emerald-400">
                            {stats?.successRate.toFixed(1) || 0}%
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-slate-400 mb-1">Avg Confidence</div>
                        <div className="text-3xl font-bold text-emerald-400">
                            {((stats?.avgConfidence || 0) * 100).toFixed(1)}%
                        </div>
                    </div>
                </div>

                {/* Processing by Type */}
                {stats && stats.byType.length > 0 && (
                    <div>
                        <h3 className="font-medium text-slate-50 mb-4">Processing by Type</h3>
                        <div className="space-y-3">
                            {stats.byType.map((item, index) => {
                                const percentage =
                                    (item.count / stats.totalProcessed) * 100;
                                return (
                                    <motion.div
                                        key={item.type}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + index * 0.05 }}
                                    >
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-slate-300">
                                                {item.type.replace('_', ' ')}
                                            </span>
                                            <span className="text-slate-400">
                                                {item.count.toLocaleString()} ({percentage.toFixed(1)}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-full h-2">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ delay: 0.3 + index * 0.05, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                                className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                                            />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </motion.div>

            {/* AI Models Information */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-6 backdrop-blur-xl"
            >
                <h2 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
                    <Brain size={20} className="text-emerald-400" />
                    AI Models & Capabilities
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { title: 'Category Classification', desc: 'Automatically categorizes complaints based on content analysis' },
                        { title: 'Sentiment Analysis', desc: 'Detects emotional tone and urgency in complaint text' },
                        { title: 'Priority Detection', desc: 'Assigns priority levels based on urgency and impact' },
                        { title: 'Duplicate Detection', desc: 'Identifies similar complaints to prevent duplication' },
                        { title: 'Summary Generation', desc: 'Creates concise summaries of lengthy complaints' },
                        { title: 'Response Suggestion', desc: 'Generates suggested responses for common complaint types' }
                    ].map((model, index) => (
                        <motion.div
                            key={model.title}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 + index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-white/5 border border-white/[0.08] rounded-xl p-4 hover:bg-white/[0.08] transition"
                        >
                            <h3 className="font-medium text-slate-50 mb-2">
                                {model.title}
                            </h3>
                            <p className="text-sm text-slate-400">
                                {model.desc}
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                <span className="text-xs text-emerald-400">Active</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Note */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-blue-400/10 border border-blue-400/20 rounded-2xl p-4"
            >
                <p className="text-sm text-blue-400">
                    <strong>Note:</strong> AI configuration changes affect all tenants and should be
                    made carefully. Models are continuously learning and improving based on feedback
                    and new data.
                </p>
            </motion.div>
        </motion.div>
    );
}
