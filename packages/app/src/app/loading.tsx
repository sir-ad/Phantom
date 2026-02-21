import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground font-mono p-4 text-center">
            <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                <span className="text-sm tracking-widest animate-pulse">BOOTING MATRIX_</span>
            </div>
        </div>
    );
}
