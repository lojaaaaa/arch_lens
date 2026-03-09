import type { ExternalSystemNode } from '@/shared/model/types';

import {
    FieldWithTooltip,
    Input,
    ReliabilitySelect,
    Select,
} from '../node-properties-controls';

type Props = {
    node: ExternalSystemNode;
    onChange: (nodeId: string, next: Partial<ExternalSystemNode>) => void;
};

export const ExternalSystemFields = ({ node, onChange }: Props) => (
    <>
        <FieldWithTooltip
            label="Тип системы"
            tooltip="Назначение внешней системы: авторизация, платежи, аналитика, хранилище, уведомления или другое."
        >
            <Select
                value={node.systemType}
                onChange={(systemType) => onChange(node.id, { systemType })}
                options={
                    [
                        { value: 'auth', label: 'Авторизация' },
                        { value: 'payment', label: 'Платежи' },
                        { value: 'analytics', label: 'Аналитика' },
                        { value: 'storage', label: 'Хранилище' },
                        { value: 'notification', label: 'Уведомления' },
                        { value: 'other', label: 'Другое' },
                    ] as const
                }
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="Протокол"
            tooltip="Протокол взаимодействия с внешней системой."
        >
            <Select
                value={node.protocol}
                onChange={(protocol) => onChange(node.id, { protocol })}
                options={
                    [
                        { value: 'REST', label: 'REST' },
                        { value: 'GraphQL', label: 'GraphQL' },
                        { value: 'SOAP', label: 'SOAP' },
                        { value: 'gRPC', label: 'gRPC' },
                    ] as const
                }
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="Надёжность (SLA)"
            tooltip="Уровень доступности внешней системы. Низкая надёжность на критическом пути генерирует предупреждение."
        >
            <ReliabilitySelect
                value={node.reliability}
                onChange={(reliability) => onChange(node.id, { reliability })}
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="Задержка (мс)"
            tooltip="Среднее время ответа внешней системы в миллисекундах. Влияет на оценку latency синхронных цепочек."
        >
            <Input
                type="number"
                value={node.latencyMs}
                onChange={(event) =>
                    onChange(node.id, {
                        latencyMs: Number(event.target.value),
                    })
                }
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="Rate limit (необязательно)"
            tooltip="Ограничение количества запросов к внешней системе (req/s). Оставьте пустым, если лимита нет."
        >
            <Input
                type="number"
                value={node.rateLimit ?? ''}
                onChange={(event) => {
                    const inputValue = event.target.value;
                    onChange(node.id, {
                        rateLimit:
                            inputValue === '' ? undefined : Number(inputValue),
                    });
                }}
            />
        </FieldWithTooltip>
    </>
);
