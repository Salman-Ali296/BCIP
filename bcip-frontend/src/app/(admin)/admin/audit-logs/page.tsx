'use client';

import { motion } from 'framer-motion';
import { FileSearch, Shield, Calendar } from 'lucide-react';

export default function AuditLogsPage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
        >
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-50">Audit Logs</h1>
                <p className="text-slate-400 mt-1">
                    Track system activities and administrative actions
                </p>
            </div>

            {/* Coming Soon Notice */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="bg-gradient-to-br from-blue-400/10 to-blue-500/5 border border-blue-400/20 rounded-2xl p-8 text-center backdrop-blur-xl"
            >
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    <FileSearch size={48} className="mx-auto text-blue-400 mb-4" />
                </motion.div>
                <h3 className="text-lg font-semibold text-slate-50 mb-2">
                    Audit Log System Coming Soon
                </h3>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    Comprehensive audit logging with advanced filtering, search capabilities, and
                    detailed activity tracking is currently in development.
                </p>
            </motion.div>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { icon: Shield, color: 'emerald', title: 'Security Events', desc: 'Track login attempts, permission changes, and security-related activities' },
                    { icon: FileSearch, color: 'blue', title: 'Admin Actions', desc: 'Monitor all administrative operations including user management and configuration changes' },
                    { icon: Calendar, color: 'purple', title: 'Historical Data', desc: 'Access complete historical records with date range filtering and export capabilities' }
                ].map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-6 backdrop-blur-xl"
                        >
                            <Icon size={24} className="text-emerald-400 mb-3" />
                            <h3 className="font-semibold text-slate-50 mb-2">{feature.title}</h3>
                            <p className="text-sm text-slate-400">
                                {feature.desc}
                            </p>
                        </motion.div>
                    );
                })}
            </div>

        </motion.div>
    );
}
