import type { DatabaseNode } from '@/shared/model/types';

import {
    FieldWithTooltip,
    Input,
    ReadWriteRatioSlider,
    Select,
} from '../node-properties-controls';

type Props = {
    node: DatabaseNode;
    onChange: (nodeId: string, next: Partial<DatabaseNode>) => void;
};

export const DatabaseFields = ({ node, onChange }: Props) => (
    <>
        <FieldWithTooltip
            label="Тип БД"
            tooltip="Реляционная (SQL) или документная (NoSQL) база данных."
        >
            <Select
                value={node.dbType}
                onChange={(dbType) => onChange(node.id, { dbType })}
                options={
                    [
                        { value: 'SQL', label: 'SQL (реляционная)' },
                        { value: 'NoSQL', label: 'NoSQL (документная)' },
                    ] as const
                }
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="Кол-во таблиц / коллекций"
            tooltip="Количество таблиц (SQL) или коллекций (NoSQL) в базе."
        >
            <Input
                type="number"
                value={node.tablesCount}
                onChange={(event) =>
                    onChange(node.id, {
                        tablesCount: Number(event.target.value),
                    })
                }
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="Соотношение чтение/запись"
            tooltip="Доля операций чтения. Например, 80% чтения — типично для каталогов, 20% — для логирования."
        >
            <ReadWriteRatioSlider
                value={node.readWriteRatio}
                onChange={(readWriteRatio) =>
                    onChange(node.id, { readWriteRatio })
                }
            />
        </FieldWithTooltip>
    </>
);
