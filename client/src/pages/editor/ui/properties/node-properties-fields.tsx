import { Suspense } from 'react';

import { deriveComplexity } from '@/shared/lib/derive-complexity';
import type { ArchitectureNode } from '@/shared/model/types';
import { Separator } from '@/shared/ui/separator';

import {
    ApiGatewayFields,
    CacheFields,
    DatabaseFields,
    ExternalSystemFields,
    ServiceFields,
    StateStoreFields,
    SystemFields,
    UiComponentFields,
    UiPageFields,
} from './fields';
import {
    CriticalityControl,
    FieldWithTooltip,
    Input,
} from './node-properties-controls';
import { NODE_LABELS } from '../../lib/config';

type NodePropertiesFieldsProps = {
    node: ArchitectureNode;
    onChange: (nodeId: string, next: Partial<ArchitectureNode>) => void;
};

const KindFields = ({
    kind,
    node,
    onChange,
}: {
    kind: ArchitectureNode['kind'];
    node: ArchitectureNode;
    onChange: (nodeId: string, next: Partial<ArchitectureNode>) => void;
}) => {
    switch (kind) {
        case 'ui_page':
            return (
                <Suspense fallback={null}>
                    <UiPageFields
                        node={node as ArchitectureNode & { kind: 'ui_page' }}
                        onChange={onChange}
                    />
                </Suspense>
            );
        case 'ui_component':
            return (
                <Suspense fallback={null}>
                    <UiComponentFields
                        node={
                            node as ArchitectureNode & {
                                kind: 'ui_component';
                            }
                        }
                        onChange={onChange}
                    />
                </Suspense>
            );
        case 'state_store':
            return (
                <Suspense fallback={null}>
                    <StateStoreFields
                        node={
                            node as ArchitectureNode & {
                                kind: 'state_store';
                            }
                        }
                        onChange={onChange}
                    />
                </Suspense>
            );
        case 'api_gateway':
            return (
                <Suspense fallback={null}>
                    <ApiGatewayFields
                        node={
                            node as ArchitectureNode & {
                                kind: 'api_gateway';
                            }
                        }
                        onChange={onChange}
                    />
                </Suspense>
            );
        case 'service':
            return (
                <Suspense fallback={null}>
                    <ServiceFields
                        node={node as ArchitectureNode & { kind: 'service' }}
                        onChange={onChange}
                    />
                </Suspense>
            );
        case 'database':
            return (
                <Suspense fallback={null}>
                    <DatabaseFields
                        node={node as ArchitectureNode & { kind: 'database' }}
                        onChange={onChange}
                    />
                </Suspense>
            );
        case 'cache':
            return (
                <Suspense fallback={null}>
                    <CacheFields
                        node={node as ArchitectureNode & { kind: 'cache' }}
                        onChange={onChange}
                    />
                </Suspense>
            );
        case 'external_system':
            return (
                <Suspense fallback={null}>
                    <ExternalSystemFields
                        node={
                            node as ArchitectureNode & {
                                kind: 'external_system';
                            }
                        }
                        onChange={onChange}
                    />
                </Suspense>
            );
        case 'system':
            return (
                <Suspense fallback={null}>
                    <SystemFields
                        node={node as ArchitectureNode & { kind: 'system' }}
                        onChange={onChange}
                    />
                </Suspense>
            );
        default:
            return null;
    }
};

export const NodePropertiesFields = ({
    node,
    onChange,
}: NodePropertiesFieldsProps) => {
    return (
        <div className="flex flex-col gap-4 p-4">
            <FieldWithTooltip
                label="Название"
                tooltip="Пользовательское имя узла. Например, Auth API."
            >
                <Input
                    placeholder={NODE_LABELS[node.kind] ?? 'Название'}
                    value={node.displayName ?? ''}
                    onChange={(event) => {
                        const nextValue = event.target.value;
                        onChange(node.id, {
                            displayName:
                                nextValue.trim().length > 0
                                    ? nextValue
                                    : undefined,
                        });
                    }}
                />
            </FieldWithTooltip>
            <FieldWithTooltip
                label="Сложность"
                tooltip="Вычисляется из полей ниже (operationsCount, componentsCount, endpointsCount и т.д.). Влияет на frontend/backend complexity и score."
            >
                <div className="text-muted-foreground rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                    {deriveComplexity(node)} (авто)
                </div>
            </FieldWithTooltip>

            <FieldWithTooltip
                label="Критичность"
                tooltip="0=логи/аналитика, 1=обычный, 2=платёж/аутентификация, 3=mission-critical. Влияет на SPOF (criticality≥2 + fan-in≥3 → единая точка отказа)."
            >
                <div className="space-y-1">
                    <CriticalityControl
                        value={node.criticality}
                        onChange={(criticality) =>
                            onChange(node.id, { criticality })
                        }
                    />
                    <p className="text-muted-foreground text-[10px]">
                        {node.criticality === 0 && '0: логи, аналитика'}
                        {node.criticality === 1 && '1: обычный компонент'}
                        {node.criticality === 2 && '2: платёж, auth'}
                        {node.criticality === 3 && '3: mission-critical'}
                        {![0, 1, 2, 3].includes(node.criticality) &&
                            `Текущее: ${node.criticality}`}
                    </p>
                </div>
            </FieldWithTooltip>

            <Separator />

            <KindFields kind={node.kind} node={node} onChange={onChange} />
        </div>
    );
};
