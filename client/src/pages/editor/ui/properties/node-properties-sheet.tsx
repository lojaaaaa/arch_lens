import { type ReactNode, useMemo } from 'react';

import type { ArchitectureNode, TypeOrNull } from '@/shared/model/types';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Separator } from '@/shared/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/shared/ui/sheet';

import {
    useArchitectureActions,
    useArchitectureSelectors,
} from '../../model/selectors';

const Field = ({ label, children }: { label: string; children: ReactNode }) => {
    return (
        <div className="space-y-1.5">
            <div className="text-sm font-medium">{label}</div>
            {children}
        </div>
    );
};

type SelectOption<T extends string> = { value: T; label: string };

const Select = <T extends string>({
    value,
    onChange,
    options,
}: {
    value: T;
    onChange: (value: T) => void;
    options: readonly SelectOption<T>[];
}) => {
    return (
        <select
            value={value}
            onChange={(event) => onChange(event.target.value as T)}
            className="border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

const Toggle = ({
    value,
    onChange,
}: {
    value: boolean;
    onChange: (value: boolean) => void;
}) => {
    return (
        <div className="flex gap-2">
            <Button
                type="button"
                variant={value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange(true)}
            >
                Да
            </Button>
            <Button
                type="button"
                variant={!value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange(false)}
            >
                Нет
            </Button>
        </div>
    );
};

const getArchNodeFromFlowNodeData = (
    data: unknown,
): TypeOrNull<ArchitectureNode> => {
    const maybe = data as TypeOrNull<{ node?: ArchitectureNode }>;
    return maybe?.node ?? null;
};

export const NodePropertiesSheet = () => {
    const { nodes: flowNodes, selectedNodeId } = useArchitectureSelectors();

    const { selectNode, removeNode, updateNode } = useArchitectureActions();

    const selectedFlowNode = useMemo(() => {
        if (!selectedNodeId) {
            return null;
        }
        return (
            flowNodes.find((flowNode) => flowNode.id === selectedNodeId) ?? null
        );
    }, [flowNodes, selectedNodeId]);

    const selectedArchitectureNode = useMemo(() => {
        if (!selectedFlowNode) {
            return null;
        }
        return getArchNodeFromFlowNodeData(selectedFlowNode.data);
    }, [selectedFlowNode]);

    const isSheetOpen = Boolean(selectedNodeId && selectedArchitectureNode);

    return (
        <Sheet
            open={isSheetOpen}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    selectNode(null);
                }
            }}
        >
            <SheetContent side="right">
                <SheetHeader>
                    <SheetTitle>Параметры узла</SheetTitle>
                    <SheetDescription>
                        Тип:{' '}
                        <span className="font-medium">
                            {selectedArchitectureNode?.kind}
                        </span>
                    </SheetDescription>
                </SheetHeader>

                {!selectedArchitectureNode ? (
                    <div className="p-4 text-sm text-muted-foreground">
                        Выберите узел на схеме, чтобы редактировать параметры.
                    </div>
                ) : (
                    (() => {
                        const archNode = selectedArchitectureNode;

                        return (
                            <div className="flex flex-col gap-4 p-4">
                                <Field label="Complexity">
                                    <Input
                                        type="number"
                                        value={
                                            selectedArchitectureNode.complexity
                                        }
                                        onChange={(event) =>
                                            updateNode(
                                                selectedArchitectureNode.id,
                                                {
                                                    complexity: Number(
                                                        event.target.value,
                                                    ),
                                                },
                                            )
                                        }
                                    />
                                </Field>

                                <Field label="Criticality">
                                    <Input
                                        type="number"
                                        value={
                                            selectedArchitectureNode.criticality
                                        }
                                        onChange={(event) =>
                                            updateNode(
                                                selectedArchitectureNode.id,
                                                {
                                                    criticality: Number(
                                                        event.target.value,
                                                    ),
                                                },
                                            )
                                        }
                                    />
                                </Field>

                                <Separator />

                                {archNode.kind === 'ui_page' && (
                                    <>
                                        <Field label="Route">
                                            <Input
                                                value={archNode.route}
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        route: event.target
                                                            .value,
                                                    })
                                                }
                                            />
                                        </Field>
                                        <Field label="Components count">
                                            <Input
                                                type="number"
                                                value={archNode.componentsCount}
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        componentsCount: Number(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </Field>
                                        <Field label="State usage">
                                            <Select
                                                value={archNode.stateUsage}
                                                onChange={(value) =>
                                                    updateNode(archNode.id, {
                                                        stateUsage: value,
                                                    })
                                                }
                                                options={
                                                    [
                                                        {
                                                            value: 'none',
                                                            label: 'none',
                                                        },
                                                        {
                                                            value: 'local',
                                                            label: 'local',
                                                        },
                                                        {
                                                            value: 'global',
                                                            label: 'global',
                                                        },
                                                    ] as const
                                                }
                                            />
                                        </Field>
                                        <Field label="Update frequency">
                                            <Input
                                                type="number"
                                                value={archNode.updateFrequency}
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        updateFrequency: Number(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </Field>
                                    </>
                                )}

                                {archNode.kind === 'ui_component' && (
                                    <>
                                        <Field label="Component type">
                                            <Select
                                                value={archNode.componentType}
                                                onChange={(value) =>
                                                    updateNode(archNode.id, {
                                                        componentType: value,
                                                    })
                                                }
                                                options={
                                                    [
                                                        {
                                                            value: 'input',
                                                            label: 'input',
                                                        },
                                                        {
                                                            value: 'table',
                                                            label: 'table',
                                                        },
                                                        {
                                                            value: 'button',
                                                            label: 'button',
                                                        },
                                                        {
                                                            value: 'custom',
                                                            label: 'custom',
                                                        },
                                                    ] as const
                                                }
                                            />
                                        </Field>
                                        <Field label="Nested components">
                                            <Input
                                                type="number"
                                                value={
                                                    archNode.nestedComponents
                                                }
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        nestedComponents:
                                                            Number(
                                                                event.target
                                                                    .value,
                                                            ),
                                                    })
                                                }
                                            />
                                        </Field>
                                        <Field label="Props count">
                                            <Input
                                                type="number"
                                                value={archNode.propsCount}
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        propsCount: Number(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </Field>
                                        <Field label="State type">
                                            <Select
                                                value={archNode.stateType}
                                                onChange={(value) =>
                                                    updateNode(archNode.id, {
                                                        stateType: value,
                                                    })
                                                }
                                                options={
                                                    [
                                                        {
                                                            value: 'none',
                                                            label: 'none',
                                                        },
                                                        {
                                                            value: 'local',
                                                            label: 'local',
                                                        },
                                                        {
                                                            value: 'context',
                                                            label: 'context',
                                                        },
                                                        {
                                                            value: 'global',
                                                            label: 'global',
                                                        },
                                                    ] as const
                                                }
                                            />
                                        </Field>
                                        <Field label="Render frequency">
                                            <Input
                                                type="number"
                                                value={archNode.renderFrequency}
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        renderFrequency: Number(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </Field>
                                    </>
                                )}

                                {archNode.kind === 'state_store' && (
                                    <>
                                        <Field label="Store type">
                                            <Select
                                                value={archNode.storeType}
                                                onChange={(value) =>
                                                    updateNode(archNode.id, {
                                                        storeType: value,
                                                    })
                                                }
                                                options={
                                                    [
                                                        {
                                                            value: 'redux',
                                                            label: 'redux',
                                                        },
                                                        {
                                                            value: 'zustand',
                                                            label: 'zustand',
                                                        },
                                                        {
                                                            value: 'context',
                                                            label: 'context',
                                                        },
                                                        {
                                                            value: 'local_storage',
                                                            label: 'local_storage',
                                                        },
                                                        {
                                                            value: 'session_storage',
                                                            label: 'session_storage',
                                                        },
                                                    ] as const
                                                }
                                            />
                                        </Field>
                                        <Field label="Subscribers count">
                                            <Input
                                                type="number"
                                                value={
                                                    archNode.subscribersCount
                                                }
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        subscribersCount:
                                                            Number(
                                                                event.target
                                                                    .value,
                                                            ),
                                                    })
                                                }
                                            />
                                        </Field>
                                        <Field label="Update frequency">
                                            <Input
                                                type="number"
                                                value={archNode.updateFrequency}
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        updateFrequency: Number(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </Field>
                                    </>
                                )}

                                {archNode.kind === 'api_gateway' && (
                                    <>
                                        <Field label="Endpoints count">
                                            <Input
                                                type="number"
                                                value={archNode.endpointsCount}
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        endpointsCount: Number(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </Field>
                                        <Field label="Request rate">
                                            <Input
                                                type="number"
                                                value={archNode.requestRate}
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        requestRate: Number(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </Field>
                                        <Field label="Auth required">
                                            <Toggle
                                                value={archNode.authRequired}
                                                onChange={(value) =>
                                                    updateNode(archNode.id, {
                                                        authRequired: value,
                                                    })
                                                }
                                            />
                                        </Field>
                                    </>
                                )}

                                {archNode.kind === 'service' && (
                                    <>
                                        <Field label="Operations count">
                                            <Input
                                                type="number"
                                                value={archNode.operationsCount}
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        operationsCount: Number(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </Field>
                                        <Field label="External calls">
                                            <Input
                                                type="number"
                                                value={archNode.externalCalls}
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        externalCalls: Number(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </Field>
                                        <Field label="Stateful">
                                            <Toggle
                                                value={archNode.stateful}
                                                onChange={(value) =>
                                                    updateNode(archNode.id, {
                                                        stateful: value,
                                                    })
                                                }
                                            />
                                        </Field>
                                    </>
                                )}

                                {archNode.kind === 'database' && (
                                    <>
                                        <Field label="DB type">
                                            <Select
                                                value={archNode.dbType}
                                                onChange={(value) =>
                                                    updateNode(archNode.id, {
                                                        dbType: value,
                                                    })
                                                }
                                                options={
                                                    [
                                                        {
                                                            value: 'SQL',
                                                            label: 'SQL',
                                                        },
                                                        {
                                                            value: 'NoSQL',
                                                            label: 'NoSQL',
                                                        },
                                                    ] as const
                                                }
                                            />
                                        </Field>
                                        <Field label="Tables count">
                                            <Input
                                                type="number"
                                                value={archNode.tablesCount}
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        tablesCount: Number(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </Field>
                                        <Field label="Read/write ratio">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={archNode.readWriteRatio}
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        readWriteRatio: Number(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </Field>
                                    </>
                                )}

                                {archNode.kind === 'cache' && (
                                    <>
                                        <Field label="Cache type">
                                            <Select
                                                value={archNode.cacheType}
                                                onChange={(value) =>
                                                    updateNode(archNode.id, {
                                                        cacheType: value,
                                                    })
                                                }
                                                options={
                                                    [
                                                        {
                                                            value: 'redis',
                                                            label: 'redis',
                                                        },
                                                        {
                                                            value: 'memory',
                                                            label: 'memory',
                                                        },
                                                    ] as const
                                                }
                                            />
                                        </Field>
                                        <Field label="Hit rate">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={archNode.hitRate}
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        hitRate: Number(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </Field>
                                    </>
                                )}

                                {archNode.kind === 'external_system' && (
                                    <>
                                        <Field label="System type">
                                            <Select
                                                value={archNode.systemType}
                                                onChange={(value) =>
                                                    updateNode(archNode.id, {
                                                        systemType: value,
                                                    })
                                                }
                                                options={
                                                    [
                                                        {
                                                            value: 'auth',
                                                            label: 'auth',
                                                        },
                                                        {
                                                            value: 'payment',
                                                            label: 'payment',
                                                        },
                                                        {
                                                            value: 'analytics',
                                                            label: 'analytics',
                                                        },
                                                        {
                                                            value: 'storage',
                                                            label: 'storage',
                                                        },
                                                        {
                                                            value: 'notification',
                                                            label: 'notification',
                                                        },
                                                        {
                                                            value: 'other',
                                                            label: 'other',
                                                        },
                                                    ] as const
                                                }
                                            />
                                        </Field>
                                        <Field label="Protocol">
                                            <Select
                                                value={archNode.protocol}
                                                onChange={(value) =>
                                                    updateNode(archNode.id, {
                                                        protocol: value,
                                                    })
                                                }
                                                options={
                                                    [
                                                        {
                                                            value: 'REST',
                                                            label: 'REST',
                                                        },
                                                        {
                                                            value: 'GraphQL',
                                                            label: 'GraphQL',
                                                        },
                                                        {
                                                            value: 'SOAP',
                                                            label: 'SOAP',
                                                        },
                                                        {
                                                            value: 'gRPC',
                                                            label: 'gRPC',
                                                        },
                                                    ] as const
                                                }
                                            />
                                        </Field>
                                        <Field label="Reliability (0..1)">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={archNode.reliability}
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        reliability: Number(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </Field>
                                        <Field label="Latency (ms)">
                                            <Input
                                                type="number"
                                                value={archNode.latencyMs}
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        latencyMs: Number(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </Field>
                                        <Field label="Rate limit (optional)">
                                            <Input
                                                type="number"
                                                value={archNode.rateLimit ?? ''}
                                                onChange={(event) => {
                                                    const inputValue =
                                                        event.target.value;
                                                    updateNode(archNode.id, {
                                                        rateLimit:
                                                            inputValue === ''
                                                                ? undefined
                                                                : Number(
                                                                      inputValue,
                                                                  ),
                                                    });
                                                }}
                                            />
                                        </Field>
                                    </>
                                )}
                            </div>
                        );
                    })()
                )}

                <SheetFooter>
                    <Button
                        type="button"
                        disabled={!selectedArchitectureNode}
                        onClick={() => {
                            if (!selectedArchitectureNode) {
                                return;
                            }
                            removeNode(selectedArchitectureNode.id);
                            selectNode(null);
                        }}
                    >
                        Удалить узел
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};
