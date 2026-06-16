import React, { useState } from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '../../utils/cn';

// Ensure window.draggedItemState is typed for TypeScript
declare global {
    interface Window {
        draggedItemState: { key: string, parentPath: string[] } | null;
    }
}

if (typeof window !== 'undefined' && !window.draggedItemState) {
    window.draggedItemState = null;
}

const isSamePath = (p1: string[], p2: string[]) => {
    if (p1.length !== p2.length) return false;
    return p1.every((val, index) => val === p2[index]);
};

interface DragWrapperProps {
    itemKey: string;
    path: string[];
    isRenaming: boolean;
    onMoveKey?: (key: string, direction: 'up' | 'down') => void;
    onReorder?: (sourceKey: string, targetKey: string) => void;
    children: (props: { isDragging: boolean; isDragOver: boolean }) => React.ReactNode;
}

export const DragWrapper: React.FC<DragWrapperProps> = ({
    itemKey,
    path,
    isRenaming,
    onMoveKey,
    onReorder,
    children,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const parentPath = path.slice(0, -1);

    return (
        <div
            className={cn(
                "flex items-center group/drag transition-all duration-200",
                isDragging && "opacity-20 scale-95",
                isDragOver && "border-t-4 border-m3-primary pt-2"
            )}
            draggable={!isRenaming}
            onDragStart={(e) => {
                e.stopPropagation();
                window.draggedItemState = { key: itemKey, parentPath };
                e.dataTransfer.setData('text/plain', itemKey);
                e.dataTransfer.effectAllowed = 'move';
                setTimeout(() => setIsDragging(true), 10);
            }}
            onDragEnd={(e) => {
                e.stopPropagation();
                setIsDragging(false);
                window.draggedItemState = null;
            }}
            onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.draggedItemState && isSamePath(window.draggedItemState.parentPath, parentPath) && window.draggedItemState.key !== itemKey) {
                    setIsDragOver(true);
                }
            }}
            onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.draggedItemState && isSamePath(window.draggedItemState.parentPath, parentPath) && window.draggedItemState.key !== itemKey) {
                    e.dataTransfer.dropEffect = 'move';
                }
            }}
            onDragLeave={(e) => {
                e.stopPropagation();
                setIsDragOver(false);
            }}
            onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragOver(false);
                if (window.draggedItemState && isSamePath(window.draggedItemState.parentPath, parentPath) && window.draggedItemState.key !== itemKey) {
                    if (onReorder) {
                        onReorder(window.draggedItemState.key, itemKey);
                    }
                }
                window.draggedItemState = null;
            }}
        >
            {onMoveKey && (
                <div
                    className="cursor-grab active:cursor-grabbing p-2 text-m3-on-surface-variant/30 hover:text-m3-primary hover:bg-m3-primary/10 rounded-lg transition-all mr-1 select-none touch-none"
                    title="Drag handle (or click to move up)"
                    onClick={(e) => {
                        e.stopPropagation();
                        onMoveKey(itemKey, 'up');
                    }}
                >
                    <GripVertical className="w-5 h-5 pointer-events-none" />
                </div>
            )}
            {children({ isDragging, isDragOver })}
        </div>
    );
};

export { isSamePath };
