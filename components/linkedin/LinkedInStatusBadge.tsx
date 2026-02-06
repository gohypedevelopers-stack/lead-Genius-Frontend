"use client";

import { Linkedin } from "lucide-react";

interface LinkedInStatusBadgeProps {
    hasLinkedInUrl: boolean;
    messageSent?: boolean;
    className?: string;
}

export default function LinkedInStatusBadge({
    hasLinkedInUrl,
    messageSent,
    className = ""
}: LinkedInStatusBadgeProps) {
    if (!hasLinkedInUrl) {
        return null;
    }

    if (messageSent) {
        return (
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 ${className}`}>
                <Linkedin size={12} fill="currentColor" />
                <span>Message Sent</span>
            </div>
        );
    }

    return (
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 border border-blue-500/20 text-[#0077b5] ${className}`}>
            <Linkedin size={12} fill="currentColor" />
            <span>Available</span>
        </div>
    );
}
