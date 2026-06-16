import React from 'react';
import {
    Files,
    Settings,
    Layout,
    Navigation,
    Palette,
    X,
    LogOut,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { definitions } from '../data/definitions';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
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

export const MobileMenu: React.FC<MobileMenuProps> = ({
    isOpen,
    onClose,
    activeTab,
    setActiveTab,
    onLogout,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-80 max-w-[85vw] bg-m3-surface h-full shadow-2xl flex flex-col p-4 animate-in slide-in-from-left duration-300">
                <div className="h-12 flex items-center justify-between mb-4 border-b border-m3-outline/30 pb-3">
                    <div className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-m3-primary" />
                        <span className="text-lg font-bold text-m3-primary tracking-tight">CONFIG</span>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-m3-on-surface/10">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
                    {definitions.map((def) => (
                        <button
                            key={def.fileName}
                            onClick={() => {
                                setActiveTab(def.fileName);
                                onClose();
                            }}
                            className={cn(
                                "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all",
                                activeTab === def.fileName
                                    ? "bg-m3-primary text-m3-on-primary shadow-m3-2"
                                    : "text-m3-on-surface-variant hover:bg-m3-on-surface/5"
                            )}
                        >
                            {getIconForFile(def.fileName)}
                            <span className="truncate">{def.fileName.replace('.json', '').toUpperCase()}</span>
                        </button>
                    ))}
                </nav>
                <div className="flex flex-col pt-2 mt-2 border-t border-m3-outline/30">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-full text-sm font-bold tracking-widest uppercase transition-all text-m3-on-surface hover:bg-m3-error/10 hover:text-m3-error hover:border-m3-error border-[3px] border-m3-outline"
                    >
                        <LogOut className="w-4 h-4" />
                        LOGOUT
                    </button>
                    <div className="px-3 py-2 mt-2 text-center">
                        <div className="text-[10px] font-bold text-m3-on-surface-variant/40 uppercase tracking-widest">
                            V 1.0
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
