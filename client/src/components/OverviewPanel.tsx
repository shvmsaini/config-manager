import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface OverviewPanelProps {
    items: string[];
}

export const OverviewPanel: React.FC<OverviewPanelProps> = ({ items }) => {
    const [search, setSearch] = useState('');

    const filteredItems = items.filter(key =>
        key.toLowerCase().includes(search.toLowerCase())
    );

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="hidden lg:flex flex-col w-64 bg-m3-surface border-r border-m3-outline border-[3px] pt-6 pb-4 overflow-y-auto no-scrollbar z-20 shrink-0">
            <div className="px-6 mb-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-m3-primary uppercase tracking-widest">
                        Overview
                    </h3>
                    <div className="text-xs font-bold text-m3-on-primary bg-m3-primary px-2 py-0.5 rounded-full shadow-m3-1">
                        {filteredItems.length}
                    </div>
                </div>

                <div className="relative">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search widgets..."
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border-[3px] border-m3-outline bg-m3-surface focus:outline-none focus:ring-2 focus:ring-m3-primary/40"
                    />
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-m3-on-surface-variant" />
                </div>
            </div>

            <nav className="space-y-1 px-3">
                {filteredItems.map((key) => (
                    <button
                        key={key}
                        onClick={() => scrollToSection(key)}
                        className="w-full text-left px-4 py-2.5 text-sm text-m3-on-surface-variant hover:bg-m3-primary/10 hover:text-m3-primary truncate transition-all rounded-xl font-bold border border-transparent hover:border-m3-primary/20"
                        title={key}
                    >
                        {key}
                    </button>
                ))}
            </nav>
        </div>
    );
};
