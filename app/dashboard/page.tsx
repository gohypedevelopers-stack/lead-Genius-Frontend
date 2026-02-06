"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Rocket,
  MessageSquare,
  AlertCircle,
  Search,
  Calendar,
  CloudLightning,
  CheckCircle2,
  MoreVertical,
  Loader2,
  ChevronRight,
  Plus,
  Database,
  FileCheck
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { ProfileCompletionModal } from "@/components/dashboard/ProfileCompletionModal";
import { useDashboardStats, useDashboardActivity, useDashboardChart } from "@/lib/hooks";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { activities, isLoading: activityLoading } = useDashboardActivity(10);
  const { chartData, isLoading: chartLoading } = useDashboardChart(7);

  // Transform stats for display

  // Transform stats for display
  const displayStats = stats ? [
    {
      title: "TOTAL EXTRACTED",
      value: stats.total_leads?.toLocaleString() || "0",
      change: "Total leads in system",
      trend: "up",
      icon: Database,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      changeColor: "text-emerald-500"
    },
    {
      title: "QUALIFIED LEADS",
      value: stats.qualified_leads?.toLocaleString() || "0",
      change: "High Intent",
      trend: "up",
      icon: FileCheck,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      changeColor: "text-emerald-500"
    },
    {
      title: "ACTIVE CAMPAIGNS",
      value: stats.active_campaigns?.toString() || "0",
      change: "Running smoothly",
      trend: "neutral",
      icon: Rocket,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      changeColor: "text-slate-400"
    },
    {
      title: "RESPONSE RATE",
      value: stats.response_rate || "0%",
      change: "Reply rate",
      trend: "up",
      icon: MessageSquare,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      changeColor: "text-emerald-500"
    },
    {
      title: "PENDING TASKS",
      value: stats.pending_tasks?.toString() || "0",
      change: "Items to review",
      trend: "down",
      icon: AlertCircle,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      changeColor: "text-amber-500"
    },
  ] : [];

  // Lead quality pie chart data
  const leadQualityData = stats?.lead_stats ? [
    { name: 'Cold', value: Math.round((stats.lead_stats.by_status?.cold || 0) / (stats.total_leads || 1) * 100), color: '#0ea5e9' },
    { name: 'Warm', value: Math.round((stats.lead_stats.by_status?.warm || 0) / (stats.total_leads || 1) * 100), color: '#3b82f6' },
    { name: 'Hot', value: Math.round((stats.lead_stats.by_status?.hot || 0) / (stats.total_leads || 1) * 100), color: '#10b981' },
  ] : [
    { name: 'Cold', value: 30, color: '#0ea5e9' },
    { name: 'Warm', value: 45, color: '#3b82f6' },
    { name: 'Hot', value: 25, color: '#10b981' },
  ];

  // Outreach chart data
  const outreachData = chartData ? chartData.labels.map((label, i) => ({
    day: label,
    value: chartData.data[i] || 0
  })) : [];

  // Transform activity for display
  const recentActivity = activities.map((act, i) => ({
    id: act.id || i,
    name: act.entity_type || "Activity",
    sub: act.action || "",
    initials: act.entity_type?.substring(0, 2).toUpperCase() || "AC",
    type: "app" as const,
    appColor: "bg-blue-600",
    action: act.action || "Action performed",
    status: "Completed",
    statusColor: "blue" as const,
    date: new Date(act.created_at).toLocaleDateString()
  }));

  // Loading state
  if (statsLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (statsError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm text-muted-foreground">Failed to load dashboard data.</p>
          <p className="text-xs text-muted-foreground/60">{statsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-background p-6 text-foreground font-sans transition-colors duration-300">
      <ProfileCompletionModal />
      {/* --- Header --- */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-sm text-muted-foreground">Here is your pipeline health check for the last 7 days.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search leads..."
              className="h-10 rounded-lg border border-input bg-card/50 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-input bg-card/50 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Calendar className="h-4 w-4" />
            Last 7 Days
          </button>
        </div>
      </div>

      {/* --- Stats Row --- */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {displayStats.map((stat, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-blue-500/50">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.title}</span>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <div className="mb-1 text-2xl font-bold text-card-foreground">{stat.value}</div>
            <div className={`text-xs font-medium ${stat.changeColor} flex items-center gap-1`}>
              {stat.trend === 'up' && <span className="inline-block -rotate-45">➜</span>}
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* --- Main Grid --- */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-12">

        {/* Quick Actions (Left Col) */}
        <div className="flex flex-col gap-4 lg:col-span-3">
          <h3 className="text-sm font-bold text-foreground">Quick Actions</h3>

          <ActionCard
            icon={<CloudLightning className="h-5 w-5 text-white" />}
            iconBg="bg-blue-600"
            title="Start Extraction"
            desc="Import list or scrape URL to find prospects."
            action=">"
            active
          />

          <ActionCard
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
            iconBg="bg-emerald-500/10"
            title="View Scored Leads"
            desc={`Review ${stats?.qualified_leads || 0} high-intent leads pending.`}
            action=">"
          />

          <ActionCard
            icon={<Rocket className="h-5 w-5 text-purple-500" />}
            iconBg="bg-purple-500/10"
            title="Launch Campaign"
            desc="Select template and target audience."
            action=">"
          />
        </div>

        {/* Lead Quality Distribution (Center Col) */}
        <div className="rounded-xl border border-border bg-card p-6 lg:col-span-4">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-card-foreground">Performance Analytics</h3>
              <p className="mt-1 text-sm font-medium text-muted-foreground">Lead Quality Distribution</p>
            </div>
            <button className="text-muted-foreground hover:text-foreground">•••</button>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative h-48 w-48 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadQualityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {leadQualityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-card-foreground">
                  {stats?.total_leads ? (stats.total_leads >= 1000 ? `${(stats.total_leads / 1000).toFixed(1)}k` : stats.total_leads) : '0'}
                </span>
                <span className="text-[10px] text-muted-foreground">Total Leads</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <LegendItem label={`Hot (${leadQualityData[2]?.value || 0}%)`} sub="Highly Qualified" color="bg-emerald-500" />
              <LegendItem label={`Warm (${leadQualityData[1]?.value || 0}%)`} sub="Engagement detected" color="bg-blue-500" />
              <LegendItem label={`Cold (${leadQualityData[0]?.value || 0}%)`} sub="No activity" color="bg-sky-500" />
            </div>
          </div>
        </div>

        {/* Outreach Performance (Right Col) */}
        <div className="rounded-xl border border-border bg-card p-6 lg:col-span-5">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-sm font-bold text-card-foreground">Outreach Performance</h3>
            <span className="text-xs text-muted-foreground">Last 7 Days</span>
          </div>

          <div className="h-64 w-full">
            {chartLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : outreachData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={outreachData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(150,150,150,0.05)' }}
                    contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', color: 'var(--popover-foreground)' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Recent Activity Table --- */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Recent Pipeline Activity</h2>
        <button className="text-sm font-medium text-blue-500 hover:text-blue-400">View All</button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 border-b border-border bg-muted/50 px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <div className="col-span-4">Lead / Campaign</div>
          <div className="col-span-4">Action</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Date</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-border">
          {activityLoading ? (
            <div className="px-6 py-8 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentActivity.length > 0 ? (
            recentActivity.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center transition hover:bg-muted/50">
                <div className="col-span-4 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold text-white ${item.appColor}`}>
                    {item.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-card-foreground">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.sub}</div>
                  </div>
                </div>

                <div className="col-span-4 text-sm text-foreground/80">
                  {item.action}
                </div>

                <div className="col-span-2">
                  <StatusBadge status={item.status} color={item.statusColor} />
                </div>

                <div className="col-span-1 text-sm text-muted-foreground">
                  {item.date}
                </div>

                <div className="col-span-1 flex justify-end">
                  <button className="text-muted-foreground hover:text-foreground"><MoreVertical size={16} /></button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-sm text-muted-foreground">
              No recent activity
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// --- Components ---

function ActionCard({ icon, iconBg, title, desc, action, active }: any) {
  return (
    <div className={`group cursor-pointer rounded-xl border p-4 transition-all ${active
      ? 'border-blue-600 bg-blue-600 border-none'
      : 'border-border bg-card hover:border-blue-500/30 hover:bg-accent'
      }`}>
      <div className="flex items-start gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${active ? 'bg-white/20' : iconBg}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className={`text-sm font-bold ${active ? 'text-white' : 'text-card-foreground'}`}>{title}</h4>
          <p className={`mt-1 text-xs ${active ? 'text-blue-100' : 'text-muted-foreground'}`}>{desc}</p>
        </div>
        <div className={`flex h-6 w-6 items-center justify-center rounded-full ${active ? 'bg-white/20 text-white' : 'text-muted-foreground/50'}`}>
          <span className="text-xs">›</span>
        </div>
      </div>
    </div>
  )
}

function LegendItem({ label, sub, color }: any) {
  return (
    <div className="flex items-start gap-2">
      <div className={`mt-1.5 h-2 w-2 rounded-full ${color}`} />
      <div>
        <div className="text-xs font-bold text-card-foreground">{label}</div>
        <div className="text-[10px] text-muted-foreground">{sub}</div>
      </div>
    </div>
  )
}

function StatusBadge({ status, color }: any) {
  let styles = "bg-slate-500/10 text-slate-500";
  if (color === 'emerald') styles = "bg-emerald-500/10 text-emerald-600";
  if (color === 'blue') styles = "bg-blue-500/10 text-blue-600";
  if (color === 'amber') styles = "bg-amber-500/10 text-amber-600";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles}`}>
      <span className={`h-1.5 w-1.5 rounded-full bg-current`}></span>
      {status}
    </span>
  )
}
