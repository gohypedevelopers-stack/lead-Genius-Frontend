"use client";

import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Organization {
    id: string;
    name: string;
    domain?: string;
    industry?: string;
    business_model?: string;
    target_locations?: string;
    social_platforms?: string;
    target_department?: string;
    target_job_titles?: string;
}

interface QuestionItem {
    key: string;
    label: string;
    placeholder: string;
    type: "text" | "select";
    options?: string[];
    completed: boolean;
    value: string;
}

export function ProfileCompletionModal() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form state for each question
    const [formData, setFormData] = useState({
        full_name: "",
        domain: "",
        industry: "",
        business_model: "",
        target_locations: "",
        social_platforms: "",
        target_department: "",
        target_job_titles: "",
    });

    // Fetch organization data
    useEffect(() => {
        async function fetchOrgData() {
            setIsLoading(true);
            const { data, error } = await api.get<{ organizations: Organization[] }>("/api/organizations");

            if (!error && data && data.organizations?.length > 0) {
                const org = data.organizations[0];
                setOrganization(org);
                // Pre-fill form with existing values
                setFormData(prev => ({
                    ...prev,
                    full_name: user?.full_name || "",
                    domain: org.domain || "",
                    industry: org.industry || "",
                    business_model: org.business_model || "",
                    target_locations: org.target_locations || "",
                    social_platforms: org.social_platforms || "",
                    target_department: org.target_department || "",
                    target_job_titles: org.target_job_titles || "",
                }));
            }
            setIsLoading(false);
        }

        if (user) {
            fetchOrgData();
        }
    }, [user]);

    // Show modal after 3 seconds if profile is incomplete
    useEffect(() => {
        if (!isLoading) {
            const incompleteItems = getIncompleteQuestions();
            if (incompleteItems.length > 0) {
                const timer = setTimeout(() => {
                    setOpen(true);
                }, 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [isLoading, user, organization]);

    // Define all questions
    const getAllQuestions = (): QuestionItem[] => [
        {
            key: "full_name",
            label: "Complete your profile name",
            placeholder: "Enter your full name",
            type: "text",
            completed: !!user?.full_name,
            value: formData.full_name,
        },
        {
            key: "domain",
            label: "Add your company website",
            placeholder: "example.com",
            type: "text",
            completed: !!organization?.domain,
            value: formData.domain,
        },
        {
            key: "industry",
            label: "Select your industry",
            placeholder: "Select industry...",
            type: "select",
            options: ["SaaS", "Agency", "E-commerce", "Services", "Technology", "Finance", "Healthcare", "Other"],
            completed: !!organization?.industry,
            value: formData.industry,
        },
        {
            key: "business_model",
            label: "Choose your business model",
            placeholder: "Select type...",
            type: "select",
            options: ["B2B", "B2C", "B2B2C", "Marketplace"],
            completed: !!organization?.business_model,
            value: formData.business_model,
        },
        {
            key: "target_locations",
            label: "Where are your ideal customers located?",
            placeholder: "e.g. USA, India, Europe",
            type: "text",
            completed: !!organization?.target_locations,
            value: formData.target_locations,
        },
        {
            key: "social_platforms",
            label: "Which social media platform are your users mainly active on?",
            placeholder: "Select platform...",
            type: "select",
            options: ["LinkedIn", "Instagram", "Twitter/X", "Facebook", "YouTube", "Multiple"],
            completed: !!organization?.social_platforms,
            value: formData.social_platforms,
        },
        {
            key: "target_department",
            label: "Which department usually buys your solution?",
            placeholder: "e.g. Marketing, Sales, IT",
            type: "text",
            completed: !!organization?.target_department,
            value: formData.target_department,
        },
        {
            key: "target_job_titles",
            label: "List 3-5 job titles you target most often",
            placeholder: "e.g. CEO, CTO, VP of Sales",
            type: "text",
            completed: !!organization?.target_job_titles,
            value: formData.target_job_titles,
        },
    ];

    const getIncompleteQuestions = () => getAllQuestions().filter(q => !q.completed);
    const allQuestions = getAllQuestions();
    const incompleteQuestions = getIncompleteQuestions();
    const completedCount = allQuestions.length - incompleteQuestions.length;
    const completionPercent = Math.round((completedCount / allQuestions.length) * 100);

    const handleInputChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);

        // Prepare user update (full_name)
        if (formData.full_name && formData.full_name !== user?.full_name) {
            await api.patch("/api/users/me", { full_name: formData.full_name });
        }

        // Prepare organization update
        const orgUpdate: Record<string, string | undefined> = {};
        if (formData.domain) orgUpdate.domain = formData.domain;
        if (formData.industry) orgUpdate.industry = formData.industry;
        if (formData.business_model) orgUpdate.business_model = formData.business_model;
        if (formData.target_locations) orgUpdate.target_locations = formData.target_locations;
        if (formData.social_platforms) orgUpdate.social_platforms = formData.social_platforms;
        if (formData.target_department) orgUpdate.target_department = formData.target_department;
        if (formData.target_job_titles) orgUpdate.target_job_titles = formData.target_job_titles;

        if (Object.keys(orgUpdate).length > 0) {
            const { error } = await api.patch(`/api/organizations/${organization!.id}`, orgUpdate);
            if (error) {
                toast.error("Failed to save profile. Please try again.");
                setIsSaving(false);
                return;
            }
        }

        toast.success("✨ Profile updated successfully!");
        setIsSaving(false);
        setOpen(false);
        // Reload to update sidebar
        window.location.reload();
    };

    // Don't render if loading or fully complete
    if (isLoading || incompleteQuestions.length === 0) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[480px] border-border bg-card text-card-foreground p-0 gap-0 overflow-hidden shadow-2xl transition-colors duration-300 max-h-[90vh] overflow-y-auto">
                <div className="p-5 pb-3">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <DialogTitle className="text-lg font-bold text-foreground mb-1">Complete Your Profile</DialogTitle>
                            <DialogDescription className="text-muted-foreground text-xs leading-snug">
                                Your account setup is {completionPercent}% complete. Please add the following details to unlock full features.
                            </DialogDescription>
                        </div>
                    </div>

                    <div className="mb-5">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-2">
                            <span className="text-muted-foreground">Setup Progress</span>
                            <span className={completionPercent >= 75 ? "text-emerald-500" : completionPercent >= 50 ? "text-amber-500" : "text-red-500"}>
                                {completionPercent}%
                            </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className={`h-full transition-all duration-500 ease-in-out ${completionPercent >= 75 ? "bg-emerald-500" : completionPercent >= 50 ? "bg-amber-500" : "bg-red-500"
                                    }`}
                                style={{ width: `${completionPercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Show only incomplete questions as input fields */}
                    <div className="space-y-4 mb-4">
                        {incompleteQuestions.map((question) => (
                            <div key={question.key} className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                    {question.completed ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    ) : (
                                        <span className="w-3.5 h-3.5 rounded-full border border-muted-foreground"></span>
                                    )}
                                    {question.label}
                                </label>
                                {question.type === "select" ? (
                                    <select
                                        value={formData[question.key as keyof typeof formData]}
                                        onChange={(e) => handleInputChange(question.key, e.target.value)}
                                        className="w-full h-9 rounded-lg border border-input bg-background/50 px-3 text-sm text-foreground outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                                    >
                                        <option value="">{question.placeholder}</option>
                                        {question.options?.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        value={formData[question.key as keyof typeof formData]}
                                        onChange={(e) => handleInputChange(question.key, e.target.value)}
                                        placeholder={question.placeholder}
                                        className="w-full h-9 rounded-lg border border-input bg-background/50 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 pt-3 flex gap-3 border-t border-border bg-muted/20">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={() => setOpen(false)}
                    >
                        Skip for now
                    </Button>
                    <Button
                        size="sm"
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 mr-1" />
                                Complete Setup
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
