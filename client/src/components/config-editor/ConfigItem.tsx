import React, { useState } from 'react';
import { ChevronRight, Check, ExternalLink, Info } from 'lucide-react';
import { cn } from '../../utils/cn';
import { type ConfigItemDefinition } from '../../data/definitions';
import { DragWrapper } from './DragWrapper';
import { ActionButtons } from './ActionButtons';
import { ComponentSearch } from './ComponentSearch';
import { BooleanField } from './fields/BooleanField';
import { ColorField } from './fields/ColorField';
import { RadioField } from './fields/RadioField';
import { SelectField } from './fields/SelectField';
import { IntegerField } from './fields/IntegerField';
import { TextField } from './fields/TextField';
import { IconField } from './fields/IconField';

// ── Helpers ────────────────────────────────────────────────────────

const INTEGER_KEYWORDS = [
    'height', 'width', 'radius', 'length', 'lines', 'elevation', 'targetvalue',
    'autoscrollduration', 'gridcolumns', 'maxitems', 'margin',
];

interface ConfigItemProps {
    item: ConfigItemDefinition;
    value: any;
    onChange: (path: string[], value: any) => void;
    path: string[];
    level: number;
    parentType?: 'array' | 'section';
    onRemove?: () => void;
    onDuplicate?: () => void;
    compact?: boolean;
    allData?: { [fileName: string]: any };
    activeTab?: string;
    setActiveTab?: (tab: string) => void;
    onRenameKey?: (oldKey: string, newKey: string) => void;
    onMoveKey?: (key: string, direction: 'up' | 'down') => void;
    onReorder?: (sourceKey: string, targetKey: string) => void;
    // Recursive renderer – passed down to avoid circular imports
    RecursiveEditor: React.FC<any>;
}

export const ConfigItem: React.FC<ConfigItemProps> = ({
    item, value, onChange, path, level, parentType, onRemove, compact,
    allData, activeTab, setActiveTab, onRenameKey, onMoveKey, onReorder,
    onDuplicate, RecursiveEditor,
}) => {
    const [isExpanded, setIsExpanded] = useState(level < 1 && !compact);
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(item.key);
    const [showComponentSearch, setShowComponentSearch] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    const handleValueChange = (val: any) => onChange(path, val);

    const handleRenameSubmit = () => {
        if (onRenameKey && newName !== item.key) {
            onRenameKey(item.key, newName);
        }
        setIsRenaming(false);
    };

    const handleConfirmDelete = () => {
        setIsConfirmingDelete(true);
        setTimeout(() => {
            const confirmed = window.confirm(`Remove this item?`);
            setIsConfirmingDelete(false);
            if (confirmed && onRemove) onRemove();
        }, 10);
    };

    // ── Field type detection ───────────────────────────────────────
    const isIntegerField = INTEGER_KEYWORDS.some(kw => item.key.toLowerCase().includes(kw));
    const isNavPositionField = activeTab === 'navigation.json' && item.key === 'navPosition';
    const isDrawerPositionField = activeTab === 'navigation.json' && item.key === 'drawerPosition';
    const isIndicatorStyleField = item.key === 'indicatorStyle';
    const isFavoriteIconField = item.key === 'favoriteIcon';
    const isAnimationTypeField = item.key === 'animationType';
    const isLayoutTypeField = item.key === 'layoutType';
    const isIconField = item.key === 'icon';
    const isSlideFromField = item.key === 'slideFrom';
    const isCategoryIdField = item.key === 'categoryId';
    const isLockedLayoutType =
        activeTab === 'widgets.json' &&
        level > 0 &&
        (item.key === 'type' || item.key === 'layoutType') &&
        path.length > 0 &&
        typeof value === 'string' &&
        path[0] === value;

    const isLockedParentField =
        activeTab === 'widgets.json' &&
        level > 0 &&
        item.key === 'parent' &&
        path.length > 0 &&
        typeof value === 'string';

    const isColorField =
        activeTab === "theme.json" &&
        path.includes("colors") &&
        typeof value === "string" &&
        /^#([0-9A-F]{3}){1,2}$/i.test(value);

    const isRoutePageField =
        activeTab === 'navigation.json' &&
        path.length >= 3 &&
        path[0] === 'routes' &&
        item.key === 'page';

    const isStartDestinationField =
        activeTab === 'navigation.json' &&
        item.key === 'startDestination';

    const isComponentField =
        item.key === 'itemType' ||
        item.key === 'layoutType' ||
        item.key === 'type' ||
        item.key === 'parent' ||
        item.key === 'widget' ||
        item.key === 'widgets' ||
        path[path.length - 2] === 'widgets';

    const isImage = typeof value === 'string' && (value.match(/\.(jpeg|jpg|gif|png|webp|svg)$/) != null || value.startsWith('http'));

    // slideFrom validity check
    let isSlideFromValid = true;
    if (isSlideFromField) {
        let parentObj: any = allData?.[activeTab || ''] || {};
        for (let i = 0; i < path.length - 1; i++) {
            if (parentObj) parentObj = parentObj[path[i]];
        }
        isSlideFromValid = parentObj?.animationType === 'slideInVertically';
    }

    // ── Permission flags ───────────────────────────────────────────
    const isPredefined = level === 0 && value?.type === item.key;
    const isPageName = activeTab === 'pages.json' && level === 0;
    const isWidgetRootLevel = activeTab === 'widgets.json' && level === 0;
    const isCustomWidget = isWidgetRootLevel && !isPredefined;
    const isArrayElement = parentType === 'array';
    const isRouteProperty = activeTab === 'navigation.json' && path.length >= 3 && path[0] === 'routes' && !isArrayElement;

    const canRename = (isPageName || isCustomWidget) && !isPredefined;
    const canDelete = (isPageName || isArrayElement || isCustomWidget) && !isRouteProperty && !isPredefined;
    const canDuplicate = (isPageName || isArrayElement || isCustomWidget) && !isRouteProperty && !isPredefined;
    const canCopy = isPredefined;
    // NOTE: canToggle is for future feature to allow toggling visibility of items
    // const canToggle = !isRouteProperty && !isPredefined && !isInsideWidget;

    const elementId = path.join('-');

    const isWidgetRoot = activeTab === 'widgets.json' && level === 0 && item.type === 'section';
    const missingTypeOrParent = isWidgetRoot && typeof value === 'object' && value !== null && !Array.isArray(value) && !value.hasOwnProperty('type') && !value.hasOwnProperty('parent');

    // ── Tooltip ────────────────────────────────────────────────────
    const Tooltip = ({ showDescription = false }: { showDescription?: boolean }) => {
        if (!item.description && !item.type) return null;
        // For root sections that show description inline, skip tooltip
        if (showDescription) return null;

        return (
            <div className="relative group/tooltip flex items-center ml-1 z-50 shrink-0" onClick={(e) => e.stopPropagation()}>
                <Info className={cn("text-m3-on-surface-variant/40 hover:text-m3-primary cursor-help transition-colors", compact ? "w-3.5 h-3.5" : "w-4 h-4")} />
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover/tooltip:block w-72 bg-m3-inverse-surface shadow-[0_8px_30px_rgb(0,0,0,0.3)] rounded-m3-md p-4 z-[100] animate-in fade-in zoom-in-95 pointer-events-none whitespace-normal text-left border border-white/10">
                    <div className="text-sm font-bold text-m3-inverse-on-surface mb-2 flex items-center justify-between gap-3">
                        <span className="truncate">{item.label}</span>
                        <span className="text-[10px] bg-m3-primary/20 text-m3-primary-container px-1.5 py-0.5 rounded uppercase font-mono tracking-wider shrink-0">{item.type}</span>
                    </div>
                    {item.description && (
                        <p className="text-xs text-m3-inverse-on-surface/80 leading-relaxed font-sans mt-2">
                            {item.description}
                        </p>
                    )}
                    {item.value !== undefined && (
                        <div className="mt-2 pt-2 border-t border-m3-inverse-on-surface/10">
                            <p className="text-[10px] text-m3-inverse-on-surface/50 font-bold uppercase tracking-wider mb-1">
                                Default Value
                            </p>
                            <p className="text-[11px] text-white font-mono font-bold break-all">
                                {JSON.stringify(item.value)}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // ── Rename input ───────────────────────────────────────────────
    const RenameInput = ({ isLeaf = false }: { isLeaf?: boolean }) => (
        <div className={cn("flex items-center gap-2", isLeaf && "flex-1 min-w-0")} onClick={e => e.stopPropagation()}>
            <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Enter') handleRenameSubmit();
                    if (e.key === 'Escape') setIsRenaming(false);
                }}
                className={cn(
                    "bg-m3-surface border border-m3-primary px-2 py-0.5 rounded text-sm font-mono",
                    isLeaf ? "border-[2px] rounded-sm text-xs w-full min-w-[120px] focus:outline-none focus:ring-0" : "w-full"
                )}
            />
            <button onClick={handleRenameSubmit} className={cn("text-m3-primary", isLeaf && "shrink-0 p-1 hover:bg-m3-primary/10 rounded transition-colors")}>
                <Check className="w-4 h-4" />
            </button>
        </div>
    );

    // ── Action buttons shorthand ───────────────────────────────────
    const Actions = ({ isSection = false }: { isSection?: boolean }) => (
        <ActionButtons
            isSection={isSection}
            level={level}
            isConfirmingDelete={isConfirmingDelete}
            isRenaming={isRenaming}
            canDuplicate={canDuplicate}
            canRename={canRename}
            canDelete={canDelete}
            canCopy={canCopy}
            onDuplicate={onDuplicate}
            onCopy={onDuplicate}
            onStartRename={() => setIsRenaming(true)}
            onRemove={onRemove}
            onConfirmDelete={handleConfirmDelete}
        />
    );

    // ══════════════════════════════════════════════════════════════
    // SECTION / ARRAY RENDERER
    // ══════════════════════════════════════════════════════════════
    if (item.type === 'section' || item.type === 'array') {
        const isRoot = level === 0;

        return (
            <DragWrapper
                itemKey={item.key}
                path={path}
                isRenaming={isRenaming}
                onMoveKey={onMoveKey}
                onReorder={onReorder}
            >
                {({ isDragging }) => (
                    <div
                        id={elementId}
                        className={cn(
                            "flex-1 transition-all duration-300 relative group/item scroll-mt-24",
                            isDragging && "select-none",
                            isRoot
                                ? cn("bg-m3-surface shadow-m3-1 border-[3px] border-m3-outline", compact ? "rounded-m3-lg mt-2" : "rounded-m3-xl p-0 mt-6")
                                : cn("mt-2", isExpanded ? "border-l-2 border-m3-outline border-[3px] pl-4 py-2" : "py-1")
                        )}
                    >
                        {!compact && <Actions isSection={true} />}

                        <div className="w-full" onClick={() => setIsExpanded(!isExpanded)}>
                            <div className={cn(
                                "flex items-center justify-between cursor-pointer group focus:outline-none transition-colors rounded-m3-lg select-none",
                                isRoot
                                    ? cn("bg-m3-surface-variant/30 hover:bg-m3-surface-variant/50 rounded-b-none transition-all", compact ? "py-2 px-3 min-h-[40px]" : "px-6 py-3 min-h-[56px] mb-4")
                                    : cn("hover:bg-m3-on-surface/5 px-2 transition-all", compact ? "py-1.5" : "py-3")
                            )}>
                                <div className="flex items-center gap-3 flex-1">
                                    <div className={cn(
                                        "transition-transform duration-300 text-m3-on-surface-variant shrink-0",
                                        isExpanded ? "rotate-90" : "rotate-0",
                                        compact ? "scale-75" : ""
                                    )}>
                                        <ChevronRight className={cn(compact ? "w-4 h-4" : "w-5 h-5")} />
                                    </div>

                                    <div className="flex flex-col min-w-0 flex-1">
                                        {isRenaming ? (
                                            <RenameInput />
                                        ) : (
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <span className={cn(
                                                    "font-medium text-m3-on-surface flex items-center gap-2 truncate",
                                                    isRoot ? (compact ? "text-sm font-medium" : "text-xl font-bold") : (compact ? "text-xs" : "text-base")
                                                )}>
                                                    {item.label}
                                                    {parentType === 'array' && (
                                                        <span className="text-[10px] text-m3-on-surface-variant font-mono bg-m3-surface-variant px-1.5 rounded opacity-70">
                                                            #{path[path.length - 1]}
                                                        </span>
                                                    )}
                                                </span>
                                                <Tooltip showDescription={isRoot && !!item.description && !compact} />
                                            </div>
                                        )}
                                        {isRoot && item.description && !compact && (
                                            <span className="text-xs text-m3-on-surface-variant/80 font-normal line-clamp-1">
                                                {item.description}
                                            </span>
                                        )}
                                        {missingTypeOrParent && (
                                            <span className="text-[10px] text-m3-error font-medium bg-m3-error/10 px-1.5 py-0.5 rounded mt-1 w-fit">
                                                ⚠️ Missing "type" or "parent" key
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isExpanded && value && (
                            <div className={cn(
                                "animate-in slide-in-from-top-2 fade-in duration-300 origin-top",
                                isRoot ? (compact ? "px-2 pb-2" : "px-4 pb-4") : "mt-2"
                            )}>
                                <RecursiveEditor
                                    items={item.children || []}
                                    values={value}
                                    onChange={onChange}
                                    path={path}
                                    level={level + 1}
                                    compact={compact}
                                    allData={allData}
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                    onReorder={onReorder}
                                />
                            </div>
                        )}
                    </div>
                )}
            </DragWrapper>
        );
    }

    // ══════════════════════════════════════════════════════════════
    // LEAF NODE (INPUT) RENDERER
    // ══════════════════════════════════════════════════════════════

    const navigateToComponent = () => {
        if (setActiveTab && value) {
            setActiveTab('widgets.json');
            setTimeout(() => {
                const element = document.getElementById(value);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('ring-4', 'ring-emerald-500', 'ring-offset-4', 'animate-pulse');
                    setTimeout(() => {
                        element.classList.remove('ring-4', 'ring-emerald-500', 'ring-offset-4', 'animate-pulse');
                    }, 3000);
                }
            }, 300);
        }
    };

    const availableComponents = allData ? Object.keys(allData['widgets.json'] || {}) : [];

    // ── Resolve which field to render ──────────────────────────────
    const renderField = () => {
        if (isLockedLayoutType) {
            return (
                <div className="flex items-center gap-2 select-none">
                    <span className="font-mono text-xs font-bold bg-m3-surface-variant/80 text-m3-on-surface-variant px-2.5 py-1.5 rounded-xl border border-m3-outline/25">
                        {value}
                    </span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-m3-on-surface-variant opacity-60">
                        System Core Type
                    </span>
                </div>
            );
        }

        if (isLockedParentField) {
            return (
                <div className="flex items-center gap-2 select-none">
                    <span className="font-mono text-xs font-bold bg-m3-surface-variant/80 text-m3-on-surface-variant px-2.5 py-1.5 rounded-xl border border-m3-outline/25">
                        {value}
                    </span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-m3-on-surface-variant opacity-60">
                        Parent Widget
                    </span>
                </div>
            );
        }

        if (item.type === 'boolean') {
            return <BooleanField value={value} onChange={handleValueChange} compact={compact} />;
        }

        if (item.type === 'color') {
            return <ColorField value={value} onChange={handleValueChange} compact={compact} />;
        }

        if (isNavPositionField) {
            return <RadioField value={value} options={['top', 'bottom', 'drawer']} onChange={handleValueChange} path={path} />;
        }
        if (isDrawerPositionField) {
            return <RadioField value={value} options={['left', 'right']} onChange={handleValueChange} path={path} />;
        }
        if (isIndicatorStyleField) {
            return <RadioField value={value} options={['dots', 'pills', 'dashes', 'none']} onChange={handleValueChange} path={path} />;
        }
        if (isFavoriteIconField) {
            return <RadioField value={value} options={['favorite', 'bookmark']} onChange={handleValueChange} path={path} />;
        }
        if (isSlideFromField) {
            return <RadioField value={value} options={['top', 'bottom']} onChange={handleValueChange} path={path} disabled={!isSlideFromValid} disabledMessage="Requires animationType: slideInVertically" />;
        }

        if (isAnimationTypeField) {
            return <SelectField value={value} options={['slideInHorizontally', 'expandHorizontally', 'slideInVertically', 'fadeIn']} onChange={handleValueChange} placeholder="Select animation..." />;
        }
        if (isLayoutTypeField) {
            return <SelectField value={value} options={['bannerCarousel', 'horizontal_list', 'vertical_list', 'grid']} onChange={handleValueChange} placeholder="Select layout..." />;
        }
        if (isRoutePageField) {
            return <SelectField value={value} options={Object.keys(allData?.['pages.json'] || {})} onChange={handleValueChange} placeholder="Select page..." />;
        }
        if (isStartDestinationField) {
            const routeNames = Array.from(new Set(((allData?.['navigation.json']?.routes || []) as any[]).map((r: any) => r.name).filter(Boolean)));
            return <SelectField value={value} options={routeNames as string[]} onChange={handleValueChange} placeholder="Select destination..." />;
        }

        if (isColorField) {
            return <ColorField value={value} onChange={handleValueChange} themeStyle />;
        }

        if (isIconField) {
            return <IconField value={value} onChange={handleValueChange} path={path} />;
        }

        if (isCategoryIdField) {
            return (
                <input
                    type="number"
                    value={value ?? ''}
                    onChange={(e) => {
                        const intVal = parseInt(e.target.value, 10);
                        handleValueChange(isNaN(intVal) ? '' : intVal);
                    }}
                    className="w-40 bg-transparent border-[3px] border-m3-outline rounded px-3 py-1 text-sm font-mono focus:ring-1 focus:ring-m3-primary focus:outline-none appearance-none"
                    style={{ MozAppearance: 'textfield' }}
                    placeholder="e.g. 123456"
                />
            );
        }

        if (isIntegerField) {
            return <IntegerField value={value} onChange={handleValueChange} />;
        }

        // Default: text field
        return (
            <div className="relative flex-1 flex items-center gap-2">
                <TextField
                    value={value}
                    onChange={handleValueChange}
                    compact={compact}
                    placeholder={item.value ? `Default: ${String(item.value)}` : 'Enter value...'}
                    isImage={isImage}
                    isComponentField={isComponentField}
                    onFocus={() => isComponentField && setShowComponentSearch(true)}
                />
                {isComponentField && value && availableComponents.includes(value) && (
                    <button
                        onClick={(e) => { e.preventDefault(); navigateToComponent(); }}
                        className="p-1 hover:bg-emerald-500/10 text-emerald-500 rounded transition-all"
                        title="Go to component definition"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                )}
                {isComponentField && (
                    <ComponentSearch
                        isOpen={showComponentSearch}
                        onClose={() => setShowComponentSearch(false)}
                        availableComponents={availableComponents}
                        currentValue={value}
                        onSelect={(comp) => { handleValueChange(comp); setShowComponentSearch(false); }}
                    />
                )}
            </div>
        );
    };

    return (
        <DragWrapper
            itemKey={item.key}
            path={path}
            isRenaming={isRenaming}
            onMoveKey={onMoveKey}
            onReorder={onReorder}
        >
            {({ isDragging }) => (
                <div className={cn(
                    "group/item relative flex-1 flex items-start transition-all duration-300 rounded-m3-sm",
                    isDragging && "select-none",
                    "hover:bg-m3-on-surface/5 px-2",
                    compact ? "gap-1 my-0.5" : "gap-2 my-0"
                )} id={elementId}>
                    <div className={cn(
                        "relative flex-1 bg-m3-surface hover:bg-m3-surface-container transition-colors rounded-t-m3-sm rounded-b-none border-b border-m3-outline border-[3px] group-hover/item:border-m3-on-surface",
                        "focus-within:border-m3-primary focus-within:border-b-2 focus-within:bg-m3-surface",
                        compact ? "px-2 pt-3 pb-1 min-h-[36px]" : "px-4 pt-5 pb-2"
                    )}>
                        {isImage && (
                            <div className={cn(
                                "absolute right-3 rounded-m3-md overflow-hidden bg-m3-surface shadow-m3-1 border-[3px] border-m3-outline z-10",
                                compact ? "top-1 w-6 h-6" : "top-3 w-10 h-10"
                            )}>
                                <img src={value} className="w-full h-full object-cover" alt="" onError={(e) => e.currentTarget.style.display = 'none'} />
                            </div>
                        )}

                        {/* Label row */}
                        <div className="flex justify-between items-center mb-0.5 pointer-events-none">
                            <div className="flex items-center gap-1.5 z-10 w-full relative pointer-events-auto">
                                {isRenaming ? (
                                    <RenameInput isLeaf />
                                ) : (
                                    <label className={cn(
                                        "font-medium group-focus-within:text-m3-primary transition-colors flex items-center gap-1 font-mono pointer-events-none",
                                        "text-m3-on-surface-variant/70",
                                        compact ? "text-[10px]" : "text-xs"
                                    )}>
                                        {item.label}
                                        {parentType === 'array' && (
                                            <span className="opacity-50">#{path[path.length - 1]}</span>
                                        )}
                                    </label>
                                )}
                                <div className="pointer-events-auto mr-auto">
                                    <Tooltip />
                                </div>
                            </div>
                        </div>

                        {/* Field */}
                        <div className={cn("relative flex items-center gap-2", compact ? "min-h-[20px]" : "min-h-[28px]")}>
                            {renderField()}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 pb-2">
                        <Actions isSection={false} />
                    </div>

                    <div className="absolute bottom-0 left-0 right-10 h-[1px] bg-m3-outline/50 group-focus-within:h-[2px] group-focus-within:bg-m3-primary transition-all mx-4" />
                </div>
            )}
        </DragWrapper>
    );
};
