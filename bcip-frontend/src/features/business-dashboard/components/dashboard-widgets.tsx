"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
    ArrowDownRight,
    ArrowUpRight,
    Minus,
    type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import type { BusinessDashboardData } from "@/lib/api/business-dashboard";

export function formatDashboardCount(value: number): string {
    return new Intl.NumberFormat("en-US").format(value);
}

export function formatDashboardDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Recently";
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
    }).format(date);
}

export function formatDashboardStatus(value: string): string {
    return value
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export function formatDashboardPriority(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function Sparkline({ values }: { values: number[] }) {
    if (values.length < 2) return null;
    const max = Math.max(1, ...values);
    const points = values
        .map((value, index) => {
            const x = (index / (values.length - 1)) * 100;
            const y = 28 - (value / max) * 24;
            return `${x},${y}`;
        })
        .join(" ");

    return (
        <svg
            viewBox="0 0 100 32"
            className="business-sparkline"
            aria-hidden="true"
            focusable="false"
        >
            <polyline points={points} fill="none" vectorEffect="non-scaling-stroke" />
        </svg>
    );
}

export function DashboardMetric({
    icon: Icon,
    label,
    value,
    detail,
    changePercent,
    trend,
}: {
    icon: LucideIcon;
    label: string;
    value: string;
    detail: string;
    changePercent?: number | null;
    trend?: number[];
}) {
    const reducedMotion = useReducedMotion();
    const ChangeIcon =
        changePercent === null || changePercent === undefined
            ? Minus
            : changePercent > 0
              ? ArrowUpRight
              : changePercent < 0
                ? ArrowDownRight
                : Minus;

    return (
        <motion.article
            className="business-dashboard-metric"
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={reducedMotion ? undefined : { y: -2 }}
            transition={{ duration: 0.22 }}
        >
            <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--workspace-muted)]">{label}</p>
                <span className="business-dashboard-icon">
                    <Icon size={17} aria-hidden="true" />
                </span>
            </div>
            <div className="mt-4 flex items-end justify-between gap-2">
                <motion.p
                    key={value}
                    className="business-display text-3xl tabular-nums"
                    initial={reducedMotion ? false : { opacity: 0.5, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                >
                    {value}
                </motion.p>
                {trend && <Sparkline values={trend} />}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-[var(--workspace-muted)]">
                {changePercent !== undefined && (
                    <span className="inline-flex items-center gap-0.5 font-semibold text-[var(--workspace-accent-strong)]">
                        <ChangeIcon size={13} aria-hidden="true" />
                        {changePercent === null
                            ? "No prior baseline"
                            : `${changePercent > 0 ? "+" : ""}${Math.round(changePercent)}% vs previous period`}
                    </span>
                )}
                {changePercent === undefined && <span>{detail}</span>}
            </div>
        </motion.article>
    );
}

export function DashboardPanel({
    eyebrow,
    title,
    description,
    action,
    children,
    className = "",
}: {
    eyebrow?: string;
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section className={`business-dashboard-panel ${className}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    {eyebrow && <p className="business-eyebrow">{eyebrow}</p>}
                    <h2 className="business-display mt-1 text-xl sm:text-2xl">{title}</h2>
                    {description && (
                        <p className="mt-1.5 text-sm leading-5 text-[var(--workspace-muted)]">
                            {description}
                        </p>
                    )}
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}

export function VolumeTrendChart({
    data,
}: {
    data: BusinessDashboardData["trend"];
}) {
    const reducedMotion = useReducedMotion();
    if (data.length === 0) {
        return (
            <div className="business-dashboard-empty mt-5">
                Complaint activity will appear here once cases are received.
            </div>
        );
    }

    const maxValue = Math.max(1, ...data.flatMap((item) => [item.received, item.resolved]));

    return (
        <div className="mt-5">
            <div className="business-dashboard-legend" aria-hidden="true">
                <span><i className="is-cyan" /> Received</span>
                <span><i className="is-navy" /> Resolved</span>
            </div>
            <div className="business-dashboard-chart-scroll mt-3">
                <div
                    className="business-volume-chart"
                    style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}
                    role="img"
                    aria-label={`Complaints received and resolved across ${data.length} time periods`}
                >
                    {data.map((item) => (
                        <div
                            key={item.bucket}
                            className="business-volume-chart-column"
                            title={`${formatDashboardDate(item.bucket)}: ${item.received} received, ${item.resolved} resolved`}
                        >
                            <motion.span
                                className="business-volume-bar is-cyan"
                                initial={reducedMotion ? false : { height: 0 }}
                                animate={{
                                    height: `${item.received === 0 ? 0 : Math.max(4, (item.received / maxValue) * 116)}px`,
                                }}
                                transition={{ duration: reducedMotion ? 0 : 0.35 }}
                            />
                            <motion.span
                                className="business-volume-bar is-navy"
                                initial={reducedMotion ? false : { height: 0 }}
                                animate={{
                                    height: `${item.resolved === 0 ? 0 : Math.max(4, (item.resolved / maxValue) * 116)}px`,
                                }}
                                transition={{ duration: reducedMotion ? 0 : 0.35, delay: reducedMotion ? 0 : 0.04 }}
                            />
                        </div>
                    ))}
                </div>
                <ul className="sr-only">
                    {data.map((item) => (
                        <li key={item.bucket}>
                            {formatDashboardDate(item.bucket)}: {item.received} received, {item.resolved} resolved.
                        </li>
                    ))}
                </ul>
                <div
                    className="business-volume-axis"
                    style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}
                    aria-hidden="true"
                >
                    {data.map((item, index) => (
                        <span key={item.bucket}>
                            {index === 0 || index === data.length - 1 || index === Math.floor(data.length / 2)
                                ? formatDashboardDate(item.bucket)
                                : ""}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

const PRIORITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

function labelForDistribution(value: string): string {
    return formatDashboardStatus(value);
}

export function DistributionList({
    items,
    emptyMessage,
    kind,
}: {
    items: Array<{ label: string; count: number }>;
    emptyMessage: string;
    kind: "priority" | "sentiment" | "category" | "status";
}) {
    const reducedMotion = useReducedMotion();
    if (items.length === 0 || items.every((item) => item.count === 0)) {
        return <div className="business-dashboard-empty mt-5">{emptyMessage}</div>;
    }

    const orderedItems =
        kind === "priority"
            ? [...items].sort((a, b) => {
                  const aIndex = PRIORITY_ORDER.indexOf(a.label.toUpperCase());
                  const bIndex = PRIORITY_ORDER.indexOf(b.label.toUpperCase());
                  return (aIndex < 0 ? PRIORITY_ORDER.length : aIndex) -
                      (bIndex < 0 ? PRIORITY_ORDER.length : bIndex);
              })
            : items;
    const total = orderedItems.reduce((sum, item) => sum + item.count, 0);

    return (
        <ul className="business-distribution-list mt-5">
            {orderedItems.map((item) => {
                const percent = total > 0 ? (item.count / total) * 100 : 0;
                const className = `is-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

                return (
                    <li key={item.label}>
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="min-w-0 truncate font-medium">
                                <span className={`business-distribution-dot ${className}`} aria-hidden="true" />
                                {labelForDistribution(item.label)}
                            </span>
                            <span className="shrink-0 font-semibold tabular-nums">
                                {formatDashboardCount(item.count)}
                                <span className="ml-1.5 text-xs font-normal text-[var(--workspace-muted)]">
                                    {Math.round(percent)}%
                                </span>
                            </span>
                        </div>
                        <div className="business-distribution-track" aria-hidden="true">
                            <motion.span
                                className={className}
                                initial={{ width: "0%" }}
                                animate={{ width: `${percent}%` }}
                                transition={{ duration: reducedMotion ? 0 : 0.35 }}
                            />
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

export function DashboardLoading() {
    return (
        <div className="space-y-5" role="status" aria-label="Loading business dashboard">
            <span className="sr-only">Loading business dashboard data…</span>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                {Array.from({ length: 6 }, (_, index) => (
                    <div className="business-dashboard-skeleton h-32" key={index} />
                ))}
            </div>
            <div className="grid gap-4 xl:grid-cols-3">
                <div className="business-dashboard-skeleton h-72 xl:col-span-2" />
                <div className="business-dashboard-skeleton h-72" />
            </div>
        </div>
    );
}

export function InlineEmptyState({ children }: { children: ReactNode }) {
    return <p className="business-dashboard-empty mt-5">{children}</p>;
}
