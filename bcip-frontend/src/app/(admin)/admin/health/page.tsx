'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Server,
    Database,
    Wifi,
    Zap,
    RefreshCw
} from 'lucide-react';

interface ServiceStatus {
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    responseTime?: number;
    lastCheck: string;
    uptime?: number;
    message?: string;
}

export default function SystemHealthPage() {
    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState<ServiceStatus[]>([]);

    useEffect(() => {
        loadHealthStatus();
    }, []);

    const loadHealthStatus = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - in production, this would come from actual health check endpoints
        setServices([
            {
                name: 'Express API',
                status: 'healthy',
                responseTime: 45,
                lastCheck: new Date().toISOString(),
                uptime: 99.9,
                message: 'All endpoints responding normally'
            },
            {
                name: 'PostgreSQL Database',
                status: 'healthy',
                responseTime: 12,
                lastCheck: new Date().toISOString(),
                uptime: 99.95,
                message: 'Connection pool healthy'
            },
            {
                name: 'FastAPI NLP Service',
                status: 'healthy',
                responseTime: 230,
                lastCheck: new Date().toISOString(),
                uptime: 98.5,
                message: 'AI models loaded and responding'
            },
            {
                name: 'Redis Cache',
                status: 'healthy',
                responseTime: 5,
                lastCheck: new Date().toISOString(),
                uptime: 99.99,
                message: 'Cache hit rate: 85%'
            },
            {
                name: 'Email Service',
                status: 'healthy',
                responseTime: 150,
                lastCheck: new Date().toISOString(),
                uptime: 99.5,
                message: 'SMTP connection active'
            }
        ]);
        setLoading(false);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy':
                return <CheckCircle className="text-emerald-400" size={20} />;
            case 'degraded':
                return <AlertTriangle className="text-orange-400" size={20} />;
            case 'down':
                return <XCircle className="text-red-400" size={20} />;
            default:
                return <Activity className="text-slate-400" size={20} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
            case 'degraded':
                return 'bg-orange-400/10 text-orange-400 border-orange-400/20';
            case 'down':
                return 'bg-red-400/10 text-red-400 border-red-400/20';
            default:
                return 'bg-white/5 text-slate-400 border-white/[0.08]';
        }
    };

    const overallHealth = services.every(s => s.status === 'healthy') ? 'healthy' 
        : services.some(s => s.status === 'down') ? 'down' 
        : 'degraded';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-50">System Health</h1>
                    <p className="text-slate-400 mt-1">
                        Monitor platform services and infrastructure status
                    </p>
                </div>
                <button
                    onClick={loadHealthStatus}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-400/10 border border-emerald-400/20 rounded-xl text-emerald-400 hover:bg-emerald-400/20 disabled:opacity-50 transition"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Overall Status Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={`rounded-2xl border-2 p-6 backdrop-blur-xl ${
                    overallHealth === 'healthy' 
                        ? 'bg-emerald-400/10 border-emerald-400/30'
                        : overallHealth === 'down'
                        ? 'bg-red-400/10 border-red-400/30'
                        : 'bg-orange-400/10 border-orange-400/30'
                }`}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                        overallHealth === 'healthy' 
                            ? 'bg-emerald-400/20'
                            : overallHealth === 'down'
                            ? 'bg-red-400/20'
                            : 'bg-orange-400/20'
                    }`}>
                        {getStatusIcon(overallHealth)}
                    </div>
                    <div className="flex-1">
                        <h2 className={`text-2xl font-bold ${
                            overallHealth === 'healthy' 
                                ? 'text-emerald-400'
                                : overallHealth === 'down'
                                ? 'text-red-400'
                                : 'text-orange-400'
                        }`}>
                            {overallHealth === 'healthy' ? 'All Systems Operational'
                                : overallHealth === 'down' ? 'Service Disruption'
                                : 'Degraded Performance'}
                        </h2>
                        <p className={`text-sm mt-1 ${
                            overallHealth === 'healthy' 
                                ? 'text-emerald-400/80'
                                : overallHealth === 'down'
                                ? 'text-red-400/80'
                                : 'text-orange-400/80'
                        }`}>
                            {services.length} services monitored • Last check: {new Date().toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Service Status Cards */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-400">Checking system health...</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-6 backdrop-blur-xl hover:border-emerald-400/30 transition"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {getStatusIcon(service.status)}
                                    <div>
                                        <h3 className="font-semibold text-slate-50">{service.name}</h3>
                                        <span className={`text-xs px-2.5 py-1 rounded-lg border inline-block mt-1 ${getStatusColor(service.status)}`}>
                                            {service.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                                {service.responseTime !== undefined && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Response Time</span>
                                        <span className="text-slate-50 font-medium">{service.responseTime}ms</span>
                                    </div>
                                )}
                                {service.uptime !== undefined && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Uptime</span>
                                        <span className="text-emerald-400 font-medium">{service.uptime}%</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Last Check</span>
                                    <span className="text-slate-50 font-medium">
                                        {new Date(service.lastCheck).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>

                            {service.message && (
                                <div className="mt-4 pt-4 border-t border-white/[0.08]">
                                    <p className="text-xs text-slate-400">{service.message}</p>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* System Metrics */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-6 backdrop-blur-xl"
            >
                <h2 className="text-lg font-semibold text-slate-50 mb-4">System Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 border border-white/[0.08] rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Server size={16} className="text-emerald-400" />
                            <span className="text-sm text-slate-400">CPU Usage</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-50">24%</div>
                    </div>
                    <div className="bg-white/5 border border-white/[0.08] rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Database size={16} className="text-emerald-400" />
                            <span className="text-sm text-slate-400">Memory</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-50">62%</div>
                    </div>
                    <div className="bg-white/5 border border-white/[0.08] rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Wifi size={16} className="text-emerald-400" />
                            <span className="text-sm text-slate-400">Network</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-50">1.2GB</div>
                    </div>
                    <div className="bg-white/5 border border-white/[0.08] rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap size={16} className="text-emerald-400" />
                            <span className="text-sm text-slate-400">Requests/min</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-50">342</div>
                    </div>
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
                    <strong>Note:</strong> Health checks run every 30 seconds. Configure alert thresholds 
                    and notification channels in Platform Settings.
                </p>
            </motion.div>
        </motion.div>
    );
}
