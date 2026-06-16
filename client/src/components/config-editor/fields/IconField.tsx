import React from 'react';

const PREDEFINED_ICONS = ['home', 'search', 'movies', 'favorites', 'profile', 'maps', 'music', 'videos', 'games', 'news', 'flighttakeoff'];

interface IconFieldProps {
    value: string;
    onChange: (value: string) => void;
    path: string[];
}

export const IconField: React.FC<IconFieldProps> = ({ value, onChange }) => {
    const isPredefinedIcon = typeof value === 'string' && PREDEFINED_ICONS.includes(value.toLowerCase());

    return (
        <div className="flex flex-1 items-center gap-2">
            <select
                value={isPredefinedIcon ? value.toLowerCase() : 'custom'}
                onChange={(e) => {
                    if (e.target.value === 'custom') {
                        onChange('https://');
                    } else {
                        onChange(e.target.value);
                    }
                }}
                className="w-1/3 min-w-[120px] bg-transparent border-[3px] border-m3-outline rounded px-2 py-1 text-sm font-mono focus:ring-1 focus:ring-m3-primary focus:outline-none"
            >
                <option value="" disabled>Select icon...</option>
                {PREDEFINED_ICONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                ))}
                <option value="custom">Custom (URL)</option>
            </select>
            {!isPredefinedIcon && (
                <input
                    type="text"
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Enter icon URL..."
                    className="flex-1 bg-transparent border-[3px] border-m3-outline rounded px-2 py-1 text-sm font-mono focus:ring-1 focus:ring-m3-primary focus:outline-none"
                />
            )}
        </div>
    );
};

export { PREDEFINED_ICONS };
