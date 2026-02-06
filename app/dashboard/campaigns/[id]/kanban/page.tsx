"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { KanbanBoard, Lead } from "@/components/crm/KanbanBoard";
import { ArrowLeft, Loader2, Calendar, Briefcase, Mail } from "lucide-react";

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

export default function CampaignKanbanPage() {
    const params = useParams();
    const router = useRouter();
    const campaignId = params.id as string;

    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch Campaign Details
                const { data: campaignData, error: campaignError } = await api.get<Campaign>(`/api/campaigns/${campaignId}`);
                if (campaignData) {
                    setCampaign(campaignData);
                } else {
                    toast.error("Failed to load campaign");
                    return;
                }

                // Fetch Campaign Leads
                const { data: leadsData } = await api.get<{ items: Lead[] }>(`/api/leads?campaign_id=${campaignId}&limit=100`);
                if (leadsData) {
                    setLeads(leadsData.items);
                }
            } catch (err) {
                console.error(err);
                toast.error("Error loading data");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [campaignId]);

    const handleStatusChange = async (leadId: string, status: string) => {
        // Optimistic update
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));

        try {
            await api.patch(`/api/leads/${leadId}`, { status });
            toast.success(`Moved to ${status}`);
        } catch (e) {
            toast.error("Failed to update status");
            // Revert would require re-fetching, simplest is to let optimism fail silently or revert if crucial.
            // For now, trusting API.
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!campaign) return null;

    return (
        <div className="flex h-full flex-col overflow-hidden bg-background text-foreground animate-in fade-in duration-300">
            {/* Header */}
            <div className="border-b border-border bg-card px-8 py-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition"
                        title="Back"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold">{campaign.name}</h1>
                            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500">
                                Kanban Board
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {new Date(campaign.created_at).toLocaleDateString()}
                            </span>
                            <span className="capitalize flex items-center gap-1">
                                {campaign.type === 'linkedin' ? <Briefcase className="h-3 w-3" /> : <Mail className="h-3 w-3" />}
                                {campaign.type}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
                <KanbanBoard leads={leads} onStatusChange={handleStatusChange} />
            </div>
        </div>
    );
}
