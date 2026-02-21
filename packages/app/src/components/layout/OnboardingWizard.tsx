"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Terminal, Shield, Sparkles, Rocket, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingWizardProps {
    isOpen: boolean;
    onClose: () => void;
}

export function OnboardingWizard({ isOpen, onClose }: OnboardingWizardProps) {
    const [step, setStep] = useState(1);
    const [progress, setProgress] = useState(25);
    const [ollamaFound, setOllamaFound] = useState<boolean | null>(null);

    useEffect(() => {
        if (step === 2 && ollamaFound === null) {
            checkOllama();
        }
        setProgress(step * 25);
    }, [step]);

    const checkOllama = async () => {
        try {
            const res = await fetch('/api/models/ollama');
            setOllamaFound(res.ok);
        } catch {
            setOllamaFound(false);
        }
    };

    const nextStep = () => {
        if (step < 4) setStep(step + 1);
        else onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] bg-black border-green-900/50 text-green-500 font-mono overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-green-950">
                    <div
                        className="h-full bg-green-500 transition-all duration-500 shadow-[0_0_10px_#00FF41]"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <DialogHeader className="pt-4">
                    <div className="flex items-center gap-2 text-xs text-green-800 uppercase tracking-widest mb-2">
                        <Terminal className="h-3 w-3" />
                        Phase 0{step} // Initialization
                    </div>
                    <DialogTitle className="text-2xl font-bold tracking-tighter flex items-center gap-2">
                        {step === 1 && "Welcome to Phantom OS"}
                        {step === 2 && "Calibrating Intelligence"}
                        {step === 3 && "Contextual Awareness"}
                        {step === 4 && "System Active"}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-6 min-h-[200px] flex flex-col justify-center">
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <p className="text-green-400 leading-relaxed">
                                You have successfully booted the PM Operating System. Phantom is an invisible force
                                designed to ground your product decisions in high-fidelity data.
                            </p>
                            <div className="bg-green-950/20 border border-green-900/30 p-4 rounded-md">
                                <p className="text-xs text-green-700 italic">
                                    "The unexamined product is not worth building."
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                            <p className="text-green-400">Scanning local environment for neural compute...</p>
                            <div className="flex items-center gap-4 p-4 bg-green-950/20 border border-green-900/30 rounded-md">
                                {ollamaFound === null ? (
                                    <div className="h-8 w-8 rounded-full border-2 border-green-900 border-t-green-500 animate-spin" />
                                ) : ollamaFound ? (
                                    <CheckCircle2 className="h-8 w-8 text-green-500 drop-shadow-[0_0_5px_#00FF41]" />
                                ) : (
                                    <Shield className="h-8 w-8 text-orange-500" />
                                )}
                                <div>
                                    <p className="font-bold text-sm">
                                        {ollamaFound === null ? "Detecting Ollama..." : ollamaFound ? "Ollama Detected" : "Local AI Not Found"}
                                    </p>
                                    <p className="text-xs text-green-800">
                                        {ollamaFound ? "Running in High-Fidelity Local mode." : "System will require Cloud API keys for reasoning."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="p-4 bg-green-900/10 border border-green-900/30 rounded-md space-y-3">
                                <div className="flex items-center gap-2 text-green-400 font-bold">
                                    <Sparkles className="h-4 w-4" />
                                    Phase 3 Loaded: Connected Context
                                </div>
                                <p className="text-sm text-green-700">
                                    Phantom can now index Figma links, Notion docs, and web URLs.
                                    Everything you add becomes part of your collective intelligence.
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-4 text-center animate-in zoom-in-95 duration-500">
                            <div className="flex justify-center">
                                <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500 shadow-[0_0_20px_rgba(0,255,65,0.4)]">
                                    <Rocket className="h-8 w-8 text-green-400" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold uppercase tracking-widest text-green-400">Neural Link Established</h3>
                            <p className="text-sm text-green-700">
                                Your workspace is ready. Access the Config panel at any time to add API keys
                                or toggle autonomous features.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex items-center justify-between sm:justify-between w-full border-t border-green-900/30 pt-4">
                    <p className="text-[10px] text-green-900 uppercase">System Time: {new Date().toLocaleTimeString()}</p>
                    <Button
                        onClick={nextStep}
                        className="bg-green-900/50 hover:bg-green-700 text-green-100 border border-green-600 font-mono text-xs h-8 px-6 group"
                    >
                        {step === 4 ? "EXECUTE()" : "CONTINUE"}
                        <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
