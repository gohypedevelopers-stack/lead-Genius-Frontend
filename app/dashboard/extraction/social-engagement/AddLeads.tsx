"use client";

import { useState } from "react";
import {
    Search,
    Compass,
    UserPlus,
    Calendar,
    Users,
    Network,
    UploadCloud,
    Link as LinkIcon,
    X,
    Info,
    Clock,
    Check,
    Loader2
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function AddLeads({ onClose, onSuccess }: { onClose: () => void; onSuccess?: () => void }) {
    const [step, setStep] = useState(1);
    const [selected, setSelected] = useState<string>("basic-search");
    const [url, setUrl] = useState("https://www.linkedin.com/search/results/people/?keywords=2026%2");
    const [profileCount, setProfileCount] = useState<"max" | "custom">("custom");
    const [customCount, setCustomCount] = useState(100);

    // Step 3 Filters
    const [filterExisting, setFilterExisting] = useState(true);
    const [filterLowConnections, setFilterLowConnections] = useState(true);
    const [useCloudScraper, setUseCloudScraper] = useState(true);

    // Step 4 - REQUIRE USER INPUT
    const [listName, setListName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Polling State
    const [isPolling, setIsPolling] = useState(false);
    const [pollingStatus, setPollingStatus] = useState("Initializing...");

    const handleNext = async () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            // Submit to backend
            try {
                // Open new tab for LinkedIn Post Search only if NOT using Cloud Extraction
                if (selected === "linkedin-post" && url && !useCloudScraper) {
                    window.open(url, "_blank");
                }

                setIsLoading(true);
                const payload = {
                    name: listName, // User input collected in Step 1
                    type: selected, // e.g., 'linkedin-post'
                    settings: {
                        url,
                        target_count: profileCount === 'max' ? 245 : customCount,
                        filters: {
                            existing_leads: filterExisting,
                            low_connections: filterLowConnections
                        },
                        use_cloud_scraper: useCloudScraper
                    }
                };

                const { data, error } = await api.post<any>("/api/campaigns", payload);

                if (error || !data) {
                    toast.error(`Failed to create list: ${error?.detail || "Unknown error"}`);
                    setIsLoading(false);
                } else {
                    if (useCloudScraper) {
                        // Start Polling
                        setIsPolling(true);
                        setPollingStatus("Starting cloud extraction...");

                        // ID of the created campaign
                        const campaignId = data.id;

                        const pollInterval = setInterval(async () => {
                            try {
                                const { data: campaign, error: pollError } = await api.get<any>(`/api/campaigns/${campaignId}`);

                                if (pollError) {
                                    // retrying...
                                    return;
                                }

                                if (campaign.status === "completed") {
                                    clearInterval(pollInterval);
                                    setIsPolling(false);
                                    setIsLoading(false);
                                    toast.success(`Extraction complete! found ${campaign.leads_count || 0} leads.`);
                                    if (onSuccess) onSuccess();
                                    onClose();
                                } else if (campaign.status === "failed") {
                                    clearInterval(pollInterval);
                                    setIsPolling(false);
                                    setIsLoading(false);
                                    toast.error("Extraction failed. Please check the URL/permissions.");
                                    onClose();
                                } else {
                                    setPollingStatus(`Extracting data... (${campaign.status})`);
                                }
                            } catch (e) {
                                console.error("Polling error", e);
                            }
                        }, 2000); // Check every 2s

                    } else {
                        toast.success("List created successfully!");
                        setIsLoading(false);
                        if (onSuccess) onSuccess();
                        onClose();
                    }
                }
            } catch (e) {
                console.error("Create campaign error:", e);
                toast.error("An unexpected error occurred.");
                setIsLoading(false);
            }
        }
    };

    const handleBack = () => {
        if (step > 1 && !isPolling) {
            setStep(step - 1);
        }
    };

    const getTitle = () => {
        switch (selected) {
            case "linkedin-post": return "LinkedIn Posts Search";
            case "insta-post": return "Instagram Posts Search";
            case "twitter-post": return "Twitter Posts Search";
            case "linkedin-hiring": return "LinkedIn Hiring Search";
            case "linkedin-fund": return "LinkedIn Fund Raising Search";
            case "display-network": return "My Network (LinkedIn)";
            case "event-members": return "LinkedIn Event Members";
            case "insta-followers": return "Instagram Followers";
            case "insta-community": return "Instagram Community Members";
            default: return "Basic LinkedIn Search";
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl transition-colors duration-300">
                {/* Close Button */}
                {!isPolling && (
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 z-10 text-muted-foreground hover:text-foreground transition"
                    >
                        <X size={24} />
                    </button>
                )}

                <div className="p-6 lg:p-8">
                    {/* Polling UI Overlay */}
                    {isPolling && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-card/95 backdrop-blur-sm rounded-3xl">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">Extracting Leads</h3>
                            <p className="text-muted-foreground text-center max-w-sm px-4">
                                {pollingStatus} <br />
                                <span className="text-xs opacity-70">Please wait while we connect to LinkedIn...</span>
                            </p>
                        </div>
                    )}

                    {/* Header / Progress */}
                    <div className="mb-2 flex items-center gap-3 text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                        <span>Create a list of leads below</span>
                        <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                        <span>Step {step} / 3</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6 flex gap-2">
                        <div className={`h-1 w-16 rounded-full ${step >= 1 ? "bg-blue-600" : "bg-muted"}`} />
                        <div className={`h-1 w-16 rounded-full ${step >= 2 ? "bg-blue-600" : "bg-muted"}`} />
                        <div className={`h-1 w-16 rounded-full ${step >= 3 ? "bg-blue-600" : "bg-muted"}`} />
                    </div>

                    {step === 1 && (
                        <>
                            <h2 className="mb-2 text-2xl font-semibold text-foreground">
                                Name your campaign
                            </h2>
                            <p className="mb-6 text-sm text-muted-foreground">
                                Give your campaign a memorable name to track it later.
                            </p>

                            <input
                                type="text"
                                value={listName}
                                onChange={(e) => setListName(e.target.value)}
                                className="mb-8 h-12 w-full rounded-xl border border-input bg-background/50 px-4 text-sm text-foreground focus:border-blue-500 focus:outline-none transition-colors"
                                placeholder="e.g. Q1 Marketing Outreach"
                                autoFocus
                            />

                            <h2 className="mb-6 text-2xl font-semibold text-foreground">
                                How would you like to add leads?
                            </h2>

                            {/* Grid */}
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                <OptionCard
                                    icon={<LinkedinIcon />}
                                    title="LinkedIn Posts Search"
                                    description="Extract profiles from specific LinkedIn posts"
                                    active={selected === "linkedin-post"}
                                    onClick={() => setSelected("linkedin-post")}
                                />
                                <OptionCard
                                    icon={<InstagramIcon />}
                                    title="Instagram Posts Search"
                                    description="Find users interacting with Instagram posts"
                                    active={selected === "insta-post"}
                                    onClick={() => setSelected("insta-post")}
                                />
                                <OptionCard
                                    icon={<TwitterIcon />}
                                    title="Twitter Posts Search"
                                    description="Extract leads from Twitter / X conversations"
                                    active={selected === "twitter-post"}
                                    onClick={() => setSelected("twitter-post")}
                                />
                                <OptionCard
                                    icon={<BriefcaseIcon />}
                                    title="LinkedIn Hiring Search"
                                    description="Find companies or individuals currently hiring"
                                    active={selected === "linkedin-hiring"}
                                    onClick={() => setSelected("linkedin-hiring")}
                                />
                                <OptionCard
                                    icon={<TrendingUpIcon />}
                                    title="LinkedIn Fund Raising Search"
                                    description="Identify companies raising funds on LinkedIn"
                                    active={selected === "linkedin-fund"}
                                    onClick={() => setSelected("linkedin-fund")}
                                />
                                <OptionCard
                                    icon={<Network size={24} />}
                                    title="My Network (LinkedIn)"
                                    description="Transfer first-level connections from your network"
                                    active={selected === "display-network"}
                                    onClick={() => setSelected("display-network")}
                                />
                                <OptionCard
                                    icon={<Calendar size={24} />}
                                    title="LinkedIn Event Members"
                                    description="Retrieve members attending specific LinkedIn events"
                                    active={selected === "event-members"}
                                    onClick={() => setSelected("event-members")}
                                />
                                <OptionCard
                                    icon={<Users size={24} />}
                                    title="Instagram Followers"
                                    description="Scrape followers from Instagram profiles"
                                    active={selected === "insta-followers"}
                                    onClick={() => setSelected("insta-followers")}
                                />
                                <OptionCard
                                    icon={<UsersIcon />}
                                    title="Instagram Community Members"
                                    description="Extract members from Instagram communities/groups"
                                    active={selected === "insta-community"}
                                    onClick={() => setSelected("insta-community")}
                                />
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h2 className="mb-2 text-2xl font-semibold text-foreground">
                                {getTitle()}
                            </h2>

                            <div className="mb-8 space-y-6">
                                <div>
                                    <p className="mb-3 text-sm text-muted-foreground">
                                        {selected === 'linkedin-post'
                                            ? "Paste the full URL of the LinkedIn Post you want to analyze:"
                                            : <>Filter profiles in the <span className="text-blue-500 underline cursor-pointer">LinkedIn search</span> and paste the URL below</>
                                        }
                                    </p>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            className="w-full h-12 rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex h-12 w-full items-center justify-between rounded-xl bg-muted/50 px-4 border border-border">
                                    <span className="text-sm text-muted-foreground">LinkedIn profiles found:</span>
                                    <span className="text-lg font-bold text-foreground">245</span>
                                </div>

                                <div>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        How many profiles would you like to add to this list? (max: 245)
                                    </p>

                                    <div className="flex items-center gap-8">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <div className={`flex h-6 w-6 items-center justify-center rounded-full border ${profileCount === 'max' ? 'border-blue-500 bg-blue-500/10' : 'border-muted-foreground/30'}`}>
                                                {profileCount === 'max' && <div className="h-3 w-3 rounded-full bg-blue-500" />}
                                            </div>
                                            <input
                                                type="radio"
                                                name="count"
                                                className="hidden"
                                                checked={profileCount === 'max'}
                                                onChange={() => setProfileCount('max')}
                                            />
                                            <span className="text-sm text-foreground">Add maximum profiles</span>
                                        </label>

                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <div className={`flex h-6 w-6 items-center justify-center rounded-full border ${profileCount === 'custom' ? 'border-blue-500 bg-blue-500/10' : 'border-muted-foreground/30'}`}>
                                                {profileCount === 'custom' && <div className="h-3 w-3 rounded-full bg-blue-500" />}
                                            </div>
                                            <input
                                                type="radio"
                                                name="count"
                                                className="hidden"
                                                checked={profileCount === 'custom'}
                                                onChange={() => setProfileCount('custom')}
                                            />
                                            <span className="text-sm text-blue-500 font-medium">Custom</span>
                                        </label>

                                        {profileCount === 'custom' && (
                                            <input
                                                type="number"
                                                value={customCount}
                                                onChange={(e) => setCustomCount(Number(e.target.value))}
                                                className="h-10 w-32 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-blue-500 focus:outline-none transition-colors"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <h2 className="mb-6 text-2xl font-semibold text-foreground">
                                Choose lead filtering rules for this lead list
                            </h2>

                            <div className="mb-8 space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Do not add a lead to the campaign if:
                                </p>

                                {/* Main Filters */}
                                <div className="rounded-xl border border-border bg-card/50 p-4 text-foreground/75">
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`flex h-6 w-6 items-center justify-center rounded border transition ${filterExisting ? 'bg-blue-600 border-blue-600' : 'border-muted-foreground/30 group-hover:border-muted-foreground/50'}`}>
                                                {filterExisting && <Check size={14} className="text-white" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={filterExisting}
                                                onChange={(e) => setFilterExisting(e.target.checked)}
                                            />
                                            <span className="text-sm text-foreground">Same leads found in other campaigns (recommended)</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Boxed Filters */}
                                <div className="rounded-xl border border-border bg-card/50 p-4 text-foreground/75">
                                    <div className="space-y-3 mb-4">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`flex h-6 w-6 items-center justify-center rounded border transition ${filterLowConnections ? 'bg-blue-600 border-blue-600' : 'border-muted-foreground/30 group-hover:border-muted-foreground/50'}`}>
                                                {filterLowConnections && <Check size={14} className="text-white" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={filterLowConnections}
                                                onChange={(e) => setFilterLowConnections(e.target.checked)}
                                            />
                                            <span className="text-sm text-foreground">Less than 500 connections</span>
                                        </label>
                                    </div>

                                    <div className="flex items-start gap-2 text-muted-foreground pt-3 border-t border-border">
                                        <Clock size={16} className="mt-0.5" />
                                        <span className="text-xs">This option will cause slower lead upload time if selected</span>
                                    </div>
                                </div>

                                {selected === 'linkedin-post' && (
                                    <div className="rounded-xl border border-border bg-card/50 p-4 text-foreground/75">
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`flex h-6 w-6 items-center justify-center rounded border transition ${useCloudScraper ? 'bg-blue-600 border-blue-600' : 'border-muted-foreground/30 group-hover:border-muted-foreground/50'}`}>
                                                    {useCloudScraper && <Check size={14} className="text-white" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={useCloudScraper}
                                                    onChange={(e) => setUseCloudScraper(e.target.checked)}
                                                />
                                                <span className="text-sm text-foreground">Use Cloud Extraction (Automated)</span>
                                            </label>
                                            <p className="text-xs text-muted-foreground ml-9">
                                                Use our cloud servers to extract data automatically (Costs credits). Uncheck to use your browser extension manually.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Footer Actions */}
                    <div className="mt-8 flex justify-end gap-3">
                        {step > 1 && (
                            <button
                                onClick={handleBack}
                                className="rounded-xl border border-input bg-background px-6 py-3 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            disabled={isLoading || (step === 1 && !listName.trim())}
                            className={`rounded-xl px-8 py-3 text-sm font-semibold text-white shadow-lg transition flex items-center gap-2
                                ${step === 3
                                    ? "bg-[#6366F1] shadow-[#6366F1]/25 hover:bg-[#6366F1]/90" // Indigo/Purple for final step
                                    : "bg-blue-600 shadow-blue-500/25 hover:bg-blue-500"
                                }
                                ${(isLoading || (step === 1 && !listName.trim())) ? "opacity-70 cursor-not-allowed" : ""}
                            `}
                        >
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {step === 3 ? "Create a list" : "Next"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function OptionCard({
    icon,
    title,
    description,
    active,
    onClick,
    comingSoon,
    disabled
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    active?: boolean;
    onClick?: () => void;
    comingSoon?: boolean;
    disabled?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || comingSoon}
            className={`
                group relative flex h-full flex-col items-start rounded-2xl border p-6 text-left transition-all duration-200
                ${active
                    ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500"
                    : "border-border bg-card/50 hover:border-blue-500/30 hover:bg-accent"
                }
                ${(disabled || comingSoon) ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
            `}
        >
            {comingSoon && (
                <span className="absolute right-4 top-4 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold tracking-wide text-muted-foreground">
                    COMING SOON
                </span>
            )}

            <div className={`mb-4 ${active ? "text-blue-500" : "text-muted-foreground group-hover:text-foreground"}`}>
                {icon}
            </div>

            <h3 className={`mb-2 text-sm font-semibold ${active ? "text-blue-500" : "text-foreground"}`}>
                {title}
            </h3>

            <p className="text-xs leading-relaxed text-muted-foreground">
                {description}
            </p>
        </button>
    )
}

function LinkedinIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
    )
}

function InstagramIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
    )
}

function TwitterIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    )
}

function BriefcaseIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    )
}

function TrendingUpIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
        </svg>
    )
}

function UsersIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
