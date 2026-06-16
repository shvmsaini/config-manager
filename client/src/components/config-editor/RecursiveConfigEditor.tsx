import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../../utils/cn';
import { parseJsonToDefinition, type ConfigItemDefinition } from '../../data/definitions';
import { ConfigItem } from './ConfigItem';
import { AddItemDialog } from './AddItemDialog';

interface RecursiveConfigEditorProps {
    items: ConfigItemDefinition[];
    values: any;
    onChange: (path: string[], value: any) => void;
    path?: string[];
    level?: number;
    compact?: boolean;
    allData?: { [fileName: string]: any };
    activeTab?: string;
    setActiveTab?: (tab: string) => void;
    onReorder?: (sourceKey: string, targetKey: string) => void;
}

export const RecursiveConfigEditor: React.FC<RecursiveConfigEditorProps> = ({
    items,
    values,
    onChange,
    path = [],
    level = 0,
    compact = false,
    allData,
    activeTab,
    setActiveTab,
}) => {
    const [showAddDialog, setShowAddDialog] = useState(false);

    const definitionMap = new Map((items || []).map(i => [i.key, i]));
    const isArrayInfo = Array.isArray(values);

    let keysToRender: string[] = [];
    if (values && typeof values === 'object') {
        keysToRender = Object.keys(values);
    } else {
        keysToRender = (items || []).map(i => i.key);
    }

    // ── Add handlers ───────────────────────────────────────────────

    const handleAddItem = () => {
        if (activeTab === 'config.json' || activeTab === 'theme.json') return;

        if (activeTab === 'widgets.json' && path.length === 0) {
            setShowAddDialog(true);
            return;
        }

        if (activeTab === 'navigation.json' && path.length === 1 && path[0] === 'routes' && isArrayInfo) {
            const pagesKeys = allData?.['pages.json'] ? Object.keys(allData['pages.json']) : [];
            const defaultPage = pagesKeys.length > 0 ? pagesKeys[0] : "";
            const newRoute = { name: "New Page", icon: "home", page: defaultPage };
            onChange(path, [...(values || []), newRoute]);
            return;
        }

        if (activeTab === 'pages.json' && path[path.length - 1] === 'widgets' && isArrayInfo) {
            onChange(path, [...(values || []), ""]);
            return;
        }

        setShowAddDialog(true);
    };

    const handleConfirmAdd = (keyName: string, addType: 'object' | 'array' | 'keyValue', selectedParent: string) => {
        let newValue: any;

        if (activeTab === 'widgets.json' && path.length === 0) {
            const parentWidget = values[selectedParent] || {};
            newValue = {
                ...JSON.parse(JSON.stringify(parentWidget)),
                parent: selectedParent,
                type: "widget"
            };
        } else if (activeTab === 'pages.json' && path.length === 0) {
            newValue = { widgets: [] };
        } else {
            switch (addType) {
                case 'object':
                    newValue = path.length === 0 ? { type: "" } : {};
                    break;
                case 'array':
                    newValue = [];
                    break;
                case 'keyValue':
                default:
                    newValue = "";
            }
        }

        if (isArrayInfo) {
            onChange(path, [...(values || []), newValue]);
        } else {
            if (!keyName.trim()) return;
            if (values && Object.prototype.hasOwnProperty.call(values, keyName)) {
                alert("Key already exists.");
                return;
            }
            onChange(path, { ...(values || {}), [keyName]: newValue });
        }

        setShowAddDialog(false);
    };

    // ── CRUD handlers ──────────────────────────────────────────────

    const handleRenameKey = (oldKey: string, newKey: string) => {
        if (!newKey || oldKey === newKey || isArrayInfo) return;
        if (values && values.hasOwnProperty(newKey)) {
            alert("A key with this name already exists.");
            return;
        }
        const newData: any = {};
        Object.keys(values).forEach(key => {
            newData[key === oldKey ? newKey : key] = values[key];
        });
        onChange(path, newData);
    };

    const handleMoveKey = (key: string, direction: 'up' | 'down') => {
        if (!values) return;
        const keys = Object.keys(values);
        const index = keys.indexOf(key);
        if (index === -1) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === keys.length - 1) return;
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (isArrayInfo) {
            const newArr = [...values];
            [newArr[index], newArr[newIndex]] = [newArr[newIndex], newArr[index]];
            onChange(path, newArr);
        } else {
            const newKeys = [...keys];
            [newKeys[index], newKeys[newIndex]] = [newKeys[newIndex], newKeys[index]];
            const newData: any = {};
            newKeys.forEach(k => { newData[k] = values[k]; });
            onChange(path, newData);
        }
    };

    const handleReorder = (sourceKey: string, targetKey: string) => {
        if (!values || sourceKey === targetKey) return;
        const keys = Object.keys(values);
        const sourceIndex = keys.indexOf(sourceKey);
        const targetIndex = keys.indexOf(targetKey);
        if (sourceIndex === -1 || targetIndex === -1) return;

        if (isArrayInfo) {
            const newArr = [...values];
            const [removed] = newArr.splice(sourceIndex, 1);
            newArr.splice(targetIndex, 0, removed);
            onChange(path, newArr);
        } else {
            const newKeys = [...keys];
            const [removed] = newKeys.splice(sourceIndex, 1);
            newKeys.splice(targetIndex, 0, removed);
            const newData: any = {};
            newKeys.forEach(k => { newData[k] = (values as any)[k]; });
            onChange(path, newData);
        }
    };

    const handleRemoveItem = (key: string) => {
        if (isArrayInfo) {
            const newArr = [...values];
            newArr.splice(Number(key), 1);
            onChange(path, newArr);
        } else {
            const newObj = { ...values };
            delete newObj[key];
            onChange(path, newObj);
        }
    };

    const handleDuplicateItem = (key: string) => {
        const deepClone = (v: any) => {
            const sc = (globalThis as any).structuredClone;
            if (typeof sc === 'function') return sc(v);
            return JSON.parse(JSON.stringify(v));
        };

        if (isArrayInfo) {
            if (!values) return;
            const idx = Number(key);
            if (!Number.isFinite(idx)) return;
            const newArr = [...values];
            newArr.splice(idx + 1, 0, deepClone(values[idx]));
            onChange(path, newArr);
            return;
        }

        const obj = values || {};
        const existingKeys = Object.keys(obj);
        if (!existingKeys.includes(key)) return;

        const makeUniqueKey = (base: string) => {
            if (!Object.prototype.hasOwnProperty.call(obj, base)) return base;
            for (let i = 2; i < 10000; i++) {
                const candidate = `${base}${i}`;
                if (!Object.prototype.hasOwnProperty.call(obj, candidate)) return candidate;
            }
            return `${base}_${Date.now()}`;
        };

        const copyKey = makeUniqueKey(`${key}_copy`);
        const newData: any = {};
        existingKeys.forEach(k => {
            newData[k] = obj[k];
            if (k === key) {
                const cloned = deepClone(obj[key]);
                if (cloned.type && cloned.type === key) {
                    delete cloned.type;
                    const newCloned: any = { parent: key, ...cloned };
                    newData[copyKey] = newCloned;
                } else {
                    newData[copyKey] = cloned;
                }
            }
        });
        onChange(path, newData);
    };

    // ── Show "Add" button logic ────────────────────────────────────
    const showAddButton =
        values && typeof values === 'object' && (
            (activeTab === 'pages.json' && (path.length === 0 || path[path.length - 1] === 'widgets')) ||
            (activeTab === 'navigation.json' && path.length === 1 && path[0] === 'routes')
        );

    return (
        <div className={cn("flex flex-col", compact ? "gap-2" : "gap-4", level === 0 && !compact ? "pb-24" : "")} id={path.join('-')}>
            {showAddButton && (
                <div className="flex justify-end mb-2">
                    <button
                        onClick={handleAddItem}
                        className={cn(
                            "flex items-center gap-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all border-[3px]",
                            compact
                                ? "px-3 py-1 bg-m3-surface border-m3-outline text-m3-on-surface hover:border-m3-primary hover:text-m3-primary"
                                : "px-4 py-2 bg-m3-primary/10 border-m3-primary text-m3-primary hover:bg-m3-primary hover:text-white shadow-m3-1 hover:shadow-m3-2 active:translate-y-0"
                        )}
                    >
                        <Plus className={cn(compact ? "w-3 h-3" : "w-4 h-4")} />
                        {activeTab === 'pages.json' && path.length === 0 ? 'Add New Page' :
                            activeTab === 'pages.json' && path[path.length - 1] === 'widgets' ? 'Add Widget' :
                                activeTab === 'navigation.json' && path[0] === 'routes' ? 'Add Route' : 'Add Item'}
                    </button>
                </div>
            )}

            {keysToRender.map((key, index) => {
                const currentPath = [...path, key];
                const currentValue = values ? values[key] : undefined;

                let itemDef = definitionMap.get(key);
                if (!itemDef) {
                    itemDef = parseJsonToDefinition(currentValue, key, activeTab);
                } else {
                    itemDef = { ...itemDef, label: key };
                }

                if (isArrayInfo && !itemDef.children && items && items.length > 0 && items[0].children) {
                    itemDef = { ...itemDef, children: items[0].children };
                }

                return (
                    <ConfigItem
                        key={key + '-' + index}
                        item={itemDef}
                        value={currentValue}
                        onChange={onChange}
                        path={currentPath}
                        level={level}
                        parentType={isArrayInfo ? 'array' : 'section'}
                        compact={compact}
                        allData={allData}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        onRenameKey={handleRenameKey}
                        onMoveKey={handleMoveKey}
                        onReorder={handleReorder}
                        onRemove={() => handleRemoveItem(key)}
                        onDuplicate={() => handleDuplicateItem(key)}
                        RecursiveEditor={RecursiveConfigEditor}
                    />
                );
            })}

            <AddItemDialog
                isOpen={showAddDialog}
                onClose={() => setShowAddDialog(false)}
                onConfirm={handleConfirmAdd}
                activeTab={activeTab}
                path={path}
                isArray={isArrayInfo}
                values={values}
            />
        </div>
    );
};
