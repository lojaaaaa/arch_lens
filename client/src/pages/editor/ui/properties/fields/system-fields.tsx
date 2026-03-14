import type { SystemNode } from '@/shared/model/types';

import {
    FieldWithTooltip,
    Input,
    OptionalAvailabilitySelect,
    OptionalCapacityRpsSelect,
    OptionalLatencySelect,
} from '../node-properties-controls';

type Props = {
    node: SystemNode;
    onChange: (nodeId: string, next: Partial<SystemNode>) => void;
};

const DEPLOYMENT_OPTIONS = [
    { value: 'monolith', label: 'Монолит' },
    { value: 'microservices', label: 'Микросервисы' },
    { value: 'hybrid', label: 'Гибрид' },
] as const;

export const SystemFields = ({ node, onChange }: Props) => (
    <>
        <FieldWithTooltip
            label="Страниц"
            tooltip="Количество ui_page в системе."
        >
            <Input
                type="number"
                value={node.pagesCount}
                onChange={(event) =>
                    onChange(node.id, {
                        pagesCount: Number(event.target.value),
                    })
                }
            />
        </FieldWithTooltip>
        <FieldWithTooltip label="Описание" tooltip="Краткое описание системы.">
            <Input
                value={node.description ?? ''}
                onChange={(event) =>
                    onChange(node.id, {
                        description: event.target.value.trim() || undefined,
                    })
                }
                placeholder="Опционально"
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="Целевая доступность"
            tooltip="99.9% = 0.999. Сравнение с расчётной availability."
        >
            <OptionalAvailabilitySelect
                value={node.targetAvailability}
                onChange={(targetAvailability) =>
                    onChange(node.id, { targetAvailability })
                }
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="Пик нагрузки (rps)"
            tooltip="Ожидаемый пик запросов в секунду. Bottleneck если превышено."
        >
            <OptionalCapacityRpsSelect
                value={node.targetThroughputRps}
                onChange={(targetThroughputRps) =>
                    onChange(node.id, { targetThroughputRps })
                }
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="SLO latency (мс)"
            tooltip="Целевая задержка. Warning если Critical Path > SLO."
        >
            <OptionalLatencySelect
                value={node.latencySloMs}
                onChange={(latencySloMs) => onChange(node.id, { latencySloMs })}
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="Модель развёртывания"
            tooltip="Проверка согласованности с архитектурой."
        >
            <select
                value={node.deploymentModel ?? ''}
                onChange={(e) => {
                    const v = e.target.value;
                    onChange(node.id, {
                        deploymentModel:
                            v === 'monolith' ||
                            v === 'microservices' ||
                            v === 'hybrid'
                                ? v
                                : undefined,
                    });
                }}
                className="border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
                <option value="">Не задано</option>
                {DEPLOYMENT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        </FieldWithTooltip>
    </>
);
