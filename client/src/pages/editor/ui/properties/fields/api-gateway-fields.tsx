import type { APIGatewayNode } from '@/shared/model/types';

import {
    FieldWithTooltip,
    Input,
    OptionalAvailabilitySelect,
    OptionalLatencySelect,
    RequestRateSelect,
    Toggle,
} from '../node-properties-controls';

type Props = {
    node: APIGatewayNode;
    onChange: (nodeId: string, next: Partial<APIGatewayNode>) => void;
};

export const ApiGatewayFields = ({ node, onChange }: Props) => (
    <>
        <FieldWithTooltip
            label="Кол-во эндпоинтов"
            tooltip="Количество API-маршрутов. Более 15 — признак монолитного API."
        >
            <Input
                type="number"
                value={node.endpointsCount}
                onChange={(event) =>
                    onChange(node.id, {
                        endpointsCount: Number(event.target.value),
                    })
                }
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="Нагрузка (req/s)"
            tooltip="Ожидаемое количество запросов в секунду. Влияет на оценку масштабируемости и нагрузки API."
        >
            <RequestRateSelect
                value={node.requestRate}
                onChange={(requestRate) => onChange(node.id, { requestRate })}
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="Требуется авторизация"
            tooltip="Нужна ли аутентификация для доступа к API."
        >
            <Toggle
                value={node.authRequired}
                onChange={(authRequired) => onChange(node.id, { authRequired })}
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="Задержка (мс)"
            tooltip="Опционально. Типичный latency ответа. Critical Path учитывает."
        >
            <OptionalLatencySelect
                value={node.latencyMs}
                onChange={(latencyMs) => onChange(node.id, { latencyMs })}
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="Доступность"
            tooltip="Опционально. 99.9% = 0.999. Сравнение с расчётной availability."
        >
            <OptionalAvailabilitySelect
                value={node.availability}
                onChange={(availability) => onChange(node.id, { availability })}
            />
        </FieldWithTooltip>
    </>
);
