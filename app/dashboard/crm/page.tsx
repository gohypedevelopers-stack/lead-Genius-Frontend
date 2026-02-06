"use client";

import React, { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { Loader2, Plus, Search, Filter, Bell, Briefcase, Mail, Phone, MoreHorizontal, User, ExternalLink, Download, Upload, Linkedin, Send, List as ListIcon, LayoutGrid, Rocket, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import LinkedInMessaging from "@/components/linkedin/LinkedInMessaging";
import BatchLinkedInMessaging from "@/components/linkedin/BatchLinkedInMessaging";
import LinkedInStatusBadge from "@/components/linkedin/LinkedInStatusBadge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { KanbanBoard, Lead } from "@/components/crm/KanbanBoard";


interface Campaign {
    id: string;
    name: string;
    status: string;
    type: string;
    leads_count: number;
    contacted_count: number;
    replied_count: number;
    created_at: string;
}

interface LeadsResponse {
    items: Lead[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}

interface LeadStats {
    total: number;
    by_status: Record<string, number>;
    avg_score: number;
}

export default function CRMPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [stats, setStats] = useState<LeadStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    // View Mode (List/Kanban)
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

    // Campaigns for Dashboard Header
    const [latestCampaigns, setLatestCampaigns] = useState<Campaign[]>([]);
    const [campaignsLoading, setCampaignsLoading] = useState(true);

    // Filters & Pagination State
    const [activeFilter, setActiveFilter] = useState("All"); // Maps to status
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Create Modal State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newLead, setNewLead] = useState({
        name: "",
        email: "",
        company: "",
        title: "",
        linkedin_url: "",
        phone: ""
    });

    // LinkedIn Messaging State
    const [linkedInModalOpen, setLinkedInModalOpen] = useState(false);
    const [linkedInModalLead, setLinkedInModalLead] = useState<Lead | null>(null);
    const [batchLinkedInModalOpen, setBatchLinkedInModalOpen] = useState(false);
    const [selectedLeadsForBatch, setSelectedLeadsForBatch] = useState<Set<string>>(new Set());

    // Helper: Select/Deselect lead for batch
    const toggleLeadSelection = (leadId: string) => {
        setSelectedLeadsForBatch(prev => {
            const newSet = new Set(prev);
            if (newSet.has(leadId)) {
                newSet.delete(leadId);
            } else {
                newSet.add(leadId);
            }
            return newSet;
        });
    };

    const openLinkedInModal = (lead: Lead) => {
        if (!lead.linkedin_url) {
            toast.error("This lead doesn't have a LinkedIn URL");
            return;
        }
        setLinkedInModalLead(lead);
        setLinkedInModalOpen(true);
    };

    const openBatchLinkedInModal = () => {
        const selectedLeadObjects = leads.filter(l => selectedLeadsForBatch.has(l.id));
        const leadsWithLinkedIn = selectedLeadObjects.filter(l => l.linkedin_url);

        if (leadsWithLinkedIn.length === 0) {
            toast.error("Selected leads don't have LinkedIn URLs");
            return;
        }

        setBatchLinkedInModalOpen(true);
    };

    const fetchLeads = useCallback(async () => {
        setIsLoading(true);
        try {
            // Build query params
            const params = new URLSearchParams();
            params.append("page", page.toString());
            params.append("limit", "20");

            if (activeFilter !== "All") {
                params.append("status", activeFilter.toLowerCase());
            }

            if (searchTerm) {
                params.append("search", searchTerm);
            }

            const leadsRes = await api.get<LeadsResponse>(`/api/leads?${params.toString()}`);
            if (!leadsRes.error && leadsRes.data) {
                setLeads(leadsRes.data.items || []);
                setTotalPages(leadsRes.data.pages || 1);

                // Select first lead if none selected or current selection not in list (optional)
                if (!selectedLead && leadsRes.data.items?.length > 0) {
                    setSelectedLead(leadsRes.data.items[0]);
                }
            }

            const statsRes = await api.get<LeadStats>("/api/leads/stats");
            if (!statsRes.error && statsRes.data) {
                setStats(statsRes.data);
            }

        } catch (error) {
            console.error("Failed to fetch leads", error);
            toast.error("Failed to fetch leads");
        } finally {
            setIsLoading(false);
        }
    }, [page, activeFilter, searchTerm, selectedLead]);

    // Fetch Campaigns
    useEffect(() => {
        async function fetchCampaigns() {
            try {
                const res = await api.get<{ items: Campaign[] }>("/api/campaigns");
                if (res.data?.items) {
                    const sorted = res.data.items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                    setLatestCampaigns(sorted.slice(0, 3));
                }
            } catch (error) {
                console.error("Failed to fetch campaigns", error);
            } finally {
                setCampaignsLoading(false);
            }
        }
        fetchCampaigns();
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLeads();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchLeads]);


    const handleCreateLead = async () => {
        if (!newLead.name || !newLead.linkedin_url) {
            toast.error("Name and LinkedIn URL are required");
            return;
        }

        try {
            const res = await api.post("/api/leads", newLead);
            if (res.error) {
                toast.error(res.error.detail || "Failed to create lead");
            } else {
                toast.success("Lead created successfully");
                setIsCreateOpen(false);
                setNewLead({ name: "", email: "", company: "", title: "", linkedin_url: "", phone: "" });
                fetchLeads(); // Refresh list
            }
        } catch (err) {
            toast.error("An error occurred");
        }
    };

    const handleStatusChange = async (leadId: string, newStatus: string) => {
        try {
            const res = await api.patch(`/api/leads/${leadId}`, { status: newStatus });
            if (res.error) {
                toast.error("Failed to update status");
            } else {
                toast.success("Status updated");
                // Update local state
                setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
                if (selectedLead?.id === leadId) setSelectedLead({ ...selectedLead, status: newStatus });
            }
        } catch (err) {
            toast.error("Error updating status");
        }
    };

    const handleDeleteLead = async (leadId: string) => {
        if (!confirm("Are you sure you want to delete this lead?")) return;
        try {
            await api.delete(`/api/leads/${leadId}`);
            toast.success("Lead deleted");
            setLeads(leads.filter(l => l.id !== leadId));
            if (selectedLead?.id === leadId) setSelectedLead(null);
        } catch (err) {
            toast.error("Error deleting lead");
        }
    };

    const handleExportLeads = () => {
        const params = new URLSearchParams();
        if (activeFilter !== "All") {
            params.append("status", activeFilter.toLowerCase());
        }
        const url = `/api/leads/export?${params.toString()}`;
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        window.open(`${API_BASE_URL}${url}`, '_blank');
        toast.success("Export started!");
    };

    const handleImportLeads = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/leads/import`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                toast.success(`Imported ${data.created || 0} leads successfully!`);
                fetchLeads(); // Refresh the list
            } else {
                toast.error("Failed to import leads");
            }
        } catch (error) {
            toast.error("Error importing leads");
        }
        // Reset file input
        event.target.value = '';
    };

    // Calculate local counts for tabs (approximation, ideal is backend)
    const interestedCount = stats?.by_status?.['interested'] || 0;
    const followUpCount = stats?.by_status?.['contacted'] || 0; // Assuming contacted maps to follow-up roughly

    // Filtered leads for list/kanban view
    const filteredLeads = leads.filter(lead => {
        const matchesSearch = searchTerm ?
            (lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.title?.toLowerCase().includes(searchTerm.toLowerCase())) : true;
        const matchesFilter = activeFilter === "All" ? true : lead.status.toLowerCase() === activeFilter.toLowerCase();
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex h-full flex-col overflow-hidden bg-background text-muted-foreground transition-colors duration-300">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4 transition-colors duration-300">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="hover:text-foreground cursor-pointer">Home</span>
                    <span>/</span>
                    <span className="text-foreground">CRM Pipeline</span>
                </div>
                <div className="flex gap-2">
                    {/* View Toggle */}
                    <div className="flex items-center bg-card border border-border rounded-lg p-1 mr-2">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-blue-600/10 text-blue-500 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            title="List View"
                        >
                            <ListIcon className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-blue-600/10 text-blue-500 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            title="Kanban View"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                    </div>

                    <button className="relative p-2 text-muted-foreground hover:text-foreground">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border border-background"></span>
                    </button>

                    {/* Batch LinkedIn Message Button */}
                    {selectedLeadsForBatch.size > 0 && (
                        <Button
                            onClick={openBatchLinkedInModal}
                            variant="outline"
                            className="flex items-center gap-2 border-[#0077b5] text-[#0077b5] hover:bg-[#0077b5] hover:text-white"
                        >
                            <Linkedin className="h-4 w-4" />
                            LinkedIn Message ({selectedLeadsForBatch.size})
                        </Button>
                    )}

                    {/* Export Button */}
                    <Button onClick={handleExportLeads} variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>

                    {/* Import Button */}
                    <label htmlFor="import-leads" className="cursor-pointer">
                        <input
                            id="import-leads"
                            type="file"
                            accept=".csv"
                            onChange={handleImportLeads}
                            className="hidden"
                        />
                        <Button type="button" variant="outline" className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Import CSV
                        </Button>
                    </label>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                                <Plus className="h-4 w-4" />
                                New Lead
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add New Lead</DialogTitle>
                                <DialogDescription>
                                    Add a new prospect to your pipeline. LinkedIn URL is required for enrichment.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Name *</Label>
                                    <Input id="name" value={newLead.name} onChange={e => setNewLead({ ...newLead, name: e.target.value })} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="linkedin" className="text-right">LinkedIn *</Label>
                                    <Input id="linkedin" value={newLead.linkedin_url} onChange={e => setNewLead({ ...newLead, linkedin_url: e.target.value })} className="col-span-3" placeholder="https://linkedin.com/in/..." />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="email" className="text-right">Email</Label>
                                    <Input id="email" value={newLead.email} onChange={e => setNewLead({ ...newLead, email: e.target.value })} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="company" className="text-right">Company</Label>
                                    <Input id="company" value={newLead.company} onChange={e => setNewLead({ ...newLead, company: e.target.value })} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="title" className="text-right">Title</Label>
                                    <Input id="title" value={newLead.title} onChange={e => setNewLead({ ...newLead, title: e.target.value })} className="col-span-3" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateLead}>Save Lead</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">

                {/* Hero Stats */}
                <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-900 p-8 shadow-2xl">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="relative z-10 flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-6">Sales Pipeline</h1>
                            <div className="flex gap-12 text-white">
                                <div>
                                    <div className="text-3xl font-bold">{isLoading ? "..." : stats?.total || 0}</div>
                                    <div className="text-sm font-medium text-blue-200">Total Leads</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold">{isLoading ? "..." : stats?.by_status?.['qualified'] || 0}</div>
                                    <div className="text-sm font-medium text-blue-200">Qualified</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold">{isLoading ? "..." : Math.round(stats?.avg_score || 0)}</div>
                                    <div className="text-sm font-medium text-blue-200">Avg. Score</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Latest Campaigns (Moved from Dashboard) */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Latest Campaigns</h3>
                        <Link href="/dashboard/campaigns" className="text-xs font-medium text-blue-500 hover:text-blue-400 flex items-center gap-1">
                            View All <ChevronRight className="h-3 w-3" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {campaignsLoading ? (
                            [1, 2, 3].map((i) => (
                                <div key={i} className="h-24 rounded-lg border border-border bg-card/50 animate-pulse" />
                            ))
                        ) : latestCampaigns.length > 0 ? (
                            latestCampaigns.map((campaign) => (
                                <Link key={campaign.id} href={`/dashboard/campaigns/${campaign.id}/kanban`}>
                                    <div className="group relative overflow-hidden rounded-lg border border-border bg-card p-4 transition-all hover:border-blue-500/50 hover:shadow-md hover:-translate-y-0.5">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-md ${campaign.type === 'linkedin' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                                                    <Rocket className="h-3.5 w-3.5" />
                                                </div>
                                                <h4 className="font-bold text-sm text-foreground truncate max-w-[120px]">{campaign.name}</h4>
                                            </div>
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${campaign.status === 'active' || campaign.status === 'running' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                {campaign.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2">
                                            <span>{campaign.leads_count} Leads</span>
                                            <span className="h-1 w-1 rounded-full bg-border"></span>
                                            <span>{campaign.contacted_count} Contacted</span>
                                            <span className="h-1 w-1 rounded-full bg-border"></span>
                                            <span>{campaign.replied_count} Replied</span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-4 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                                No campaigns found.
                            </div>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
                    <TabButton label="All Leads" active={activeFilter === "All"} onClick={() => { setActiveFilter("All"); setPage(1); }} count={stats?.total} />
                    <TabButton label="Interested" active={activeFilter === "Interested"} onClick={() => { setActiveFilter("Interested"); setPage(1); }} count={interestedCount} />
                    <TabButton label="Contacted" active={activeFilter === "contacted"} onClick={() => { setActiveFilter("contacted"); setPage(1); }} count={followUpCount} />
                    <TabButton label="New" active={activeFilter === "new"} onClick={() => { setActiveFilter("new"); setPage(1); }} />
                </div>

                {/* Main Content Area */}
                {viewMode === 'list' ? (
                    <div key="list-view" className="grid grid-cols-12 gap-6 h-[calc(100vh-380px)]">

                        {/* Left Column: List */}
                        <div className="col-span-8 flex flex-col rounded-xl border border-border bg-card overflow-hidden h-full">
                            {/* Search Bar */}
                            <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-card sticky top-0 z-10">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                                        className="pl-9 bg-muted/50 border-transparent focus:bg-background transition-colors"
                                    />
                                </div>
                                <Button variant="ghost" size="icon" className="ml-2">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-2 border-b border-border bg-muted/30 px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                <div className="col-span-4">Lead Name</div>
                                <div className="col-span-3">Company</div>
                                <div className="col-span-1">Score</div>
                                <div className="col-span-2">Status</div>
                                <div className="col-span-2 text-right">Added</div>
                            </div>

                            {/* Table Rows (Scrollable) */}
                            <div className="flex-1 overflow-y-auto divide-y divide-border">
                                {isLoading && filteredLeads.length === 0 ? (
                                    <div className="flex h-full items-center justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : filteredLeads.length === 0 ? (
                                    <div className="flex h-full items-center justify-center text-muted-foreground flex-col gap-2">
                                        <User className="h-8 w-8 opacity-20" />
                                        No leads found matching your criteria.
                                    </div>
                                ) : (
                                    filteredLeads.map((lead) => (
                                        <LeadRow
                                            key={lead.id}
                                            lead={lead}
                                            selected={selectedLead?.id === lead.id}
                                            onClick={() => setSelectedLead(lead)}
                                        />
                                    ))
                                )}
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between border-t border-border px-6 py-3 text-xs text-muted-foreground bg-card">
                                <span>Page {page} of {totalPages}</span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Details */}
                        <div className="col-span-4 flex flex-col rounded-xl border border-border bg-card overflow-hidden h-full">
                            {selectedLead ? (
                                <div className="flex flex-col h-full">
                                    {/* Profile Header */}
                                    <div className="relative border-b border-border p-6 text-center bg-card">
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <Link href={`/dashboard/crm/${selectedLead.id}`}>
                                                <Button variant="outline" size="sm" className="gap-2 text-xs h-8">
                                                    <ExternalLink className="h-3 w-3" /> View Lead
                                                </Button>
                                            </Link>
                                        </div>

                                        <div className={`mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg ${selectedLead.score >= 80 ? 'bg-blue-600 shadow-blue-500/20' : 'bg-slate-600'}`}>
                                            {selectedLead.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <h2 className="text-xl font-bold text-foreground">{selectedLead.name}</h2>
                                        <div className="text-sm text-muted-foreground mt-1">
                                            {selectedLead.title}
                                            {selectedLead.company && <span className="block font-medium text-blue-500">{selectedLead.company}</span>}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="mt-6 flex justify-center gap-3">
                                            {selectedLead.email && (
                                                <a href={`mailto:${selectedLead.email}`} className="p-2 rounded bg-muted hover:bg-accent text-foreground transition" title="Email">
                                                    <Mail className="h-4 w-4" />
                                                </a>
                                            )}
                                            {selectedLead.phone && (
                                                <a href={`tel:${selectedLead.phone}`} className="p-2 rounded bg-muted hover:bg-accent text-foreground transition" title="Call">
                                                    <Phone className="h-4 w-4" />
                                                </a>
                                            )}
                                            {selectedLead.linkedin_url && (
                                                <>
                                                    <a href={selectedLead.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded bg-muted hover:bg-accent text-[#0077b5] transition" title="LinkedIn">
                                                        <Briefcase className="h-4 w-4" />
                                                    </a>
                                                    <button
                                                        onClick={() => openLinkedInModal(selectedLead)}
                                                        className="p-2 rounded bg-[#0077b5] hover:bg-[#006396] text-white transition"
                                                        title="Send LinkedIn Message"
                                                    >
                                                        <Send className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        <div className="mt-4 flex items-center justify-center gap-2">
                                            <Select
                                                value={selectedLead.status}
                                                onValueChange={(val) => handleStatusChange(selectedLead.id, val)}
                                            >
                                                <SelectTrigger className="w-[140px] h-8 text-xs bg-muted/50 border-none">
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="new">New</SelectItem>
                                                    <SelectItem value="open">Open</SelectItem>
                                                    <SelectItem value="interested">Interested</SelectItem>
                                                    <SelectItem value="contacted">Contacted</SelectItem>
                                                    <SelectItem value="qualified">Qualified</SelectItem>
                                                    <SelectItem value="closed">Closed</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            {/* Quick Enrich Trigger (Hidden for now, rely on Full Page for detailed enrichment control or add small button if critical) */}
                                        </div>
                                    </div>

                                    {/* Details Body */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Lead Score Analysis</h4>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="text-2xl font-bold text-foreground">{selectedLead.score}</div>
                                                <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                                                    <div className={`h-full ${selectedLead.score >= 80 ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${selectedLead.score}%` }}></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Contact Info</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="grid grid-cols-3">
                                                    <span className="text-muted-foreground">Email:</span>
                                                    <span className="col-span-2 text-foreground truncate">{selectedLead.email || "-"}</span>
                                                </div>
                                                <div className="grid grid-cols-3">
                                                    <span className="text-muted-foreground">Phone:</span>
                                                    <span className="col-span-2 text-foreground truncate">{selectedLead.phone || "-"}</span>
                                                </div>
                                                <div className="grid grid-cols-3">
                                                    <span className="text-muted-foreground">Source:</span>
                                                    <span className="col-span-2 text-foreground truncate">{selectedLead.source}</span>
                                                </div>
                                                <div className="grid grid-cols-3">
                                                    <span className="text-muted-foreground">Enriched:</span>
                                                    <span className={`col-span-2 truncate capitalize ${!selectedLead.enrichment_status ? 'text-muted-foreground' : selectedLead.enrichment_status === 'enriched' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                        {selectedLead.enrichment_status || "Not started"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <Link href={`/dashboard/crm/${selectedLead.id}`} className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                                    View full details & enrichment status <ExternalLink className="h-3 w-3" />
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-border">
                                            <Button variant="destructive" size="sm" className="w-full" onClick={() => handleDeleteLead(selectedLead.id)}>
                                                Delete Lead
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center text-muted-foreground p-8 text-center">
                                    <div className="bg-muted rounded-full p-4 mb-4">
                                        <User className="h-8 w-8 opacity-50" />
                                    </div>
                                    <h3 className="font-medium text-foreground mb-1">No Lead Selected</h3>
                                    <p className="text-sm">Select a lead from the list to view details and manage their status.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div key="kanban-view" className="h-[calc(100vh-200px)] overflow-x-auto overflow-y-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <KanbanBoard
                            leads={filteredLeads}
                            onStatusChange={async (id, status) => {
                                // Optimistic update
                                setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
                                toast.success(`Moved to ${status}`);
                                try {
                                    await api.patch(`/api/leads/${id}`, { status });
                                } catch (e) {
                                    toast.error("Failed to update status");
                                    fetchLeads();
                                }
                            }}
                        />
                    </div>
                )}

            </div>

            {/* LinkedIn Messaging Modal */}
            <Dialog open={linkedInModalOpen} onOpenChange={setLinkedInModalOpen}>
                <DialogContent className="max-w-2xl p-0">
                    {linkedInModalLead && (
                        <LinkedInMessaging
                            leadId={linkedInModalLead.id}
                            leadName={linkedInModalLead.name}
                            linkedinUrl={linkedInModalLead.linkedin_url!}
                            onMessageSent={() => {
                                fetchLeads();
                                setLinkedInModalOpen(false);
                            }}
                            onClose={() => setLinkedInModalOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Batch LinkedIn Messaging Modal */}
            <Dialog open={batchLinkedInModalOpen} onOpenChange={setBatchLinkedInModalOpen}>
                <DialogContent className="max-w-4xl p-0 max-h-[90vh]">
                    <BatchLinkedInMessaging
                        leads={leads.filter(l => selectedLeadsForBatch.has(l.id))}
                        onComplete={(results) => {
                            setBatchLinkedInModalOpen(false);
                            setSelectedLeadsForBatch(new Set());
                            fetchLeads();
                        }}
                        onCancel={() => {
                            setBatchLinkedInModalOpen(false);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Subcomponents

function TabButton({ label, count, active, onClick }: { label: string, count?: number, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${active
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-card text-muted-foreground border border-border hover:bg-accent hover:text-foreground'
                }`}
        >
            {label}
            {count !== undefined && (
                <span className={`flex h-5 min-w-[20px] items-center justify-center rounded px-1.5 text-[10px] font-bold ${active ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                    {count}
                </span>
            )}
        </button>
    )
}

function LeadRow({ lead, selected, onClick }: { lead: Lead, selected: boolean, onClick: () => void }) {
    const statusColors: Record<string, string> = {
        'new': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        'interested': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        'contacted': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        'closed': 'bg-slate-500/10 text-slate-500 border-slate-500/20',
        'qualified': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    };

    const style = statusColors[lead.status?.toLowerCase()] || statusColors['new'];

    return (
        <div
            onClick={onClick}
            className={`grid grid-cols-12 gap-2 px-6 py-4 items-center cursor-pointer transition hover:bg-muted/50 border-l-2 ${selected ? 'bg-blue-600/[0.04] border-blue-600' : 'border-transparent'
                }`}
        >
            <div className="col-span-4 flex items-center gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${lead.score >= 80 ? 'bg-blue-600' : 'bg-slate-500'
                    }`}>
                    {lead.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 overflow-hidden">
                    <div className="text-sm font-semibold text-foreground truncate">{lead.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{lead.title || "No Title"}</div>
                </div>
            </div>

            <div className="col-span-3 text-sm text-foreground truncate">
                {lead.company || "-"}
            </div>

            <div className="col-span-1">
                <div className={`text-xs font-bold ${lead.score >= 80 ? 'text-green-500' : 'text-amber-500'}`}>
                    {lead.score}
                </div>
            </div>

            <div className="col-span-2">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style}`}>
                    {lead.status}
                </span>
            </div>

            <div className="col-span-2 text-right text-xs text-muted-foreground">
                {new Date(lead.created_at).toLocaleDateString()}
            </div>
        </div>
    )
}
