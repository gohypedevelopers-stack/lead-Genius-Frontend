"use client";

import Sidebar from "@/components/Sidebar";
import PageOrganisationIcon from "@/components/PageOrganisationIcon";
import { ProtectedRoute } from "@/components/ProtectedRoute";


import { useEffect } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Auto-connect extension on load
    useEffect(() => {
        const connectExtension = () => {
            const token = localStorage.getItem("access_token");
            if (token && typeof window !== 'undefined') {
                window.postMessage({
                    type: "LEAD_GENIUS_CONNECT",
                    payload: {
                        token: token
                    }
                }, "*");
            }
        };

        // Connect immediately
        connectExtension();

        // Retry every 5 seconds to ensure extension catches it if it loads later
        const interval = setInterval(connectExtension, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <ProtectedRoute>
            <div className="flex h-screen w-full bg-background transition-colors duration-300">
                <Sidebar />
                <main className="flex-1 h-full overflow-hidden relative">
                    {children}

                    <PageOrganisationIcon />
                </main>
            </div>
        </ProtectedRoute>
    );
}
