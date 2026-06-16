import React, { useState, useEffect, useRef } from 'react';
import { Search, Check } from 'lucide-react';

interface ComponentSearchProps {
    isOpen: boolean;
    onClose: () => void;
    availableComponents: string[];
    currentValue: string;
    onSelect: (component: string) => void;
}

export const ComponentSearch: React.FC<ComponentSearchProps> = ({
    isOpen,
    onClose,
    availableComponents,
    currentValue,
    onSelect,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const searchRef = useRef<HTMLDivElement>(null);

    // Close search on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const filtered = availableComponents.filter(c =>
        c.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div
            ref={searchRef}
            className="absolute top-full left-0 w-full mt-1 bg-m3-surface border-[3px] border-m3-outline rounded-xl shadow-m3-3 z-[101] max-h-48 overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95"
        >
            <div className="sticky top-0 bg-m3-surface p-3 border-b-[3px] border-m3-outline flex items-center gap-2 z-10">
                <Search className="w-4 h-4 text-m3-on-surface-variant" />
                <input
                    autoFocus
                    className="bg-transparent border-none p-0 text-xs w-full focus:ring-0 outline-none focus:outline-none font-mono"
                    placeholder="Search widgets..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>
            {filtered.map(comp => (
                <button
                    key={comp}
                    onClick={() => onSelect(comp)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-m3-primary/10 text-m3-on-surface transition-all flex items-center justify-between"
                >
                    <span className="font-mono">{comp}</span>
                    {currentValue === comp && <Check className="w-3.5 h-3.5 text-m3-primary" />}
                </button>
            ))}
            {filtered.length === 0 && (
                <div className="p-4 text-xs text-m3-on-surface-variant text-center italic">No widgets found</div>
            )}
            <div
                className="sticky bottom-0 bg-m3-surface p-2 text-[10px] uppercase font-bold tracking-widest text-m3-on-surface text-center border-t-[3px] border-m3-outline cursor-pointer hover:bg-m3-on-surface/5 transition-colors z-10"
                onClick={onClose}
            >
                Close Search
            </div>
        </div>
    );
};
