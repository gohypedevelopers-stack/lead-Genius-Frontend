import React from "react";
import { Link } from "lucide-react"; // Import issue fix: standard link is from next/link usually, but here likely lucide icon usage. 
// checking original usage: <ExternalLink ...> in card.
import { ExternalLink } from "lucide-react";

export interface Lead {
    id: string;
    name?: string;
    first_name?: string;
    last_name?: string;
    title?: string;
    company?: string;
    email?: string;
    phone?: string;
    linkedin_url?: string;
    status: string;
    score: number;
    source: string;
    created_at: string;
    enrichment_status?: string;
    // ... other fields as needed
}

interface KanbanBoardProps {
    leads: Lead[];
    onStatusChange: (id: string, status: string) => void;
}

export function KanbanBoard({ leads, onStatusChange }: KanbanBoardProps) {
    const columns = ["New", "Contacted", "Interested", "Qualified", "Closed"];

    // Group leads by status (case insensitive safe)
    const groupedLeads = columns.reduce((acc, status) => {
        acc[status] = leads.filter(l => (l.status?.toLowerCase() || 'new') === status.toLowerCase()) || [];
        return acc;
    }, {} as Record<string, Lead[]>);

    // Handle Drop
    const handleDrop = (e: React.DragEvent, status: string) => {
        e.preventDefault();
        const leadId = e.dataTransfer.getData("leadId");
        if (leadId) {
            onStatusChange(leadId, status.toLowerCase());
        }
        e.currentTarget.classList.remove("bg-accent/50");
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.currentTarget.classList.add("bg-accent/50");
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.currentTarget.classList.remove("bg-accent/50");
    };

    return (
        <div className="flex h-full gap-4 min-w-[1200px] pb-4">
            {columns.map(status => (
                <div
                    key={status}
                    className="flex-1 flex flex-col min-w-[280px] rounded-xl border border-border bg-card/50 backdrop-blur-sm transition-colors"
                    onDrop={(e) => handleDrop(e, status)}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    {/* Header */}
                    <div className="p-3 border-b border-border flex items-center justify-between sticky top-0 bg-card/90 backdrop-blur-md rounded-t-xl z-10">
                        <div className="flex items-center gap-2">
                            <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(status.toLowerCase())}`}></div>
                            <span className="font-semibold text-sm text-foreground">{status}</span>
                            <span className="ml-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-mono">
                                {groupedLeads[status]?.length || 0}
                            </span>
                        </div>
                    </div>

                    {/* Cards */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                        {groupedLeads[status]?.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground/40 text-xs border border-dashed border-border/50 rounded-lg">
                                Empty
                            </div>
                        ) : (
                            groupedLeads[status]?.map(lead => (
                                <div
                                    key={lead.id}
                                    draggable
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData("leadId", lead.id);
                                        e.dataTransfer.effectAllowed = "move";
                                    }}
                                    className="group relative p-3 rounded-lg border border-border bg-card shadow-sm hover:shadow-md hover:border-blue-500/50 cursor-grab active:cursor-grabbing transition-all hover:-translate-y-0.5"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium text-sm text-foreground line-clamp-1">{lead.name || "Unknown"}</h4>
                                        <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${(lead.score || 0) > 70 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                            }`}>
                                            {lead.score || 0}
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground mb-3 line-clamp-1">
                                        {lead.company ? `${lead.company} • ` : ''}{lead.title || "No Title"}
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                        <div className="text-[10px] text-muted-foreground">
                                            {new Date(lead.created_at).toLocaleDateString()}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {/* Note: We use a button here instead of Link to keep it generic, parent can wrap or handle click */}
                                            <button className="text-muted-foreground hover:text-blue-500 transition p-1 hover:bg-muted rounded">
                                                <ExternalLink className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'new': return 'bg-blue-500';
        case 'open': return 'bg-sky-500';
        case 'contacted': return 'bg-amber-500';
        case 'interested': return 'bg-emerald-500';
        case 'qualified': return 'bg-purple-500';
        case 'closed': return 'bg-slate-500';
        default: return 'bg-gray-400';
    }
}
