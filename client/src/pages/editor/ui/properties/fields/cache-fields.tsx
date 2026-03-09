import type { CacheNode } from '@/shared/model/types';

import {
    FieldWithTooltip,
    HitRateSlider,
    Select,
} from '../node-properties-controls';

type Props = {
    node: CacheNode;
    onChange: (nodeId: string, next: Partial<CacheNode>) => void;
};

export const CacheFields = ({ node, onChange }: Props) => (
    <>
        <FieldWithTooltip
            label="Тип кэша"
            tooltip="Технология кэширования: Redis (распределённый) или in-memory (локальный)."
        >
            <Select
                value={node.cacheType}
                onChange={(cacheType) => onChange(node.id, { cacheType })}
                options={
                    [
                        { value: 'redis', label: 'Redis' },
                        { value: 'memory', label: 'In-memory' },
                    ] as const
                }
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="Hit Rate"
            tooltip="Процент запросов, обслуженных из кэша. <50% — плохо (красный), 50-80% — средне (жёлтый), >80% — хорошо (зелёный)."
        >
            <HitRateSlider
                value={node.hitRate}
                onChange={(hitRate) => onChange(node.id, { hitRate })}
            />
        </FieldWithTooltip>
    </>
);
