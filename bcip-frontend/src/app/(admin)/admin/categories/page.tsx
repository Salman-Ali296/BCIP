'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { getCategories, type CategoryConfig } from '@/lib/api/admin';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<CategoryConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getCategories();
            setCategories(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load categories');
            console.error('Load categories error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'CRITICAL':
                return 'bg-red-400/10 text-red-400 border border-red-400/20';
            case 'HIGH':
                return 'bg-orange-400/10 text-orange-400 border border-orange-400/20';
            case 'MEDIUM':
                return 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20';
            case 'LOW':
                return 'bg-blue-400/10 text-blue-400 border border-blue-400/20';
            default:
                return 'bg-white/5 text-slate-400 border border-white/[0.08]';
        }
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
                    <h1 className="text-2xl font-bold text-slate-50">Category Management</h1>
                    <p className="text-slate-400 mt-1">
                        Manage complaint categories and AI classification rules
                    </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-400/10 border border-emerald-400/20 rounded-xl text-emerald-400 hover:bg-emerald-400/20 transition">
                    <Plus size={16} />
                    Add Category
                </button>
            </div>

            {/* Error */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-400/10 border border-red-400/20 rounded-2xl p-4"
                >
                    <p className="text-red-400">{error}</p>
                </motion.div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-400">Loading categories...</p>
                    </div>
                </div>
            ) : categories.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-12 text-center backdrop-blur-xl"
                >
                    <Tag size={48} className="mx-auto text-slate-600 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-50 mb-2">No categories found</h3>
                    <p className="text-slate-400 mb-4">Create your first category to get started</p>
                    <button className="px-4 py-2.5 bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 rounded-xl hover:bg-emerald-400/20 transition">
                        Add Category
                    </button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * index, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-6 hover:border-emerald-400/30 hover:bg-white/5 transition backdrop-blur-xl group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Tag size={20} className="text-emerald-400" />
                                    <h3 className="font-semibold text-slate-50">{category.name}</h3>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button className="p-1.5 hover:bg-white/10 rounded-lg transition opacity-0 group-hover:opacity-100">
                                        <Edit size={16} className="text-slate-400" />
                                    </button>
                                    <button className="p-1.5 hover:bg-red-400/10 rounded-lg transition opacity-0 group-hover:opacity-100">
                                        <Trash2 size={16} className="text-red-400" />
                                    </button>
                                </div>
                            </div>
                            {category.description && (
                                <p className="text-sm text-slate-400 mb-3">{category.description}</p>
                            )}
                            <div className="flex items-center justify-between">
                                <span
                                    className={`text-xs px-2.5 py-1 rounded-lg ${getPriorityColor(
                                        category.defaultPriority
                                    )}`}
                                >
                                    {category.defaultPriority}
                                </span>
                                <span className="text-xs text-slate-500">
                                    {category.complaintCount} complaints
                                </span>
                            </div>
                            {category.keywords.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-white/[0.08]">
                                    <div className="text-xs text-slate-400 mb-2">Keywords:</div>
                                    <div className="flex flex-wrap gap-1">
                                        {category.keywords.slice(0, 3).map((keyword, idx) => (
                                            <span
                                                key={idx}
                                                className="text-xs px-2 py-0.5 bg-white/5 text-slate-300 rounded-lg border border-white/[0.08]"
                                            >
                                                {keyword}
                                            </span>
                                        ))}
                                        {category.keywords.length > 3 && (
                                            <span className="text-xs text-slate-500">
                                                +{category.keywords.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="mt-3 pt-3 border-t border-white/[0.08] text-xs text-slate-500">
                                {category.tenantName}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
