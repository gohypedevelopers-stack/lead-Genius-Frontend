"use client";

import { useState } from "react";
import { Linkedin, Send, Loader2, X, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Lead {
    id: string;
    name: string;
    company?: string;
    title?: string;
    linkedin_url?: string;
}

interface BatchLinkedInMessagingProps {
    leads: Lead[];
    onComplete: (results: BatchResults) => void;
    onCancel: () => void;
}

interface BatchResults {
    total: number;
    successful: number;
    failed: number;
    results: Array<{ lead_id: string; success: boolean; error?: string }>;
}

interface SendingProgress {
    leadId: string;
    status: "pending" | "sending" | "success" | "failed";
    error?: string;
}

export default function BatchLinkedInMessaging({
    leads,
    onComplete,
    onCancel
}: BatchLinkedInMessagingProps) {
    const [messageTemplate, setMessageTemplate] = useState("");
    const [messageType, setMessageType] = useState<"inmail" | "connection">("inmail");
    const [isSending, setIsSending] = useState(false);
    const [progress, setProgress] = useState<SendingProgress[]>([]);
    const [showPreview, setShowPreview] = useState(false);

    const handleSend = async () => {
        if (!messageTemplate.trim()) {
            toast.error("Please enter a message template");
            return;
        }

        setIsSending(true);

        // Initialize progress tracking
        const initialProgress = leads.map(lead => ({
            leadId: lead.id,
            status: "pending" as const
        }));
        setProgress(initialProgress);

        try {
            const leadIds = leads
                .filter(lead => lead.linkedin_url)
                .map(lead => lead.id);

            const res = await api.post<BatchResults>("/api/linkedin/send-batch", {
                lead_ids: leadIds,
                message_template: messageTemplate.trim(),
                message_type: messageType,
                send_method: "extension" // Explicitly request extension-based sending
            });

            if (!res.error && res.data) {
                // Update progress with results
                const updatedProgress = res.data.results.map(result => ({
                    leadId: result.lead_id,
                    status: result.success ? "success" as const : "failed" as const,
                    error: result.error
                }));
                setProgress(updatedProgress);

                toast.success(`Successfully sent ${res.data.successful} of ${res.data.total} messages`);

                // Wait a bit to show results before completing
                setTimeout(() => {
                    onComplete(res.data!);
                }, 2000);
            } else {
                toast.error("Failed to send batch messages");
                setIsSending(false);
            }
        } catch (error: any) {
            console.error("Error sending batch:", error);
            toast.error(error?.message || "Failed to send messages");
            setIsSending(false);
        }
    };

    const previewMessage = (lead: Lead) => {
        return messageTemplate
            .replace(/\{\{name\}\}/g, lead.name || "")
            .replace(/\{\{first_name\}\}/g, (lead.name || "").split(" ")[0] || "")
            .replace(/\{\{company\}\}/g, lead.company || "")
            .replace(/\{\{title\}\}/g, lead.title || "");
    };

    const characterLimit = messageType === "connection" ? 300 : 1900;
    const remainingChars = characterLimit - messageTemplate.length;
    const leadsWithLinkedIn = leads.filter(lead => lead.linkedin_url);

    return (
        <div className="flex flex-col h-full max-h-[90vh]">
            <DialogHeader className="sr-only">
                <DialogTitle>Batch LinkedIn Message</DialogTitle>
                <DialogDescription>Send messages to multiple leads</DialogDescription>
            </DialogHeader>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#0077b5] grid place-items-center text-white">
                        <Linkedin size={20} fill="currentColor" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Send Batch LinkedIn Messages</h3>
                        <p className="text-sm text-muted-foreground">
                            {isSending
                                ? `Sending to ${leadsWithLinkedIn.length} leads...`
                                : `${leadsWithLinkedIn.length} leads selected • ${leads.length - leadsWithLinkedIn.length} without LinkedIn`
                            }
                        </p>
                    </div>
                </div>
                <button
                    onClick={onCancel}
                    disabled={isSending}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Body */}
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                {!isSending ? (
                    <>
                        {/* Message Type */}
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">
                                Message Type
                            </label>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setMessageType("inmail")}
                                    className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${messageType === "inmail"
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                                        : "border-border bg-background text-muted-foreground hover:border-blue-300"
                                        }`}
                                >
                                    <div className="font-medium">InMail</div>
                                    <div className="text-xs">Direct message</div>
                                </button>
                                <button
                                    onClick={() => setMessageType("connection")}
                                    className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${messageType === "connection"
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                                        : "border-border bg-background text-muted-foreground hover:border-blue-300"
                                        }`}
                                >
                                    <div className="font-medium">Connection Request</div>
                                    <div className="text-xs">With note</div>
                                </button>
                            </div>
                        </div>

                        {/* Message Template */}
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">
                                Message Template
                            </label>
                            <textarea
                                value={messageTemplate}
                                onChange={(e) => setMessageTemplate(e.target.value)}
                                placeholder="Hi {{first_name}}, I noticed you work at {{company}}..."
                                className="w-full h-40 px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                maxLength={characterLimit}
                            />
                            <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-muted-foreground">
                                    Use variables: {`{{name}}, {{first_name}}, {{company}}, {{title}}`}
                                </p>
                                <p className={`text-xs font-medium ${remainingChars < 50 ? "text-amber-500" : "text-muted-foreground"
                                    }`}>
                                    {remainingChars} chars
                                </p>
                            </div>
                        </div>

                        {/* Preview */}
                        <div>
                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className="text-sm font-semibold text-blue-600 hover:text-blue-500"
                            >
                                {showPreview ? "Hide" : "Show"} Preview
                            </button>

                            {showPreview && (
                                <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                                    {leadsWithLinkedIn.slice(0, 3).map(lead => (
                                        <div key={lead.id} className="p-3 rounded-lg bg-muted/50 border border-border">
                                            <p className="text-xs font-semibold text-foreground mb-1">
                                                To: {lead.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                                                {previewMessage(lead)}
                                            </p>
                                        </div>
                                    ))}
                                    {leadsWithLinkedIn.length > 3 && (
                                        <p className="text-xs text-muted-foreground text-center">
                                            + {leadsWithLinkedIn.length - 3} more messages
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* Sending Progress */
                    <div className="space-y-2">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-semibold text-foreground">Sending Progress</h4>
                            <div className="text-xs text-muted-foreground">
                                {progress.filter(p => p.status === "success").length} / {progress.length} sent
                            </div>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {progress.map(item => {
                                const lead = leads.find(l => l.id === item.leadId);
                                return (
                                    <div key={item.leadId} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                                        <div className="flex items-center gap-3">
                                            {item.status === "success" && <CheckCircle2 size={16} className="text-emerald-500" />}
                                            {item.status === "failed" && <AlertCircle size={16} className="text-rose-500" />}
                                            {item.status === "sending" && <Loader2 size={16} className="animate-spin text-blue-500" />}
                                            {item.status === "pending" && <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />}
                                            <span className="text-sm text-foreground">{lead?.name}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {item.status === "success" && "Sent"}
                                            {item.status === "failed" && (item.error || "Failed")}
                                            {item.status === "sending" && "Sending..."}
                                            {item.status === "pending" && "Waiting"}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            {!isSending && (
                <div className="p-6 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                        <span>Using connected LinkedIn account</span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 rounded-lg border border-input bg-background text-foreground hover:bg-accent transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={!messageTemplate.trim() || leadsWithLinkedIn.length === 0}
                            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#0077b5] text-white hover:bg-[#006396] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={16} />
                            Send to {leadsWithLinkedIn.length} Leads
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
