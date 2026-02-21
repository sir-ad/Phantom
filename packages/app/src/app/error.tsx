"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Phantom UI Error boundary caught:", error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground font-mono p-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Matrix Anomaly Detected</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
                The Phantom interface encountered an unexpected error.
                <br />
                <span className="text-xs mt-2 block opacity-70 border border-border/50 p-2 rounded bg-muted/10">{error.message || "Unknown error"}</span>
            </p>

            <button
                onClick={() => reset()}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-md transition-colors"
            >
                <RefreshCcw className="h-4 w-4" />
                Reboot Interface
            </button>
        </div>
    );
}
