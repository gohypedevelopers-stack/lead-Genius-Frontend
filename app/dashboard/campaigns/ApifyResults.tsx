import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface ApifyResultsViewerProps {
    data: any;
}

export function ApifyResultsViewer({ data }: ApifyResultsViewerProps) {
    if (!data || !data.items || data.items.length === 0) {
        return <div className="text-sm text-muted-foreground p-4 text-center">No execution data available yet.</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground">Execution Results ({data.items.length} items)</h3>
                <span className="text-xs text-muted-foreground font-mono">Run ID: {data.run_id || 'Unknown'}</span>
            </div>

            <ScrollArea className="h-[400px] rounded-md border border-border bg-slate-950 p-4">
                <pre className="text-xs font-mono text-emerald-400">
                    {JSON.stringify(data.items, null, 2)}
                </pre>
            </ScrollArea>
        </div>
    );
}
