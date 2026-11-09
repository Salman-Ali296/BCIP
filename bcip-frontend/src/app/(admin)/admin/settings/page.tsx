'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Settings,
    Save,
    Mail,
    Bell,
    Shield,
    Database,
    Server,
    Globe,
    AlertTriangle
} from 'lucide-react';

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    // Platform settings state
    const [settings, setSettings] = useState({
        siteName: 'BCIP Platform',
        supportEmail: 'support@bcip.com',
        maxFileSize: 10, // MB
        allowSignups: true,
        requireEmailVerification: true,
        enableAIProcessing: true,
        autoEscalation: true,
        maintenanceMode: false,
        sessionTimeout: 30, // minutes
        maxLoginAttempts: 5,
        passwordMinLength: 8,
    });

    const handleSave = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

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
                    <h1 className="text-2xl font-bold text-slate-50">Platform Settings</h1>
                    <p className="text-slate-400 mt-1">
                        Configure system-wide settings and administration controls
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-400/10 border border-emerald-400/20 rounded-xl text-emerald-400 hover:bg-emerald-400/20 disabled:opacity-50 transition"
                >
                    <Save size={16} />
                    {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>

            {/* General Settings */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-6 backdrop-blur-xl"
            >
                <h2 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
                    <Globe size={20} className="text-emerald-400" />
                    General Settings
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Site Name
                        </label>
                        <input
                            type="text"
                            value={settings.siteName}
                            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Support Email
                        </label>
                        <input
                            type="email"
                            value={settings.supportEmail}
                            onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Max File Upload Size (MB)
                        </label>
                        <input
                            type="number"
                            value={settings.maxFileSize}
                            onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) })}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Registration & Access */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-6 backdrop-blur-xl"
            >
                <h2 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
                    <Shield size={20} className="text-emerald-400" />
                    Registration & Access Control
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/[0.08] rounded-xl">
                        <div>
                            <div className="font-medium text-slate-50">Allow New Signups</div>
                            <div className="text-sm text-slate-400">
                                Enable new business registrations
                            </div>
                        </div>
                        <button
                            onClick={() => setSettings({ ...settings, allowSignups: !settings.allowSignups })}
                            className={`relative w-12 h-6 rounded-full transition ${
                                settings.allowSignups ? 'bg-emerald-400' : 'bg-white/20'
                            }`}
                        >
                            <div
                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                    settings.allowSignups ? 'translate-x-6' : ''
                                }`}
                            />
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/[0.08] rounded-xl">
                        <div>
                            <div className="font-medium text-slate-50">Require Email Verification</div>
                            <div className="text-sm text-slate-400">
                                Users must verify email before accessing the platform
                            </div>
                        </div>
                        <button
                            onClick={() => setSettings({ ...settings, requireEmailVerification: !settings.requireEmailVerification })}
                            className={`relative w-12 h-6 rounded-full transition ${
                                settings.requireEmailVerification ? 'bg-emerald-400' : 'bg-white/20'
                            }`}
                        >
                            <div
                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                    settings.requireEmailVerification ? 'translate-x-6' : ''
                                }`}
                            />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* AI & Automation */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-6 backdrop-blur-xl"
            >
                <h2 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
                    <Server size={20} className="text-emerald-400" />
                    AI & Automation
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/[0.08] rounded-xl">
                        <div>
                            <div className="font-medium text-slate-50">Enable AI Processing</div>
                            <div className="text-sm text-slate-400">
                                Automatic categorization and sentiment analysis
                            </div>
                        </div>
                        <button
                            onClick={() => setSettings({ ...settings, enableAIProcessing: !settings.enableAIProcessing })}
                            className={`relative w-12 h-6 rounded-full transition ${
                                settings.enableAIProcessing ? 'bg-emerald-400' : 'bg-white/20'
                            }`}
                        >
                            <div
                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                    settings.enableAIProcessing ? 'translate-x-6' : ''
                                }`}
                            />
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/[0.08] rounded-xl">
                        <div>
                            <div className="font-medium text-slate-50">Auto Escalation</div>
                            <div className="text-sm text-slate-400">
                                Automatically escalate critical complaints
                            </div>
                        </div>
                        <button
                            onClick={() => setSettings({ ...settings, autoEscalation: !settings.autoEscalation })}
                            className={`relative w-12 h-6 rounded-full transition ${
                                settings.autoEscalation ? 'bg-emerald-400' : 'bg-white/20'
                            }`}
                        >
                            <div
                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                    settings.autoEscalation ? 'translate-x-6' : ''
                                }`}
                            />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Security Settings */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-6 backdrop-blur-xl"
            >
                <h2 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
                    <Shield size={20} className="text-emerald-400" />
                    Security Settings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Session Timeout (minutes)
                        </label>
                        <input
                            type="number"
                            value={settings.sessionTimeout}
                            onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Max Login Attempts
                        </label>
                        <input
                            type="number"
                            value={settings.maxLoginAttempts}
                            onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Minimum Password Length
                        </label>
                        <input
                            type="number"
                            value={settings.passwordMinLength}
                            onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) })}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Maintenance Mode */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-6 backdrop-blur-xl"
            >
                <h2 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
                    <AlertTriangle size={20} className="text-orange-400" />
                    Maintenance Mode
                </h2>
                <div className="flex items-center justify-between p-4 bg-orange-400/10 border border-orange-400/20 rounded-xl">
                    <div>
                        <div className="font-medium text-orange-400">Maintenance Mode</div>
                        <div className="text-sm text-orange-400/80">
                            Temporarily disable public access to the platform
                        </div>
                    </div>
                    <button
                        onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                        className={`relative w-12 h-6 rounded-full transition ${
                            settings.maintenanceMode ? 'bg-orange-400' : 'bg-white/20'
                        }`}
                    >
                        <div
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                settings.maintenanceMode ? 'translate-x-6' : ''
                            }`}
                        />
                    </button>
                </div>
                {settings.maintenanceMode && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 p-4 bg-orange-400/5 border border-orange-400/20 rounded-xl"
                    >
                        <p className="text-sm text-orange-400">
                            ⚠️ When maintenance mode is active, only administrators can access the platform.
                            All other users will see a maintenance message.
                        </p>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
}
