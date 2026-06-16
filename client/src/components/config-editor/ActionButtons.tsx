import React from 'react';
import { Copy, Edit3, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ActionButtonsProps {
    isSection?: boolean;
    level: number;
    isConfirmingDelete: boolean;
    isRenaming: boolean;
    canDuplicate: boolean;
    canRename: boolean;
    canDelete: boolean;
    canCopy?: boolean;
    onDuplicate?: () => void;
    onCopy?: () => void;
    onStartRename: () => void;
    onRemove?: () => void;
    onConfirmDelete: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
    isSection = false,
    level,
    isConfirmingDelete,
    isRenaming,
    canDuplicate,
    canRename,
    canDelete,
    canCopy,
    onDuplicate,
    onCopy,
    onStartRename,
    onRemove,
    onConfirmDelete,
}) => (
    <div className={cn(
        "flex items-center gap-1 transition-all",
        isSection && level === 0 && "absolute right-2 top-2 z-10",
        isConfirmingDelete ? "opacity-100" : "opacity-0 group-hover/item:opacity-100",
        isRenaming && "hidden"
    )}>
        {canRename && (
            <button
                onClick={(e) => { e.stopPropagation(); onStartRename(); }}
                className="p-1 hover:bg-m3-surface-variant rounded-full text-m3-on-surface-variant"
                title="Rename Key"
            >
                <Edit3 className="w-4 h-4" />
            </button>
        )}

        {onCopy && canCopy && (
            <button
                onClick={(e) => { e.stopPropagation(); onCopy(); }}
                className="p-1 hover:bg-m3-surface-variant rounded-full text-m3-on-surface-variant"
                title="Copy Widget"
            >
                <Copy className="w-4 h-4" />
            </button>
        )}

        {onDuplicate && canDuplicate && (
            <button
                onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                className="p-1 hover:bg-m3-surface-variant rounded-full text-m3-on-surface-variant"
                title="Duplicate"
            >
                <Copy className="w-4 h-4" />
            </button>
        )}

        {onRemove && canDelete && (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onConfirmDelete();
                }}
                className="p-1 hover:bg-m3-error/10 text-m3-error rounded-full"
                title="Remove"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        )}
    </div>
);
