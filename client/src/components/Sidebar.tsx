import React from 'react';
import {
    Files,
    Settings,
    Layout,
    Navigation,
    Palette,
    LogOut,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { definitions } from '../data/definitions';
import { FlyingFlight } from './FlyingFlight';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
}

const getIconForFile = (fileName: string) => {
    if (fileName.includes('theme')) return <Palette className="w-6 h-6" />;
    if (fileName.includes('nav')) return <Navigation className="w-6 h-6" />;
    if (fileName.includes('page') || fileName.includes('layout')) return <Layout className="w-6 h-6" />;
    if (fileName.includes('config')) return <Settings className="w-6 h-6" />;
    return <Files className="w-6 h-6" />;
};

export const Sidebar: React.FC<SidebarProps> = ({
    activeTab,
    setActiveTab,
    onLogout,
}) => {
    return (
        <div
            className="hidden md:flex flex-col bg-m3-surface/70 backdrop-blur-xl text-m3-on-surface-variant transition-all duration-300 ease-in-out border-r border-m3-outline border-[3px] z-30 overflow-hidden relative w-64"
        >
            <div className="h-20 shrink-0 relative">
                <FlyingFlight className="w-full h-full" />
                <div className="absolute top-4 left-6 flex flex-col opacity-100">
                    <span className="font-extrabold text-lg tracking-tight text-m3-primary leading-none">
                        NextGen App
                    </span>
                    <span className="font-semibold text-xs text-m3-on-surface-variant tracking-widest uppercase">
                        Config Manager
                    </span>
                </div>
            </div>

            <nav className="flex-1 py-6 space-y-4 overflow-y-auto no-scrollbar">
                {definitions.map((def) => {
                    const isActive = activeTab === def.fileName;
                    return (
                        <button
                            key={def.fileName}
                            onClick={() => setActiveTab(def.fileName)}
                            className={cn(
                                "w-full flex items-center h-14 transition-all duration-200 relative group/btn shrink-0",
                                isActive ? "text-m3-primary" : "text-m3-on-surface-variant hover:text-m3-on-surface"
                            )}
                        >
                            <div className="w-20 h-14 flex items-center justify-center shrink-0">
                                <div className={cn(
                                    "w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300",
                                    isActive
                                        ? "bg-m3-primary-container text-m3-on-primary-container shadow-m3-2 scale-110"
                                        : "group-hover/btn:bg-m3-on-surface/10 hover:scale-105"
                                )}>
                                    {getIconForFile(def.fileName)}
                                </div>
                            </div>
                            <span className="whitespace-nowrap transition-all duration-300 overflow-hidden text-sm text-left font-bold ml-2 w-auto pr-6 opacity-100">
                                {def.fileName.replace('.json', '').toUpperCase()}
                            </span>
                        </button>
                    )
                })}
            </nav>

            <div className="flex flex-col shrink-0">
                <div className="p-3 pt-4">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 h-11.5 rounded-full bg-m3-surface-variant/30 hover:bg-m3-error/10 hover:text-m3-error hover:border-m3-error transition-all border-[3px] border-m3-outline text-m3-on-surface text-xs font-bold tracking-widest uppercase"
                        title="Sign Out"
                    >
                        <LogOut className="w-4 h-4" />
                        LOGOUT
                    </button>
                </div>
                <div className="border-t border-m3-outline p-4 h-14 flex items-center">
                    <div className="text-[10px] font-bold text-m3-on-surface-variant/40 uppercase tracking-widest w-full text-center">
                        V 1.0
                    </div>
                </div>
            </div>
        </div>
    );
};
