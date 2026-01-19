"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Campaign {
    id: string;
    name: string;
    status: string;
    channel: string;
    total_leads: number;
    sent_count: number;
    reply_count: number;
    created_at: string;
    updated_at: string;
}

interface CampaignsResponse {
    campaigns: Campaign[];
    total: number;
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        active: 0,
        totalContacted: 0,
        avgReplyRate: 0,
        meetings: 0
    });

    useEffect(() => {
        async function fetchCampaigns() {
            setIsLoading(true);
            const { data, error } = await api.get<CampaignsResponse>("/api/campaigns");

            if (!error && data) {
                setCampaigns(data.campaigns || []);

                // Calculate stats from campaigns
                const activeCampaigns = (data.campaigns || []).filter(c => c.status === "active" || c.status === "running");
                const totalContacted = (data.campaigns || []).reduce((sum, c) => sum + (c.sent_count || 0), 0);
                const totalReplies = (data.campaigns || []).reduce((sum, c) => sum + (c.reply_count || 0), 0);
                const avgReply = totalContacted > 0 ? ((totalReplies / totalContacted) * 100).toFixed(1) : "0";

                setStats({
                    active: activeCampaigns.length,
                    totalContacted,
                    avgReplyRate: parseFloat(avgReply),
                    meetings: Math.floor(totalReplies * 0.3) // Estimate
                });
            }
            setIsLoading(false);
        }

        fetchCampaigns();
    }, []);

    const handleCreateCampaign = () => {
        toast.info("Campaign creation coming soon!");
    };
    return (
        <div className="flex h-full flex-col overflow-hidden bg-background text-muted-foreground transition-colors duration-300">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-border bg-card px-8 py-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Outreach Campaigns</h1>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                        Manage and optimize your multi-channel outreach strategies across LinkedIn, Email, and AI Calls.
                    </p>
                </div>
                <button
                    onClick={handleCreateCampaign}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-[0_4px_20px_rgba(37,99,255,0.3)] hover:bg-blue-500"
                >
                    <PlusIcon />
                    Create New Campaign
                </button>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8">

                {/* Stats Grid */}
                <div className="mb-8 grid grid-cols-4 gap-4">
                    <Link href="/dashboard/campaigns/active" className="contents">
                        <StatCard
                            label="Active Campaigns"
                            value={isLoading ? "..." : String(stats.active)}
                            trend={`${campaigns.length} total`}
                            trendUp={true}
                            icon={<RocketIcon />}
                            trendType="text"
                        />
                    </Link>
                    <StatCard
                        label="Total Leads Contacted"
                        value={isLoading ? "..." : stats.totalContacted.toLocaleString()}
                        trend="From all campaigns"
                        trendUp={true}
                        icon={<UsersIcon />}
                    />
                    <StatCard
                        label="Avg. Reply Rate"
                        value={isLoading ? "..." : `${stats.avgReplyRate}%`}
                        trend="Across all channels"
                        trendUp={stats.avgReplyRate > 10}
                        icon={<ReplyIcon />}
                    />
                    <StatCard
                        label="Meetings Booked"
                        value={isLoading ? "..." : String(stats.meetings)}
                        trend="Estimated from replies"
                        trendUp={true}
                        icon={<CalendarIcon />}
                    />
                </div>

                {/* Channel Builders */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold text-foreground">Channel Builders</h2>
                        <button className="text-sm font-medium text-blue-500 hover:text-blue-400">View All Integrations</button>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <Link href="/dashboard/campaigns/templates" className="contents">
                            <ChannelCard
                                title="LinkedIn Outreach"
                                desc="Automate connection requests, profile visits, and follow-up sequences safely."
                                activeCount={4}
                                icon={<LinkedInIcon />}
                                gradient="from-blue-600/20 to-cyan-500/5"
                                borderColor="border-blue-500/20"
                                iconBg="bg-blue-500"
                            />
                        </Link>
                        <ChannelCard
                            title="Email Outreach"
                            desc="Cold email sequences with A/B testing, personalization, and deliverability warm-up."
                            activeCount={7}
                            icon={<MailIcon />}
                            gradient="from-emerald-600/20 to-teal-500/5"
                            borderColor="border-emerald-500/20"
                            iconBg="bg-emerald-500"
                        />
                        <ChannelCard
                            title="AI Call Agent"
                            desc="Deploy conversational AI agents to qualify leads over the phone instantly."
                            activeCount={1}
                            icon={<PhoneIcon />}
                            badge="NEW"
                            gradient="from-indigo-600/20 to-purple-500/5"
                            borderColor="border-indigo-500/20"
                            iconBg="bg-white text-black"
                            isAi={true}
                        />
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-lg font-bold text-foreground">Recent Activity</h2>
                        <div className="flex gap-2">
                            <button className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition">Filter</button>
                            <button className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition">Export</button>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card shadow-sm">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 border-b border-border bg-muted/50 px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            <div className="col-span-4">Campaign Name</div>
                            <div className="col-span-2">Channel</div>
                            <div className="col-span-1">Status</div>
                            <div className="col-span-3">Progress</div>
                            <div className="col-span-1">Replied</div>
                            <div className="col-span-1 text-right">Action</div>
                        </div>

                        {/* Rows */}
                        <div className="divide-y divide-border">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : campaigns.length === 0 ? (
                                <div className="py-12 text-center text-muted-foreground">
                                    No campaigns yet. Create your first campaign!
                                </div>
                            ) : (
                                campaigns.slice(0, 5).map((campaign) => {
                                    const replyRate = campaign.sent_count > 0
                                        ? ((campaign.reply_count / campaign.sent_count) * 100).toFixed(1)
                                        : "0";
                                    return (
                                        <ActivityRow
                                            key={campaign.id}
                                            name={campaign.name}
                                            created={`Created ${new Date(campaign.created_at).toLocaleDateString()}`}
                                            channel={campaign.channel || "Email"}
                                            status={campaign.status}
                                            progress={campaign.sent_count}
                                            total={campaign.total_leads}
                                            replied={`${replyRate}%`}
                                            color={campaign.status === "active" || campaign.status === "running" ? "blue" : "amber"}
                                        />
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}


/* --- Components --- */

function StatCard({ label, value, trend, trendUp, icon, trendType = "percent" }: any) {
    return (
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-blue-500/30">
            <div className="flex items-start justify-between mb-4">
                <div className="text-sm font-medium text-muted-foreground">{label}</div>
                <div className="text-blue-500/50">{icon}</div>
            </div>
            <div className="flex items-end gap-3">
                <div className="text-3xl font-bold text-foreground">{value}</div>
                <div className={`text-xs font-medium px-1.5 py-0.5 rounded flex items-center gap-1 bg-emerald-500/10 text-emerald-500`}>
                    {trendType !== 'text' && (trendUp ? '↗' : '↘')} {trend}
                </div>
            </div>
        </div>
    )
}

function ChannelCard({ title, desc, activeCount, icon, gradient, borderColor, iconBg, badge, isAi }: any) {
    // Note: Kept specific gradients but made background theme-aware
    return (
        <div className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-500/30`}>
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20 transition group-hover:opacity-30`}></div>
            {isAi && (
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            )}

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                    <div className={`grid h-10 w-10 place-items-center rounded-lg ${iconBg} ${isAi ? 'text-black' : 'text-white'}`}>
                        {icon}
                    </div>
                    {badge && (
                        <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-400 border border-purple-500/20">
                            {badge}
                        </span>
                    )}
                </div>

                <h3 className="mb-2 text-lg font-bold text-foreground flex items-center gap-2">
                    {title}
                    {badge && !isAi && <span className="text-[10px] bg-secondary px-1 rounded text-muted-foreground">BETA</span>}
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                    {desc}
                </p>

                <div className="mt-auto flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                        {activeCount} Active Campaigns
                    </span>
                    <button className="flex items-center gap-1 text-sm font-medium text-foreground transition hover:gap-2 hover:text-blue-500">
                        Manage <ChevronRightIcon />
                    </button>
                </div>
            </div>
        </div>
    )
}

function ActivityRow({ name, created, channel, status, progress, total, replied, color }: any) {
    let icon = <MailIcon className="h-4 w-4" />;
    let iconColor = "text-blue-400";
    if (channel === 'LinkedIn') { icon = <LinkedInIcon className="h-4 w-4" />; iconColor = "text-sky-400"; }
    else if (channel === 'AI Call') { icon = <PhoneIcon className="h-4 w-4" />; iconColor = "text-purple-400"; }

    let statusStyle = "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
    if (status === 'Paused') statusStyle = "bg-amber-500/10 text-amber-500 border border-amber-500/20";

    const progressPercent = (progress / total) * 100;

    return (
        <div className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-accent/50 transition">
            <div className="col-span-4">
                <div className="text-sm font-medium text-foreground">{name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{created}</div>
            </div>

            <div className="col-span-2">
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <span className={iconColor}>{icon}</span>
                    {channel}
                </div>
            </div>

            <div className="col-span-1">
                <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusStyle}`}>
                    {status}
                </span>
            </div>

            <div className="col-span-3 pr-8">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                    <span className="font-medium text-foreground">{progress.toLocaleString()}</span>
                    <span>/ {total.toLocaleString()}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-secondary">
                    <div className={`h-full rounded-full ${status === 'Paused' ? 'bg-amber-500' : 'bg-blue-600'}`} style={{ width: `${progressPercent}%` }}></div>
                </div>
            </div>

            <div className="col-span-1">
                <span className="text-sm font-medium text-foreground">{replied}</span>
            </div>

            <div className="col-span-1 text-right">
                <button className="text-muted-foreground hover:text-foreground transition">
                    <DotsIcon />
                </button>
            </div>
        </div>
    )
}

/* --- Icons --- */
function PlusIcon({ className }: { className?: string }) { return <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>; }
function RocketIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>; }
function UsersIcon({ className }: { className?: string }) { return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>; }
function ReplyIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7" /><path d="M20 18v-2a4 4 0 0 0-4-4H4" /></svg>; }
function CalendarIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>; }
function ChevronRightIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>; }
function DotsIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>; }

// Channel Icons
function LinkedInIcon({ className }: { className?: string }) { return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>; }
function MailIcon({ className }: { className?: string }) { return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>; }
function PhoneIcon({ className }: { className?: string }) { return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>; }
