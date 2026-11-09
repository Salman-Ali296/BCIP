"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRoleHome, useAuth } from "@/providers/auth-provider";

interface DashboardStats {
  totalComplaints: number;
  pendingComplaints: number;
  inProgressCount: number;
  resolvedComplaints: number;
}

export default function BusinessDashboard() {
  const router = useRouter();
  const { user, status, error, refreshSession } = useAuth();

  const [stats] = useState<DashboardStats>({
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressCount: 0,
    resolvedComplaints: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?returnTo=/business/dashboard");
    } else if (status === "authenticated" && user) {
      const businessRoles = ["BUSINESS_ADMIN", "MANAGER", "AGENT", "ESCALATION_AGENT", "BUSINESS"];
      if (!businessRoles.includes(user.role)) {
        router.replace(getRoleHome(user.role));
      }
    }
  }, [router, status, user]);

  if (status === "error") {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-sm text-slate-600" role="alert">{error}</p>
        <button
          type="button"
          onClick={() => void refreshSession()}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Retry session check
        </button>
      </div>
    );
  }

  if (status !== "authenticated" || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  // Role-specific welcome message
  const getWelcomeMessage = () => {
    switch (user.role) {
      case "BUSINESS_ADMIN":
        return "Welcome back, Admin. Here's an overview of your business.";
      case "MANAGER":
        return "Welcome back, Manager. Here's your team's performance overview.";
      case "AGENT":
      case "ESCALATION_AGENT":
        return "Welcome back. Here are the complaints assigned to you.";
      default:
        return "Welcome back to your workspace.";
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{user.tenantName ?? "Business workspace"}</h1>
        <p className="text-slate-500 mt-1">{getWelcomeMessage()}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Complaints"
          value={stats.totalComplaints}
          icon="📋"
          color="bg-blue-50 text-blue-700"
        />
        <StatCard
          title="Pending"
          value={stats.pendingComplaints}
          icon="⏳"
          color="bg-amber-50 text-amber-700"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgressCount}
          icon="🔄"
          color="bg-purple-50 text-purple-700"
        />
        <StatCard
          title="Resolved"
          value={stats.resolvedComplaints}
          icon="✅"
          color="bg-emerald-50 text-emerald-700"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {["BUSINESS_ADMIN", "MANAGER", "AGENT"].includes(user.role) && (
            <QuickActionButton
              href="/business/complaints/new"
              title="Submit New Complaint"
              description="Create a new complaint ticket"
              icon="➕"
              primary
            />
          )}
          
          {["BUSINESS_ADMIN", "MANAGER"].includes(user.role) && (
            <>
              <QuickActionButton
                href="/business/analytics"
                title="View Analytics"
                description="See detailed reports and insights"
                icon="📈"
              />
              <QuickActionButton
                href="/business/team"
                title="Manage Team"
                description="Add or manage team members"
                icon=""
              />
            </>
          )}

          {user.role === "BUSINESS_ADMIN" && (
            <QuickActionButton
              href="/business/settings"
              title="Settings & Billing"
              description="Configure your account"
              icon="⚙️"
            />
          )}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h2>
        <div className="text-center py-12 text-slate-400">
          <p>No recent activity to display.</p>
          <p className="text-sm mt-1">Complaints and updates will appear here.</p>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ 
  href, 
  title, 
  description, 
  icon, 
  primary = false 
}: { 
  href: string; 
  title: string; 
  description: string; 
  icon: string;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      className={`flex items-start gap-4 p-5 rounded-xl border transition-all ${
        primary
          ? "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700"
          : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30"
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <div>
        <h3 className={`font-semibold ${primary ? "text-white" : "text-slate-800"}`}>{title}</h3>
        <p className={`text-sm mt-1 ${primary ? "text-indigo-100" : "text-slate-500"}`}>
          {description}
        </p>
      </div>
    </a>
  );
}