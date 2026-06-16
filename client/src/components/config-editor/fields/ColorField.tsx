import React from 'react';
import { cn } from '../../../utils/cn';

interface ColorFieldProps {
    value: string;
    onChange: (value: string) => void;
    compact?: boolean;
    /** If true, renders the theme-style color picker (circle + label). Otherwise uses inline text + overlay picker. */
    themeStyle?: boolean;
}

export const ColorField: React.FC<ColorFieldProps> = ({ value, onChange, compact, themeStyle }) => {
    if (themeStyle) {
        return (
            <div className="flex items-center gap-3">
                <label className="cursor-pointer flex items-center gap-3 relative">
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div
                        className="w-8 h-8 rounded-full border shadow-m3-1"
                        style={{ backgroundColor: value }}
                    />
                    <span className="font-mono text-sm">{value}</span>
                </label>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 w-full">
            <div
                className={cn("rounded-full border-[3px] border-m3-outline shadow-m3-1 shrink-0", compact ? "w-5 h-5" : "w-8 h-8")}
                style={{ backgroundColor: value }}
            />
            <div className="relative flex-1">
                <input
                    type="text"
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    className={cn("w-full bg-transparent border-none p-0 text-m3-on-surface focus:ring-0 font-mono uppercase", compact ? "text-xs" : "text-sm")}
                />
                <input
                    type="color"
                    value={value ?? '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                />
            </div>
        </div>
    );
};
