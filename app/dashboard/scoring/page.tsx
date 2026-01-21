"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Lead {
    id: string;
    name: string;
    linkedin_url: string;
    title?: string;
    company?: string;
    email?: string;
    score: number;
    status: string;
    source: string;
    enrichment_status: string;
    created_at: string;
}

interface LeadsResponse {
    items: Lead[];
    total: number;
}

interface LeadStats {
    total: number;
    by_status: Record<string, number>;
    by_source: Record<string, number>;
    by_enrichment: Record<string, number>;
    avg_score: number;
}

export default function ScoringPage() {
    const [activeTab, setActiveTab] = useState("All Leads");
    const [leads, setLeads] = useState<Lead[]>([]);
    const [stats, setStats] = useState<LeadStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    // Campaign handling
    const [campaigns, setCampaigns] = useState<{ id: string, name: string }[]>([]);
    const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
    const [isRecalculating, setIsRecalculating] = useState(false);

    useEffect(() => {
        async function loadCampaigns() {
            const res = await api.get<{ items: { id: string, name: string }[] }>("/api/campaigns/");
            if (!res.error && res.data?.items) {
                setCampaigns(res.data.items);
                // Select first campaign by default if available
                if (res.data.items.length > 0) {
                    setSelectedCampaignId(res.data.items[0].id);
                }
            }
        }
        loadCampaigns();
    }, []);

    useEffect(() => {
        // Only fetch if we have a campaign selected or just generic fetch
        // For this page, usually better to wait for campaign ID if we want campaign context
        // But to fallback, we can fetch all if no ID

        async function fetchData() {
            setIsLoading(true);

            let url = "/api/leads?limit=50";
            if (selectedCampaignId) {
                url += `&campaign_id=${selectedCampaignId}`;
            }

            // Fetch leads
            const leadsRes = await api.get<LeadsResponse>(url);
            if (!leadsRes.error && leadsRes.data) {
                setLeads(leadsRes.data.items || []); // Match backend pagination structure
                if (leadsRes.data.items?.length > 0) {
                    setSelectedLead(leadsRes.data.items[0]);
                } else {
                    setSelectedLead(null);
                }
            }

            // Fetch generic stats (or campaign specific if API supported it, keeping generic for now or filtered)
            // Ideally stats endpoint would take campaign_id too.
            const statsRes = await api.get<LeadStats>("/api/leads/stats");
            if (!statsRes.error && statsRes.data) {
                setStats(statsRes.data);
            }

            setIsLoading(false);
        }

        fetchData();
    }, [selectedCampaignId]); // Refetch when campaign changes

    const handleRecalculate = async () => {
        if (!selectedCampaignId) {
            toast.error("Please select a campaign first");
            return;
        }

        setIsRecalculating(true);
        toast.info("Recalculating scores...");

        const res = await api.post(`/api/scoring/campaign/${selectedCampaignId}/recalculate`, {});

        if (!res.error) {
            toast.success("Scores updated successfully!");
            // Refresh data
            // logic same as useEffect, extracted ideally
            // simplified: triggering re-fetch via temp state workarounds or just refetched
            // Quick hack: toggle a dummy state or just call function if extracted.
            // Let's just reload page for now or better, copy paste fetch logic
            window.location.reload();
        } else {
            toast.error("Failed to update scores");
        }
        setIsRecalculating(false);
    };

    // Filter leads based on tab (...)
    const filteredLeads = leads.filter(lead => {
        if (activeTab === "Qualified (80+)") return lead.score >= 80;
        if (activeTab === "Needs Review") return lead.score >= 40 && lead.score < 80;
        return true;
    });

    const qualifiedCount = leads.filter(l => l.score >= 80).length;
    const reviewCount = leads.filter(l => l.score >= 40 && l.score < 80).length;
    const disqualifiedCount = leads.filter(l => l.score < 40).length;

    return (
        <div className="flex h-full flex-col overflow-hidden bg-background text-muted-foreground transition-colors duration-300">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-border bg-card px-8 py-5 transition-colors duration-300">
                <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <span>Intelligence</span>
                        <span className="text-foreground/50">/</span>
                        <span className="text-blue-500">Lead Scoring</span>
                    </div>
                    <h1 className="mt-1 text-2xl font-bold text-foreground">Lead Scoring</h1>

                    {/* Campaign Select */}
                    <div className="mt-3 flex items-center gap-2">
                        <label className="text-sm text-foreground font-medium">Campaign:</label>
                        <select
                            className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-blue-500 focus:outline-none"
                            value={selectedCampaignId}
                            onChange={(e) => setSelectedCampaignId(e.target.value)}
                        >
                            <option value="">Select a Campaign...</option>
                            {campaigns.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleRecalculate}
                        disabled={isRecalculating || !selectedCampaignId}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 shadow-[0_4px_20px_rgba(37,99,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRecalculating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LightningIcon />}
                        {isRecalculating ? "Calculating..." : "Recalculate Scores"}
                    </button>
                </div>
            </header>

            {/* Main Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8">
                {/* Stats Grid - Hide on Lists view if needed, but keeping for now based on context */}
                {activeTab !== "Lists" && (
                    <div className="mb-8 grid grid-cols-4 gap-4">
                        <StatCard
                            label="Average Score"
                            value={isLoading ? "..." : String(Math.round(stats?.avg_score || 0))}
                            trend={`${leads.length} leads`}
                            trendUp={true}
                            icon={<ChartIcon />}
                        />
                        <StatCard
                            label="Qualified Today"
                            value={isLoading ? "..." : String(qualifiedCount)}
                            trend="Score 80+"
                            trendUp={true}
                            icon={<CheckCircleIcon />}
                        />
                        <StatCard
                            label="Pending Analysis"
                            value={isLoading ? "..." : String(reviewCount)}
                            trend="Score 40-79"
                            trendUp={false}
                            icon={<GlassIcon />}
                        />
                        <StatCard
                            label="Disqualified"
                            value={isLoading ? "..." : String(disqualifiedCount)}
                            trend="Score < 40"
                            trendUp={true}
                            icon={<BanIcon />}
                        />
                    </div>
                )}


                {/* Content Layout */}
                <div className="grid grid-cols-12 gap-8">
                    {/* Main Table Column */}
                    <div className={activeTab === "Lists" ? "col-span-12" : "col-span-8"}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex gap-1 p-1 rounded-lg bg-muted/50 border border-border">
                                <TabButton label="Lists" active={activeTab === "Lists"} onClick={() => setActiveTab("Lists")} />
                                <TabButton label="All Leads" active={activeTab === "All Leads"} onClick={() => setActiveTab("All Leads")} />
                                <TabButton label="Qualified (80+)" active={activeTab === "Qualified (80+)"} onClick={() => setActiveTab("Qualified (80+)")} />
                                <TabButton label="Needs Review" active={activeTab === "Needs Review"} onClick={() => setActiveTab("Needs Review")} />
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground text-muted-foreground"><FilterIcon /></button>
                                <button className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground text-muted-foreground"><SortIcon /></button>
                            </div>
                        </div>

                        {activeTab === "Lists" ? (
                            <ListsView leads={leads} isLoading={isLoading} />
                        ) : (
                            <div className="overflow-hidden rounded-xl border border-border bg-card transition-colors duration-300">
                                {/* Table Header */}
                                <div className="grid grid-cols-12 gap-4 border-b border-border bg-muted/30 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <div className="col-span-4">Lead Profile</div>
                                    <div className="col-span-3">Company</div>
                                    <div className="col-span-2">Score</div>
                                    <div className="col-span-2">Status</div>
                                    <div className="col-span-1 text-right">Action</div>
                                </div>

                                {/* Table Rows */}
                                <div className="divide-y divide-border">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : filteredLeads.length === 0 ? (
                                        <div className="py-12 text-center text-muted-foreground">
                                            No leads found. Start extracting leads!
                                        </div>
                                    ) : (
                                        filteredLeads.slice(0, 10).map((lead) => {
                                            const initials = lead.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                                            const avatarColor = lead.score >= 80 ? "bg-amber-500/20 text-amber-500" :
                                                lead.score >= 40 ? "bg-cyan-500/20 text-cyan-500" :
                                                    "bg-rose-500/20 text-rose-500";
                                            const status = lead.score >= 80 ? "Qualified" :
                                                lead.score >= 40 ? "Review" : "Disqualified";
                                            return (
                                                <div key={lead.id} onClick={() => setSelectedLead(lead)} className="cursor-pointer">
                                                    <LeadRow
                                                        name={lead.name}
                                                        role={lead.title || "No title"}
                                                        company={lead.company || "Unknown"}
                                                        score={lead.score}
                                                        status={status}
                                                        avatarInitials={initials}
                                                        avatarColor={avatarColor}
                                                    />
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Pagination Footer */}
                                <div className="flex items-center justify-between px-6 py-4 text-xs text-muted-foreground border-t border-border">
                                    <span>Showing {Math.min(filteredLeads.length, 10)} of {filteredLeads.length} leads</span>
                                    <div className="flex gap-4">
                                        <button className="hover:text-foreground transition">Previous</button>
                                        <button className="hover:text-foreground transition">Next</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar - Hide on Lists view */}
                    {activeTab !== "Lists" && (
                        <div className="col-span-4 space-y-6">
                            {/* Scoring Weights Dropdown */}
                            <div className="flex items-center justify-between rounded-xl border border-border bg-blue-500/5 px-4 py-3 text-sm font-medium text-blue-500">
                                <div className="flex items-center gap-3">
                                    <SlidersIcon />
                                    Scoring Weights
                                </div>
                                <ChevronDownIcon />
                            </div>

                            {/* Lead Analysis Card */}
                            {/* Lead Analysis Card */}
                            {selectedLead ? (
                                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors duration-300">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                            <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                            Lead Analysis
                                        </div>
                                        <div className="flex gap-1">
                                            <button className="h-8 w-8 rounded bg-muted/50 flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-accent-foreground cursor-pointer transition">
                                                <CopyIcon />
                                            </button>
                                            <button className="h-8 w-8 rounded bg-muted/50 flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-accent-foreground cursor-pointer transition">
                                                <ShareIcon />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Score Gauge Area */}
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className={`relative grid h-20 w-20 place-items-center rounded-full border-4 ${selectedLead.score >= 80 ? 'border-emerald-500 bg-emerald-500/10' : selectedLead.score >= 50 ? 'border-amber-500 bg-amber-500/10' : 'border-rose-500 bg-rose-500/10'}`}>
                                            <span className="text-2xl font-bold text-foreground">{selectedLead.score}</span>
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-foreground">
                                                {selectedLead.score >= 80 ? 'Excellent Match' : selectedLead.score >= 50 ? 'Potential Match' : 'Low Match'}
                                            </div>
                                            <div className="text-xs leading-relaxed text-muted-foreground w-40">
                                                {selectedLead.score >= 80
                                                    ? 'Score is in the top 5% of your pipeline based on current ICP.'
                                                    : 'Profile needs further review to determine fit.'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Key Signals */}
                                    <div className="space-y-4">
                                        <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3">Key Signals</div>

                                        <SignalItem
                                            title="Job Title"
                                            desc={`"${selectedLead.title || 'N/A'}" aligns with target persona.`}
                                            match={selectedLead.score >= 60 ? 'high' : 'medium'}
                                        />
                                        <SignalItem
                                            title="Company Fit"
                                            desc={`${selectedLead.company || 'Company'} matches industry criteria.`}
                                            match={selectedLead.score >= 50 ? 'medium' : 'low'}
                                        />
                                        {selectedLead.source && (
                                            <SignalItem
                                                title="Source"
                                                desc={`Extracted from ${selectedLead.source}`}
                                                match="high"
                                            />
                                        )}
                                    </div>

                                    {/* Profile Snippet Placeholder */}
                                    <div className="mt-8 pt-4 border-t border-border">
                                        <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Profile Snippet</div>
                                        <div className="text-xs text-muted-foreground leading-relaxed">
                                            {selectedLead.name} works at <strong>{selectedLead.company}</strong> as a {selectedLead.title}.
                                            {selectedLead.linkedin_url && (
                                                <a href={selectedLead.linkedin_url} target="_blank" rel="noopener noreferrer" className="block mt-2 text-blue-500 hover:underline">
                                                    View LinkedIn Profile
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
                                    <p>Select a lead to view analysis.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* --- Lists View Component --- */
function ListsView({ leads, isLoading }: { leads: Lead[]; isLoading: boolean }) {
    return (
        <div className="overflow-hidden rounded-xl border border-border bg-card transition-colors duration-300">
            {/* Header */}
            <div className="grid grid-cols-[40px_1.5fr_1.5fr_1.5fr_1fr_100px] gap-4 border-b border-border bg-muted/30 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground items-center">
                <div><input type="checkbox" className="h-4 w-4 rounded border-input" /></div>
                <div>Name</div>
                <div>Job</div>
                <div>Company</div>
                <div>Score</div>
                <div className="text-right">Status</div>
            </div>

            {/* List Items */}
            <div className="divide-y divide-border">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : leads.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                        No leads found.
                    </div>
                ) : (
                    leads.slice(0, 10).map((lead) => (
                        <ListItem
                            key={lead.id}
                            name={lead.name}
                            role={lead.title || "No title"}
                            company={lead.company || ""}
                            score={lead.score}
                            avatarColor={lead.score >= 80 ? "bg-emerald-600" : lead.score >= 40 ? "bg-blue-600" : "bg-rose-600"}
                            hasLinkedin={!!lead.linkedin_url}
                            hasEmail={!!lead.email}
                        />
                    ))
                )}
            </div>
        </div>
    )
}



function ListItem({ name, role, company, avatarColor, avatarImg, hasLinkedin, hasMessage, hasEmail }: any) {
    return (
        <div className="grid grid-cols-[40px_1.5fr_1.5fr_1.5fr_1fr_100px] items-center gap-4 px-6 py-4 transition hover:bg-muted/50 group">
            <div><input type="checkbox" className="h-4 w-4 rounded border-input" /></div>

            {/* Name */}
            <div className="flex items-center gap-3">
                {avatarImg ? (
                    <img src={avatarImg} alt={name} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                    <div className={`grid h-8 w-8 place-items-center rounded-full text-[10px] text-white ${avatarColor || 'bg-blue-500'}`}>
                        <AlienHead />
                    </div>
                )}
                <span className="text-sm font-semibold text-foreground">{name}</span>
            </div>

            {/* Job */}
            <div className="text-sm text-muted-foreground">{role}</div>

            {/* Company */}
            <div className="text-sm text-muted-foreground">{company}</div>

            {/* Activity */}
            <div className="flex items-center gap-3 text-muted-foreground/50">
                {hasLinkedin && <span className="text-blue-600 font-bold text-lg"><LinkedinIcon /></span>}
                {hasMessage && <span className="hover:text-foreground"><MessageIcon /></span>}
                {hasEmail && <span className="hover:text-foreground"><EmailIcon /></span>}
            </div>

            {/* Status */}
            <div className="text-right">
                <div className="inline-block h-8 w-16 rounded-lg bg-muted/50 text-center leading-8 text-xs text-muted-foreground">-</div>
            </div>
        </div>
    )
}

function AlienHead() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8 0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8zm-2.5-9c.83 0 1.5-.67 1.5-1.5S10.33 8 9.5 8 8 8.67 8 9.5 8.67 11 9.5 11zm5 0c.83 0 1.5-.67 1.5-1.5S15.33 8 14.5 8 13 8.67 13 9.5 13.67 11 14.5 11z" />
        </svg>
    )
}

function LinkedinIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
    )
}

function MessageIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
    )
}

function EmailIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
    )
}


/* --- Sub-Components --- */

function StatCard({ label, value, trend, trendUp, icon }: any) {
    return (
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-colors duration-300 shadow-sm">
            <div className="absolute right-4 top-4 text-muted-foreground/20">{icon}</div>
            <div className="mb-2 text-sm font-medium text-muted-foreground">{label}</div>
            <div className="flex items-end gap-3">
                <div className="text-3xl font-bold text-foreground">{value}</div>
                <div className={`text-xs font-medium px-1.5 py-0.5 rounded ${trendUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {trendUp ? '↗' : '↘'} {trend}
                </div>
            </div>
        </div>
    );
}

function LeadRow({ name, role, company, score, status, avatarInitials, avatarColor }: any) {
    let scoreColor = "text-muted-foreground";
    if (score >= 80) scoreColor = "text-blue-500";
    else if (score >= 50) scoreColor = "text-amber-500";
    else scoreColor = "text-rose-500"; // Low score

    let statusStyle = "bg-slate-800 text-slate-400";
    if (status === "Qualified") statusStyle = "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
    else if (status === "Review") statusStyle = "bg-amber-500/10 text-amber-500 border border-amber-500/20";
    else if (status === "Disqualified") statusStyle = "bg-rose-500/10 text-rose-500 border border-rose-500/20";

    return (
        <div className="group grid grid-cols-12 items-center gap-4 px-6 py-4 transition hover:bg-muted/50">
            {/* Profile */}
            <div className="col-span-4 flex items-center gap-3">
                <div className="grid h-5 w-5 place-items-center rounded-full border border-border bg-muted/50 text-xs text-muted-foreground">
                    {/* Radio-like check */}
                </div>
                <div className={`grid h-10 w-10 place-items-center rounded-full text-xs font-bold ${avatarColor}`}>
                    {avatarInitials}
                </div>
                <div>
                    <div className="text-sm font-semibold text-foreground">{name}</div>
                    <div className="text-xs text-muted-foreground">{role}</div>
                </div>
            </div>

            {/* Company */}
            <div className="col-span-3">
                <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded bg-muted/50 flex items-center justify-center text-[10px] text-muted-foreground/70">{company[0]}</div>
                    <span className="text-sm text-muted-foreground">{company}</span>
                </div>
            </div>

            {/* Score */}
            <div className="col-span-2">
                <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${scoreColor}`}>{score}</span>
                    {/* Mini Pie Chart Placeholder */}
                    <div className="h-5 w-5 rounded-full border-2 border-muted" style={{ borderTopColor: score > 80 ? '#3b82f6' : score > 50 ? '#f59e0b' : '#f43f5e' }}></div>
                </div>
            </div>

            {/* Status */}
            <div className="col-span-2">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wide ${statusStyle}`}>
                    {status}
                </span>
            </div>

            {/* Action */}
            <div className="col-span-1 text-right">
                <button className="text-muted-foreground hover:text-foreground transition">
                    <ChevronRightIcon />
                </button>
            </div>
        </div>
    );
}

function SignalItem({ title, desc, match }: any) {
    const iconColor = match === 'high' ? 'text-emerald-500' : 'text-blue-500';
    const bgColor = match === 'high' ? 'bg-emerald-500/10' : 'bg-blue-500/10';

    return (
        <div className={`p-3 rounded-lg border border-border bg-card transition-colors ${match === 'high' ? 'hover:bg-emerald-500/[0.05]' : 'hover:bg-muted/30'}`}>
            <div className="flex items-start gap-3">
                <div className={`mt-0.5 grid h-4 w-4 place-items-center rounded-full ${bgColor} ${iconColor}`}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <div>
                    <div className="text-sm font-semibold text-foreground">{title}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">{desc}</div>
                </div>
            </div>
        </div>
    )
}

function TabButton({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={[
                "rounded-md px-3 py-1.5 text-xs font-medium transition",
                active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            ].join(" ")}
        >
            {label}
        </button>
    );
}


/* --- Icons --- */

function UploadIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
    );
}

function LightningIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
    );
}

function ChartIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    )
}

function CheckCircleIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    )
}

function GlassIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    )
}

function BanIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
    )
}

function FilterIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
    )
}

function SortIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
        </svg>
    )
}

function ChevronRightIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
        </svg>
    )
}

function ChevronDownIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
        </svg>
    )
}

function SlidersIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
    )
}


function CopyIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
    )
}

function ShareIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
    )
}
