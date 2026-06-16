import React from 'react';

interface SelectFieldProps {
    value: string;
    options: string[];
    onChange: (value: string) => void;
    placeholder?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
    value,
    options,
    onChange,
    placeholder = 'Select...',
}) => (
    <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent border-[3px] border-m3-outline rounded px-2 py-1 text-sm font-mono focus:ring-1 focus:ring-m3-primary focus:outline-none"
    >
        <option value="" disabled>{placeholder}</option>
        {options.map(option => (
            <option key={option} value={option}>{option}</option>
        ))}
    </select>
);
