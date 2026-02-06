"use client";

import { useState } from "react";
import { Linkedin, Send, Loader2, X } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface LinkedInMessagingProps {
    leadId: string;
    leadName: string;
    linkedinUrl: string;
    onMessageSent?: () => void;
    onClose?: () => void;
}

interface LinkedInSendResponse {
    success: boolean;
    error?: string;
}

export default function LinkedInMessaging({
    leadId,
    leadName,
    linkedinUrl,
    onMessageSent,
    onClose
}: LinkedInMessagingProps) {
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"inmail" | "connection">("inmail");
    const [sendMethod, setSendMethod] = useState<"api" | "extension">("api");
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) {
            toast.error("Please enter a message");
            return;
        }

        setIsSending(true);
        try {
            if (sendMethod === "extension") {
                // Queue message for Chrome extension
                const res = await api.post("/api/outreach/", {
                    lead_id: leadId,
                    channel: "linkedin",
                    message: message.trim(),
                    message_type: messageType,
                    send_method: "extension",
                    status: "queued",
                    linkedin_profile_url: linkedinUrl
                });

                if (!res.error) {
                    toast.success(`Message queued for extension! Check your Chrome extension.`);
                    setMessage("");
                    onMessageSent?.();
                    onClose?.();
                } else {
                    toast.error("Failed to queue message");
                }
            } else {
                // Send via API (original behavior)
                const res = await api.post<LinkedInSendResponse>("/api/linkedin/send", {
                    lead_id: leadId,
                    message: message.trim(),
                    message_type: messageType
                });

                if (!res.error && res.data?.success) {
                    toast.success(`LinkedIn message sent to ${leadName}!`);
                    setMessage("");
                    onMessageSent?.();
                    onClose?.();
                } else {
                    toast.error(res.data?.error || "Failed to send LinkedIn message");
                }
            }
        } catch (error: any) {
            console.error("Error sending LinkedIn message:", error);
            toast.error(error?.message || "Failed to send message");
        } finally {
            setIsSending(false);
        }
    };

    const characterLimit = messageType === "connection" ? 300 : 1900;
    const remainingChars = characterLimit - message.length;

    return (
        <div className="flex flex-col h-full">
            <DialogHeader className="sr-only">
                <DialogTitle>Send LinkedIn Message</DialogTitle>
                <DialogDescription>Send a message to {leadName}</DialogDescription>
            </DialogHeader>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#0077b5] grid place-items-center text-white">
                        <Linkedin size={20} fill="currentColor" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Send LinkedIn Message</h3>
                        <p className="text-sm text-muted-foreground">To: {leadName}</p>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Body */}
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
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

                {/* Send Method */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                        Send Method
                    </label>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setSendMethod("api")}
                            className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${sendMethod === "api"
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                                : "border-border bg-background text-muted-foreground hover:border-blue-300"
                                }`}
                        >
                            <div className="font-medium">LinkedIn API</div>
                            <div className="text-xs">Send via API</div>
                        </button>
                        <button
                            onClick={() => setSendMethod("extension")}
                            className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${sendMethod === "extension"
                                ? "border-purple-500 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400"
                                : "border-border bg-background text-muted-foreground hover:border-purple-300"
                                }`}
                        >
                            <div className="font-medium">Chrome Extension</div>
                            <div className="text-xs">Queue for manual send</div>
                        </button>
                    </div>
                    {sendMethod === "extension" && (
                        <p className="text-xs text-muted-foreground mt-2">
                            💡 Message will be queued in your Chrome extension for manual sending on LinkedIn
                        </p>
                    )}
                </div>

                {/* Message Textarea */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                        Message
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={`Write your ${messageType === "inmail" ? "InMail" : "connection request"} message...`}
                        className="w-full h-48 px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                        maxLength={characterLimit}
                    />
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                            {messageType === "connection" && "Connection requests are limited to 300 characters"}
                            {messageType === "inmail" && "InMail messages support up to 1900 characters"}
                        </p>
                        <p className={`text-xs font-medium ${remainingChars < 50 ? "text-amber-500" : "text-muted-foreground"
                            }`}>
                            {remainingChars} characters remaining
                        </p>
                    </div>
                </div>

                {/* Variables Info */}
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-xs font-semibold text-foreground mb-2">Available Variables:</p>
                    <div className="flex flex-wrap gap-2">
                        <code className="px-2 py-1 rounded bg-background text-xs">{'{{name}}'}</code>
                        <code className="px-2 py-1 rounded bg-background text-xs">{'{{first_name}}'}</code>
                        <code className="px-2 py-1 rounded bg-background text-xs">{'{{company}}'}</code>
                        <code className="px-2 py-1 rounded bg-background text-xs">{'{{title}}'}</code>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Variables will be automatically replaced with lead data when sending
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    <span>Using connected LinkedIn account</span>
                </div>
                <div className="flex gap-3">
                    {onClose && (
                        <button
                            onClick={onClose}
                            disabled={isSending}
                            className="px-4 py-2 rounded-lg border border-input bg-background text-foreground hover:bg-accent transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={handleSend}
                        disabled={isSending || !message.trim()}
                        className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#0077b5] text-white hover:bg-[#006396] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send size={16} />
                                Send Message
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
