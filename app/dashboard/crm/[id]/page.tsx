"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, Briefcase, Mail, Phone, MapPin, Globe, Calendar, RefreshCcw, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Lead {
    id: string;
    name: string;
    title?: string;
    company?: string;
    email?: string;
    work_email?: string;
    personal_email?: string;
    phone?: string;
    mobile_phone?: string;
    linkedin_url?: string;
    twitter_handle?: string;
    score: number;
    status: string;
    source: string;
    location?: string;
    city?: string;
    country?: string;
    company_size?: string;
    company_industry?: string;
    company_website?: string;
    enrichment_status?: string;
    tags?: string[];
    is_email_verified?: boolean;
    created_at: string;
    notes?: string;
    custom_fields?: Record<string, any>;
}

export default function LeadDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const [lead, setLead] = useState<Lead | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEnriching, setIsEnriching] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function fetchLead() {
            setIsLoading(true);
            try {
                const res = await api.get<Lead>(`/api/leads/${id}`);
                if (res.data) {
                    setLead(res.data);
                } else {
                    toast.error("Lead not found");
                    router.push("/dashboard/crm");
                }
            } catch (error) {
                console.error("Failed to fetch lead", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchLead();
    }, [id, router]);

    const handleEnrich = async () => {
        if (!lead) return;
        setIsEnriching(true);
        try {
            const res = await api.post(`/api/leads/${lead.id}/enrich`);
            if (res.error) {
                toast.error(res.error.detail || "Enrichment failed");
            } else {
                toast.success("Enrichment started/completed");
                // Refresh lead data
                const updated = await api.get<Lead>(`/api/leads/${lead.id}`);
                if (updated.data) setLead(updated.data);
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsEnriching(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!lead) return null;

    return (
        <div className="flex flex-col h-full bg-background overflow-y-auto">
            {/* Header */}
            <div className="border-b border-border bg-card px-8 py-6">
                <Link href="/dashboard/crm" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                    <ArrowLeft className="h-4 w-4" /> Back to CRM
                </Link>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg ${lead.score >= 80 ? 'bg-blue-600' : 'bg-slate-600'}`}>
                            {lead.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">{lead.name}</h1>
                            <div className="text-lg text-muted-foreground">
                                {lead.title} {lead.company && <span>at <span className="text-blue-500 font-medium">{lead.company}</span></span>}
                            </div>
                            <div className="flex gap-2 mt-2 text-sm text-muted-foreground">
                                {lead.city && <span>{lead.city},</span>} {lead.country || lead.location}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="secondary"
                            onClick={handleEnrich}
                            disabled={isEnriching || !lead.linkedin_url}
                            className="gap-2 shadow-sm border border-border"
                        >
                            {isEnriching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                            {lead.enrichment_status === 'enriched' ? 'Re-Enrich' : 'Enrich Data'}
                        </Button>
                        <div className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wide border ${lead.status === 'qualified' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                            lead.status === 'interested' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            }`}>
                            {lead.status}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-8 max-w-5xl">
                <div className="grid grid-cols-3 gap-8">
                    {/* Left Column: Info */}
                    <div className="col-span-2 space-y-8">

                        {/* Contact Info */}
                        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <UserIcon className="h-5 w-5 text-blue-500" /> Contact Information
                            </h2>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                <InfoItem label="Email" value={lead.email} icon={<Mail className="h-4 w-4" />} link={lead.email ? `mailto:${lead.email}` : undefined} verified={lead.is_email_verified} />
                                <InfoItem label="Work Email" value={lead.work_email} icon={<Mail className="h-4 w-4 text-purple-400" />} link={lead.work_email ? `mailto:${lead.work_email}` : undefined} />
                                <InfoItem label="Personal Email" value={lead.personal_email} icon={<Mail className="h-4 w-4 text-amber-400" />} link={lead.personal_email ? `mailto:${lead.personal_email}` : undefined} />

                                <InfoItem label="Phone" value={lead.phone} icon={<Phone className="h-4 w-4" />} link={lead.phone ? `tel:${lead.phone}` : undefined} />
                                <InfoItem label="Mobile" value={lead.mobile_phone} icon={<Phone className="h-4 w-4 text-blue-400" />} link={lead.mobile_phone ? `tel:${lead.mobile_phone}` : undefined} />

                                <InfoItem label="LinkedIn" value={lead.linkedin_url} icon={<Briefcase className="h-4 w-4" />} link={lead.linkedin_url} external />
                                <InfoItem label="Twitter" value={lead.twitter_handle} icon={<Globe className="h-4 w-4" />} link={lead.twitter_handle ? `https://twitter.com/${lead.twitter_handle}` : undefined} external />

                                <InfoItem label="Location" value={lead.location} icon={<MapPin className="h-4 w-4" />} />
                            </div>
                        </div>

                        {/* Company Info */}
                        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-purple-500" /> Company Details
                            </h2>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                <InfoItem label="Company" value={lead.company} />
                                <InfoItem label="Industry" value={lead.company_industry} />
                                <InfoItem label="Size" value={lead.company_size} />
                                <InfoItem label="Website" value={lead.company_website} link={lead.company_website} external placeholder="No website data" />
                            </div>
                        </div>



                        {/* Notes */}
                        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-foreground mb-4">Notes</h2>
                            <p className="text-muted-foreground whitespace-pre-wrap">
                                {lead.notes || "No notes added yet."}
                            </p>
                        </div>

                    </div>

                    {/* Right Column: Stats & Tags */}
                    <div className="space-y-8">
                        {/* Score Card */}
                        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-foreground mb-2">Lead Score</h2>
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`text-4xl font-bold ${lead.score >= 80 ? 'text-emerald-500' : lead.score >= 50 ? 'text-amber-500' : 'text-slate-500'}`}>
                                    {lead.score}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    / 100
                                </div>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div className={`h-full ${lead.score >= 80 ? 'bg-emerald-500' : lead.score >= 50 ? 'bg-amber-500' : 'bg-slate-500'}`} style={{ width: `${lead.score}%` }}></div>
                            </div>
                            <div className="mt-4 text-xs text-muted-foreground">
                                Calculated based on profile completeness, engagement, and persona match.
                            </div>
                        </div>

                        {/* Enrichment Status */}
                        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-foreground mb-4">Data Quality</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Enrichment:</span>
                                    <span className={`font-medium px-2 py-0.5 rounded capitalize ${lead.enrichment_status === 'enriched' ? 'bg-emerald-500/10 text-emerald-500' :
                                        lead.enrichment_status === 'failed' ? 'bg-red-500/10 text-red-500' :
                                            'bg-slate-500/10 text-slate-500'
                                        }`}>
                                        {lead.enrichment_status || 'Pending'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Data Source:</span>
                                    <span className="capitalize text-foreground">{lead.source}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Added:</span>
                                    <span className="text-foreground">{new Date(lead.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Custom Fields / Extra Data */}
                        {lead.custom_fields && Object.keys(lead.custom_fields).length > 0 && (
                            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-foreground mb-4">Extracted Info</h2>
                                <div className="space-y-4">
                                    {Object.entries(lead.custom_fields).map(([key, value]) => (
                                        <div key={key} className="text-sm border-b border-border last:border-0 pb-3 last:pb-0">
                                            <div className="font-medium text-muted-foreground capitalize mb-1">{key.replace(/_/g, ' ')}</div>
                                            <div className="text-foreground pl-2">
                                                <DataRenderer value={value} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <Tag className="h-5 w-5 text-amber-500" /> Tags
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {lead.tags && lead.tags.length > 0 ? (
                                    lead.tags.map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-muted text-foreground text-xs rounded font-medium border border-border">
                                            {tag}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground">No tags</span>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ label, value, icon, link, verified, placeholder, external }: any) {
    if (!value && !placeholder) return null;

    const content = (
        <div className="flex items-center gap-2 truncate">
            {icon && <span className="text-muted-foreground">{icon}</span>}
            <span className={`text-sm ${link ? 'text-blue-500 hover:underline' : 'text-foreground'} truncate`}>
                {value || placeholder}
            </span>
            {verified && <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-1 rounded ml-1">Verified</span>}
        </div>
    );

    return (
        <div className="space-y-1 overflow-hidden">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</div>
            {link ? (
                <a href={link} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="block w-full">
                    {content}
                </a>
            ) : content}
        </div>
    );
}

function UserIcon({ className }: { className?: string }) { return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>; }

function DataRenderer({ value }: { value: any }) {
    if (value === null || value === undefined) return <span className="text-muted-foreground">-</span>;

    if (typeof value === 'boolean') {
        return <span className={value ? "text-emerald-500 font-medium" : "text-red-500"}>{value ? "Yes" : "No"}</span>;
    }

    if (Array.isArray(value)) {
        if (value.length === 0) return <span className="text-muted-foreground text-xs">Empty list</span>;
        return (
            <ul className="list-disc pl-4 space-y-1 mt-1">
                {value.map((item, i) => (
                    <li key={i}><DataRenderer value={item} /></li>
                ))}
            </ul>
        );
    }

    if (typeof value === 'object') {
        if (Object.keys(value).length === 0) return <span className="text-muted-foreground text-xs">Empty object</span>;
        return (
            <div className="pl-2 border-l-2 border-border mt-1 space-y-2">
                {Object.entries(value).map(([subKey, subValue]) => (
                    <div key={subKey} className="text-xs">
                        <span className="text-muted-foreground font-medium mr-2">{subKey.replace(/_/g, ' ')}:</span>
                        <span className="text-foreground"><DataRenderer value={subValue} /></span>
                    </div>
                ))}
            </div>
        );
    }

    // Handle string/numbers
    const strValue = String(value);
    if (strValue.startsWith('http')) {
        return <a href={strValue} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">{strValue}</a>;
    }

    return <span>{strValue}</span>;
}
