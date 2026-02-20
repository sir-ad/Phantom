import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Send } from 'lucide-react';

const LOGS = [
    { text: "> initializing phantom v2.0...", delay: 0 },
    { text: "> connecting to workspace...", delay: 800 },
    { text: "> listening on slack...", delay: 1500 },
    { text: "> listening on linear...", delay: 2200 },
    { text: "> listening on github...", delay: 2800 },
    { text: "> system online.", delay: 3500, highlight: true },
];

export default function TerminalHero() {
    const [lines, setLines] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    useEffect(() => {
        let timeouts: NodeJS.Timeout[] = [];

        LOGS.forEach((log, index) => {
            const timeout = setTimeout(() => {
                setLines(prev => [...prev, log]);
            }, log.delay);
            timeouts.push(timeout);
        });

        return () => timeouts.forEach(clearTimeout);
    }, []);

    const handleCommand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const cmd = input.trim().toLowerCase();
        setLines(prev => [...prev, { text: `$ ${input}`, user: true }]);
        setInput('');
        setIsThinking(true);

        setTimeout(() => {
            setIsThinking(false);
            if (cmd === 'help') {
                setLines(prev => [...prev,
                { text: "available commands:" },
                { text: "  why        // read the memorandum" },
                { text: "  install    // get phantom" },
                { text: "  skills     // browse registry" },
                { text: "  demo       // simulate intervention" }
                ]);
            } else if (cmd === 'why') {
                window.location.href = '/memorandum';
            } else if (cmd === 'install') {
                setLines(prev => [...prev, { text: "> npm install -g @phantom/cli", highlight: true }]);
            } else {
                setLines(prev => [...prev, { text: `command not found: ${cmd}` }]);
            }
        }, 600);
    };

    return (
        <div className="w-full font-mono text-sm md:text-base border border-muted bg-black/50 backdrop-blur-md rounded-lg shadow-2xl overflow-hidden glowing-border">
            <div className="flex items-center justify-between px-4 py-2 border-b border-muted bg-muted/20">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Terminal className="w-4 h-4" />
                    <span>phantom-core</span>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                </div>
            </div>

            <div className="p-6 h-[60vh] overflow-y-auto flex flex-col gap-2 scrollbar-hide">
                {lines.map((line, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`${line.highlight ? 'text-primary font-bold' : line.user ? 'text-white' : 'text-muted-foreground'}`}
                    >
                        {line.text}
                    </motion.div>
                ))}

                {isThinking && (
                    <div className="text-muted-foreground animate-pulse">...</div>
                )}

                <form onSubmit={handleCommand} className="flex items-center gap-2 mt-4 text-primary">
                    <span>$</span>
                    <input
                        className="bg-transparent border-none outline-none flex-1 text-white placeholder:text-muted-foreground/50"
                        placeholder="type 'help'..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        autoFocus
                    />
                </form>
            </div>
        </div>
    );
}
