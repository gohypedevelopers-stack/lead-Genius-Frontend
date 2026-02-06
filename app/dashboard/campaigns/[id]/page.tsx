"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import {
    Loader2,
    ArrowLeft,
    Calendar,
    Users,
    MessageSquare,
    CheckCircle2,
    Briefcase,
    Mail,
    Phone,
    ExternalLink,
    Search,
    Filter,
    Trash2,
    Download,
    Linkedin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import LinkedInStatusBadge from "@/components/linkedin/LinkedInStatusBadge";
import BatchLinkedInMessaging from "@/components/linkedin/BatchLinkedInMessaging";

interface Campaign {
    id: string;
    name: string;
    status: string;
    type: string;
    leads_count: number;
    contacted_count: number;
    replied_count: number;
    created_at: string;
    updated_at: string;
    settings?: any;
}

interface Lead {
    id: string;
    name: string;
    title?: string;
    company?: string;
    email?: string;
    phone?: string;
    linkedin_url?: string;
    score: number;
    status: string;
    source: string;
    created_at: string;
    enrichment_status?: string;
}

interface LeadsResponse {
    items: Lead[];
    total: number;
    page: number;
    pages: number;
}

export default function CampaignDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const campaignId = params.id as string;

    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [leadsLoading, setLeadsLoading] = useState(true);

    // Multi-select state
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

    // Batch LinkedIn Dialog State
    const [showBatchLinkedIn, setShowBatchLinkedIn] = useState(false);

    // Pagination & Filter (Simple for now)
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        async function fetchCampaign() {
            try {
                const { data, error } = await api.get<Campaign>(`/api/campaigns/${campaignId}`);
                if (data) {
                    setCampaign(data);
                } else if (error) {
                    toast.error("Failed to load campaign");
                    router.push("/dashboard/campaigns");
                }
            } catch (err) {
                console.error(err);
                toast.error("Error loading campaign");
            } finally {
                setIsLoading(false);
            }
        }
        fetchCampaign();
    }, [campaignId, router]);

    useEffect(() => {
        async function fetchLeads() {
            setLeadsLoading(true);
            try {
                const query = new URLSearchParams({
                    campaign_id: campaignId,
                    page: page.toString(),
                    limit: "50",
                    search: searchTerm
                });
                const { data } = await api.get<LeadsResponse>(`/api/leads?${query.toString()}`);
                if (data) {
                    setLeads(data.items);
                }
            } catch (err) {
                console.error("Failed to load leads", err);
            } finally {
                setLeadsLoading(false);
            }
        }

        // Debounce if search term changes, immediate otherwise
        const timer = setTimeout(fetchLeads, searchTerm ? 500 : 0);
        return () => clearTimeout(timer);
    }, [campaignId, page, searchTerm]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedLeads(leads.map(lead => lead.id));
        } else {
            setSelectedLeads([]);
        }
    };

    const handleSelectLead = (leadId: string, checked: boolean) => {
        if (checked) {
            setSelectedLeads(prev => [...prev, leadId]);
        } else {
            setSelectedLeads(prev => prev.filter(id => id !== leadId));
        }
    };

    const handleBulkAction = (action: 'delete' | 'export') => {
        toast.info(`Bulk ${action} for ${selectedLeads.length} items coming soon`);
        // Implementation for API call would go here
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!campaign) return null;

    // Filter leads for batch messaging
    const selectedLeadsObjects = leads.filter(l => selectedLeads.includes(l.id));

    return (
        <div className="flex h-full flex-col overflow-hidden bg-background text-foreground animate-in fade-in duration-300">
            {/* Header */}
            <div className="border-b border-border bg-card px-8 py-6">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">{campaign.name}</h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${campaign.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
                                campaign.status === 'completed' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'
                                }`}>
                                {campaign.status}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" /> Created {new Date(campaign.created_at).toLocaleDateString()}
                            </span>
                            <span className="capitalize flex items-center gap-1">
                                {campaign.type === 'linkedin' ? <Briefcase className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                                {campaign.type}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4 mt-6">
                    <StatBox label="Total Leads" value={campaign.leads_count} icon={<Users className="h-4 w-4" />} />
                    <StatBox label="Contacted" value={campaign.contacted_count} icon={<Mail className="h-4 w-4" />} />
                    <StatBox label="Replied" value={campaign.replied_count} icon={<MessageSquare className="h-4 w-4" />} />
                    <StatBox label="Reply Rate" value={`${campaign.contacted_count ? ((campaign.replied_count / campaign.contacted_count) * 100).toFixed(1) : 0}%`} icon={<CheckCircle2 className="h-4 w-4" />} />
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-hidden p-8 flex flex-col gap-6">

                {/* Configuration (Collapsible or Card) */}
                {campaign.settings && (
                    <div className="rounded-xl border border-border bg-card p-6">
                        <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Configuration</h3>
                        <div className="grid grid-cols-2 gap-y-2 gap-x-8 text-sm">
                            {Object.entries(campaign.settings).map(([key, val]) => (
                                <div key={key} className="flex justify-between border-b border-border/50 py-2 last:border-0">
                                    <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                                    <span className="font-mono text-foreground truncate max-w-[300px]" title={String(val)}>
                                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Leads Table Section */}
                <div className="flex-1 flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-sm relative">

                    {/* Bulk Actions Overlay */}
                    {selectedLeads.length > 0 && (
                        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between bg-primary/5 px-4 py-3 border-b border-primary/20 backdrop-blur-sm animate-in slide-in-from-top-2 fade-in">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                                    {selectedLeads.length} Selected
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    className="h-8 gap-2 bg-[#0077b5] hover:bg-[#006396] text-white border-none"
                                    onClick={() => setShowBatchLinkedIn(true)}
                                >
                                    <Linkedin className="h-3.5 w-3.5" /> LinkedIn Outreach
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 gap-2 bg-background/50 border-primary/20 hover:bg-primary/5" onClick={() => handleBulkAction('export')}>
                                    <Download className="h-3.5 w-3.5" /> Export
                                </Button>
                                <Button size="sm" variant="destructive" className="h-8 gap-2" onClick={() => handleBulkAction('delete')}>
                                    <Trash2 className="h-3.5 w-3.5" /> Delete
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
                        <h2 className="font-bold text-lg">Campaign Leads</h2>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search leads..."
                                    className="pl-9 h-9 bg-background"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="sm" className="h-9 gap-2">
                                <Filter className="h-3.5 w-3.5" /> Filter
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 text-xs uppercase font-semibold text-muted-foreground sticky top-0 z-10 backdrop-blur-md">
                                <tr>
                                    <th className="px-6 py-3 w-[50px]">
                                        <Checkbox
                                            checked={leads.length > 0 && selectedLeads.length === leads.length}
                                            onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                                        />
                                    </th>
                                    <th className="px-6 py-3">Lead Name</th>
                                    <th className="px-6 py-3">Company</th>
                                    <th className="px-6 py-3">Score</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {leadsLoading ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                        </td>
                                    </tr>
                                ) : leads.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-muted-foreground">
                                            No leads found for this campaign.
                                        </td>
                                    </tr>
                                ) : (
                                    leads.map(lead => (
                                        <tr key={lead.id} className={`hover:bg-muted/30 transition-colors ${selectedLeads.includes(lead.id) ? "bg-blue-50/50 hover:bg-blue-50/80" : ""}`}>
                                            <td className="px-6 py-4">
                                                <Checkbox
                                                    checked={selectedLeads.includes(lead.id)}
                                                    onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-foreground">{lead.name}</div>
                                                <div className="text-xs text-muted-foreground">{lead.title}</div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {lead.company || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`font-bold ${lead.score >= 80 ? 'text-emerald-500' :
                                                    lead.score >= 50 ? 'text-amber-500' : 'text-muted-foreground'
                                                    }`}>
                                                    {lead.score}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize border ${lead.status === 'qualified' ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' :
                                                    lead.status === 'interested' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                                        'bg-slate-500/10 text-slate-600 border-slate-500/20'
                                                    }`}>
                                                    {lead.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {lead.linkedin_url && (
                                                        <a
                                                            href={lead.linkedin_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition"
                                                        >
                                                            <Briefcase className="h-4 w-4" />
                                                        </a>
                                                    )}
                                                    <Link href={`/dashboard/crm/${lead.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Batch LinkedIn Modal */}
            <Dialog open={showBatchLinkedIn} onOpenChange={setShowBatchLinkedIn}>
                <DialogContent className="sm:max-w-2xl p-0 overflow-hidden h-[80vh] flex flex-col">
                    <BatchLinkedInMessaging
                        leads={selectedLeadsObjects}
                        onCancel={() => setShowBatchLinkedIn(false)}
                        onComplete={(results) => {
                            setShowBatchLinkedIn(false);
                            // Deselect leads processed successfully? or keep valid selection?
                            // For now, keep selection so user can see what they selected
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

function StatBox({ label, value, icon }: { label: string, value: any, icon: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4 shadow-sm">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                {icon}
            </div>
            <div>
                <div className="text-2xl font-bold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</div>
            </div>
        </div>
    )
}
