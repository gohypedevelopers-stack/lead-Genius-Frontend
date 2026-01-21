"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

interface Lead {
    id: string;
    name: string;
    title?: string;
    company?: string;
    linkedin_url?: string;
    email?: string;
    score: number;
    status: string;
    enrichment_status: string;
    enriched_at?: string;
    company_industry?: string;
    mobile_phone?: string;
}

interface LeadStats {
    total: number;
    enriched: number;
    enriched_today?: number;
    needs_review?: number;
    success_rate?: number;
}

export default function EnrichmentPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [stats, setStats] = useState<LeadStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
    const [isEnriching, setIsEnriching] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [leadsRes, statsRes] = await Promise.all([
                api.get<{ items: Lead[] }>("/api/leads?limit=50"),
                api.get<LeadStats>("/api/leads/stats")
            ]);

            if (leadsRes.data) {
                setLeads(leadsRes.data.items || []);
            }
            if (statsRes.data) {
                setStats(statsRes.data);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.error("Failed to load enrichment data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedLeads(new Set(leads.map(l => l.id)));
        } else {
            setSelectedLeads(new Set());
        }
    };

    const handleSelectLead = (id: string) => {
        const newSelected = new Set(selectedLeads);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedLeads(newSelected);
    };

    const handleBulkEnrich = async () => {
        if (selectedLeads.size === 0) return;

        setIsEnriching(true);
        toast.info(`Enriching ${selectedLeads.size} leads...`);

        const res = await api.post("/api/leads/bulk-enrich", {
            lead_ids: Array.from(selectedLeads)
        });

        if (!res.error) {
            toast.success("Enrichment process started!");
            await fetchData(); // Refresh data
            setSelectedLeads(new Set());
        } else {
            toast.error("Failed to start enrichment");
        }
        setIsEnriching(false);
    };

    const handleSingleEnrich = async (id: string) => {
        toast.info("Enriching lead...");
        const res = await api.post(`/api/leads/${id}/enrich`, {});
        if (!res.error) {
            toast.success("Lead enriched!");
            fetchData();
        } else {
            toast.error("Enrichment failed");
        }
    };

    const enrichedToday = stats?.enriched_today || 0;
    const successRate = stats?.success_rate || 0;

    return (
        <div className="flex h-full flex-col overflow-hidden bg-background text-muted-foreground transition-colors duration-300">
            {/* Header */}
            <header className="flex items-start justify-between border-b border-border bg-card px-8 py-6 transition-colors duration-300">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Lead Enrichment</h1>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                        Manage your enrichment pipeline. Review profile-only leads and unlock
                        verified contact data to start your outreach.
                    </p>
                </div>

                {/* Credit Usage Box (Mock Data for specific credits) */}
                <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-1.5 pr-2 transition-colors duration-300">
                    <div className="px-3 py-1">
                        <div className="flex items-center justify-between gap-4 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                            <span>Renewing in 12 days</span>
                            <span className="text-foreground">450 / 1,000 Used</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="mt-1.5 h-1.5 w-48 rounded-full bg-secondary">
                            <div className="h-full w-[45%] rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,255,0.4)]"></div>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition hover:bg-primary/90">
                        <PlusIcon className="h-3 w-3" />
                        Buy Credits
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8">

                {/* Stats Grid */}
                <div className="mb-8 grid grid-cols-4 gap-4">
                    <StatCard
                        label="Total Leads in Pipeline"
                        value={isLoading ? "..." : String(stats?.total || 0)}
                        trend="+12%"
                        trendUp={true}
                        icon={<UsersIcon />}
                    />
                    <StatCard
                        label="Enriched Today"
                        value={isLoading ? "..." : String(enrichedToday)}
                        subtext="leads unlocked"
                        icon={<CheckCircleIcon />}
                    />
                    <StatCard
                        label="Avg. Success Rate"
                        value={isLoading ? "..." : `${successRate}%`}
                        trend="vs last week"
                        trendUp={true}
                        trendLabel="high"
                        icon={<TargetIcon />}
                    />
                    <StatCard
                        label="Needs Review"
                        value={isLoading ? "..." : String(stats?.needs_review || 0)}
                        alertText={stats?.needs_review && stats.needs_review > 0 ? "Requires manual check" : null}
                        icon={<AlertIcon />}
                    />
                </div>

                {/* Action Toolbar */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search leads by name, company..."
                                className="h-10 w-80 rounded-lg border border-input bg-background/50 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                            />
                        </div>

                        <div className="h-6 w-px bg-border mx-1"></div>

                        <FilterDropdown label="Status" value="All" />
                        <FilterDropdown label="Confidence" value="Any" />
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 rounded-lg border border-input bg-background/50 px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition">
                            <DownloadIcon />
                            Export
                        </button>
                        <button
                            onClick={handleBulkEnrich}
                            disabled={selectedLeads.size === 0 || isEnriching}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-[0_4px_20px_rgba(37,99,255,0.3)] transition
                                ${selectedLeads.size === 0 || isEnriching ? "bg-blue-600/50 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"}
                            `}
                        >
                            {isEnriching ? <Loader2 className="h-4 w-4 animate-spin" /> : <LightningIcon />}
                            Enrich Selected ({selectedLeads.size})
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="rounded-xl border border-border bg-card transition-colors duration-300">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-4 border-b border-border bg-muted/30 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <div className="col-span-1 flex items-center">
                            <input
                                type="checkbox"
                                onChange={handleSelectAll}
                                checked={leads.length > 0 && selectedLeads.size === leads.length}
                                className="h-4 w-4 rounded border-border bg-muted/50"
                            />
                        </div>
                        <div className="col-span-3">Lead Profile</div>
                        <div className="col-span-2">Company</div>
                        <div className="col-span-2">Enrichment Status</div>
                        <div className="col-span-2">Unlocked Data</div>
                        <div className="col-span-2 text-right">Confidence</div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-border">
                        {isLoading ? (
                            <div className="py-12 flex justify-center items-center">
                                <Loader2 className="animate-spin text-muted-foreground" />
                            </div>
                        ) : leads.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">No leads found.</div>
                        ) : (
                            leads.map((lead) => (
                                <EnrichmentRow
                                    key={lead.id}
                                    lead={lead}
                                    selected={selectedLeads.has(lead.id)}
                                    onSelect={() => handleSelectLead(lead.id)}
                                    onEnrich={() => handleSingleEnrich(lead.id)}
                                />
                            ))
                        )}
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex items-center justify-between px-6 py-4 text-xs text-muted-foreground border-t border-border">
                        <span>Showing {leads.length} leads</span>
                        <div className="flex gap-2">
                            {/* Simple Nav Buttons */}
                            <button className="h-7 w-7 rounded bg-muted/50 hover:bg-accent flex items-center justify-center transition hover:text-accent-foreground"><ChevronLeftIcon /></button>
                            <button className="h-7 w-7 rounded bg-muted/50 hover:bg-accent flex items-center justify-center transition hover:text-accent-foreground"><ChevronRightIcon /></button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

/* --- Components --- */

function StatCard({ label, value, trend, subtext, trendUp, trendLabel, alertText, icon }: any) {
    return (
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 group transition-colors duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className="text-sm font-medium text-muted-foreground">{label}</div>
                <div className="text-muted-foreground/30">{icon}</div>
            </div>

            <div className="flex items-end gap-3">
                <div className="text-3xl font-bold text-foreground">{value}</div>
                {trend && (
                    <div className={`text-xs font-medium px-1.5 py-0.5 rounded flex items-center gap-1 ${trendLabel === 'high' ? 'bg-emerald-500/10 text-emerald-500' : trendUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {trendUp && '↗'} {trend}
                    </div>
                )}
                {subtext && (
                    <div className="text-xs text-muted-foreground pb-1">{subtext}</div>
                )}
            </div>

            {alertText && (
                <div className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-amber-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    {alertText}
                </div>
            )}
        </div>
    )
}

function FilterDropdown({ label, value }: { label: string, value: string }) {
    return (
        <button className="flex items-center gap-2 rounded-lg border border-input bg-background/50 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition">
            <span>{label}:</span>
            <span className="text-foreground">{value}</span>
            <ChevronDownIcon className="ml-1 h-3 w-3 opacity-50" />
        </button>
    )
}

function EnrichmentRow({ lead, selected, onSelect, onEnrich }: { lead: Lead, selected: boolean, onSelect: () => void, onEnrich: () => void }) {
    // Helpers
    const initials = lead.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    const avatarBg = lead.score >= 80 ? "bg-amber-500/20 text-amber-500" : "bg-blue-500/20 text-blue-500";

    // Status logic
    let statusBadge = <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-muted-foreground/30 bg-muted/50 text-muted-foreground">Ready to Enrich</span>;
    if (lead.enrichment_status === 'enriched') {
        statusBadge = <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">Enriched</span>
    } else if (lead.enrichment_status === 'failed') {
        statusBadge = <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-rose-500/20 bg-rose-500/10 text-rose-500">Failed</span>
    }

    // Pseudo confidence based on score for demo
    const confidence = lead.score;
    let confidenceColor = "bg-emerald-500";
    if (confidence < 50) confidenceColor = "bg-rose-500";
    else if (confidence < 80) confidenceColor = "bg-amber-500";

    const isEnriched = lead.enrichment_status === 'enriched';

    return (
        <div className={`grid grid-cols-12 gap-4 px-6 py-4 items-center group transition hover:bg-muted/50 ${selected ? 'bg-blue-500/[0.05]' : ''}`}>
            <div className="col-span-1">
                <div
                    onClick={onSelect}
                    className={`h-4 w-4 rounded border flex items-center justify-center transition cursor-pointer ${selected ? 'bg-blue-600 border-blue-600 text-white' : 'border-border bg-muted/30'}`}
                >
                    {selected && <CheckIcon className="h-3 w-3" />}
                </div>
            </div>

            {/* Profile */}
            <div className="col-span-3 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold ${avatarBg}`}>
                    {initials}
                </div>
                <div>
                    <div className="text-sm font-semibold text-foreground">{lead.name}</div>
                    <div className="text-xs text-muted-foreground">{lead.title || "No Title"}</div>
                </div>
            </div>

            {/* Company */}
            <div className="col-span-2">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-muted/50 flex items-center justify-center text-xs font-bold text-muted-foreground/80">
                        <TileIcon />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-foreground/80">{lead.company || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[100px]">{lead.linkedin_url || "-"}</div>
                    </div>
                </div>
            </div>

            {/* Status */}
            <div className="col-span-2">
                <div className="flex items-center gap-2">
                    {statusBadge}
                    {!isEnriched && lead.enrichment_status !== 'failed' && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onEnrich(); }}
                            className="ml-2 flex items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 opacity-0 shadow-sm ring-1 ring-inset ring-blue-600/20 transition group-hover:opacity-100 hover:bg-blue-100 hover:text-blue-700"
                        >
                            <LightningIcon />
                            Enrich
                        </button>
                    )}
                </div>
            </div>

            {/* Unlocked Data */}
            <div className="col-span-2 text-xs">
                {isEnriched ? (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MailIcon className="h-3 w-3" />
                            {lead.email || "No Email"}
                        </div>
                        {lead.mobile_phone && (
                            <div className="flex items-center gap-2 text-emerald-500/80">
                                <PhoneIcon className="h-3 w-3" />
                                {lead.mobile_phone}
                            </div>
                        )}
                    </div>
                ) : lead.enrichment_status === 'failed' ? (
                    <span className="text-muted-foreground italic">No data found</span>
                ) : (
                    <span className="text-muted-foreground/50 italic">Locked</span>
                )}
            </div>

            {/* Confidence */}
            <div className="col-span-2 text-right">
                <div className="flex items-center justify-end gap-3">
                    <div className="h-1.5 w-24 rounded-full bg-secondary">
                        <div className={`h-full rounded-full ${confidenceColor}`} style={{ width: `${confidence}%` }}></div>
                    </div>
                    <span className={`text-xs font-bold w-8 ${confidence >= 80 ? 'text-emerald-500' : confidence >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>{confidence}%</span>
                </div>
            </div>
        </div>
    )
}


/* --- Icons --- */

function PlusIcon({ className }: { className?: string }) { return <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>; }
function SearchIcon({ className }: { className?: string }) { return <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>; }
function ChevronDownIcon({ className }: { className?: string }) { return <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>; }
function DownloadIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>; }
function LightningIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>; }
function CheckIcon({ className }: { className?: string }) { return <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>; }
function MailIcon({ className }: { className?: string }) { return <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>; }
function PhoneIcon({ className }: { className?: string }) { return <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>; }
function AlertSmallIcon({ className }: { className?: string }) { return <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>; }
function ChevronLeftIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>; }
function ChevronRightIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>; }

// Stat Icons
function UsersIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>; }
function CheckCircleIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>; }
function TargetIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>; }
function AlertIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>; }

// Logos
function CloudIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /></svg>; }
function TileIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /></svg>; }
