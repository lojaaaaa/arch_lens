import type { ServiceNode } from '@/shared/model/types';

import {
    FieldWithTooltip,
    Input,
    OptionalCapacityRpsSelect,
    OptionalLatencySelect,
    Toggle,
} from '../node-properties-controls';

type Props = {
    node: ServiceNode;
    onChange: (nodeId: string, next: Partial<ServiceNode>) => void;
};

export const ServiceFields = ({ node, onChange }: Props) => (
    <>
        <FieldWithTooltip
            label="Кол-во операций"
            tooltip="Количество бизнес-операций в сервисе. Более 10 — признак god-сервиса."
        >
            <Input
                type="number"
                value={node.operationsCount}
                onChange={(event) =>
                    onChange(node.id, {
                        operationsCount: Number(event.target.value),
                    })
                }
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="Внешние вызовы"
            tooltip="Количество вызовов к внешним системам. Увеличивает зависимость от сторонних сервисов."
        >
            <Input
                type="number"
                value={node.externalCalls}
                onChange={(event) =>
                    onChange(node.id, {
                        externalCalls: Number(event.target.value),
                    })
                }
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="С состоянием (stateful)"
            tooltip="Хранит ли сервис состояние между запросами. Stateful-сервисы сложнее масштабировать."
        >
            <Toggle
                value={node.stateful}
                onChange={(stateful) => onChange(node.id, { stateful })}
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="Задержка (мс)"
            tooltip="Опционально. Critical Path учитывает. По умолчанию 50 ms."
        >
            <OptionalLatencySelect
                value={node.latencyMs}
                onChange={(latencyMs) => onChange(node.id, { latencyMs })}
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="Пропускная способность (rps)"
            tooltip="Опционально. Сравнение с load при bottleneck."
        >
            <OptionalCapacityRpsSelect
                value={node.capacityRps}
                onChange={(capacityRps) => onChange(node.id, { capacityRps })}
            />
        </FieldWithTooltip>
    </>
);
