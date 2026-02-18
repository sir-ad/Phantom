import { useState } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, Terminal, Activity, Menu, X, Cpu, Server } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Placeholder pages
const Overview = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="System Status" icon={<Activity className="text-matrix-primary" />} value="ONLINE" sub="v1.0.0-beta" />
            <Card title="Active Agents" icon={<Cpu className="text-matrix-primary" />} value="3" sub="Idle" />
            <Card title="MCP Servers" icon={<Server className="text-matrix-primary" />} value="12" sub="Connected" />
        </div>
        <div className="p-6 rounded-lg border border-matrix-border bg-matrix-card">
            <h2 className="text-lg font-semibold mb-4 text-matrix-primary">Recent Activity</h2>
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-matrix-border last:border-0">
                        <span className="text-sm">Generated quarterly report</span>
                        <span className="text-xs text-matrix-muted">2m ago</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const Configuration = () => (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold text-matrix-primary">Configuration</h1>
        <div className="p-6 rounded-lg border border-matrix-border bg-matrix-card space-y-4">
            <h3 className="font-semibold text-white">Brand Identity</h3>
            <div className="grid gap-4">
                <Input label="Company Name" defaultValue="Phantom Corp" />
                <Input label="Support Email" defaultValue="support@phantom.app" />
                <Input label="Website" defaultValue="https://phantom.app" />
            </div>
        </div>
        <div className="p-6 rounded-lg border border-matrix-border bg-matrix-card space-y-4">
            <h3 className="font-semibold text-white">MCP Settings</h3>
            <div className="grid gap-4">
                <div className="flex items-center justify-between p-3 bg-matrix-bg rounded border border-matrix-border">
                    <span className="text-sm">Enable Local MCP Server</span>
                    <Toggle defaultChecked />
                </div>
            </div>
        </div>
    </div>
);

// Components
const Card = ({ title, icon, value, sub }: any) => (
    <div className="p-6 rounded-lg border border-matrix-border bg-matrix-card hover:border-matrix-primary/50 transition-colors">
        <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-matrix-muted">{title}</span>
            {icon}
        </div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-xs text-matrix-primary">{sub}</div>
    </div>
);

const Input = ({ label, ...props }: any) => (
    <div className="space-y-1">
        <label className="text-xs font-medium text-matrix-muted uppercase tracking-wider">{label}</label>
        <input
            className="w-full bg-matrix-bg border border-matrix-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-matrix-primary transition-colors"
            {...props}
        />
    </div>
);

const Toggle = ({ defaultChecked }: any) => (
    <button className={clsx(
        "w-10 h-5 rounded-full relative transition-colors",
        defaultChecked ? "bg-matrix-primary" : "bg-matrix-border"
    )}>
        <div className={clsx(
            "w-3 h-3 bg-black rounded-full absolute top-1 transition-all",
            defaultChecked ? "left-6" : "left-1"
        )} />
    </button>
);

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/' },
        { icon: Settings, label: 'Configuration', path: '/config' },
        { icon: Terminal, label: 'Logs', path: '/logs' },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-matrix-bg text-matrix-text font-sans">
            {/* Sidebar */}
            <aside className={twMerge(
                "fixed inset-y-0 left-0 z-50 w-64 bg-matrix-card border-r border-matrix-border transform transition-transform duration-200 lg:relative lg:translate-x-0",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-matrix-primary rounded-sm flex items-center justify-center text-black font-bold">P</div>
                        <span className="font-bold text-lg tracking-tight text-white">PHANTOM</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-matrix-muted hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <nav className="px-4 space-y-1 mt-6">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => twMerge(
                                "flex items-center space-x-3 px-4 py-3 rounded-md transition-colors text-sm font-medium",
                                isActive
                                    ? "bg-matrix-primary/10 text-matrix-primary border border-matrix-primary/20"
                                    : "text-matrix-muted hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="absolute bottom-6 left-6 right-6">
                    <div className="p-4 rounded bg-matrix-bg border border-matrix-border text-xs text-center text-matrix-muted">
                        Phantom Core v1.0.1<br />
                        <span className="text-matrix-primary">System All Green</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative">
                <header className="sticky top-0 z-40 bg-matrix-bg/80 backdrop-blur-md border-b border-matrix-border px-6 py-4 flex items-center justify-between">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-matrix-muted">
                        <Menu size={20} />
                    </button>
                    <div className="font-mono text-xs text-matrix-muted">
                        {location.pathname === '/' ? 'DASHBOARD' : location.pathname.slice(1).toUpperCase()}
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-xs">
                            <span className="w-2 h-2 rounded-full bg-matrix-primary animate-pulse"></span>
                            <span className="text-matrix-primary">LOCALHOST:3333</span>
                        </div>
                    </div>
                </header>

                <div className="p-6 max-w-7xl mx-auto pb-20">
                    <Routes>
                        <Route path="/" element={<Overview />} />
                        <Route path="/config" element={<Configuration />} />
                        <Route path="*" element={<div className="text-center py-20 text-matrix-muted">Module Offline</div>} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}

export default App
