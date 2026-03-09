import type { StateStoreNode } from '@/shared/model/types';

import { FieldWithTooltip, Input, Select } from '../node-properties-controls';

type Props = {
    node: StateStoreNode;
    onChange: (nodeId: string, next: Partial<StateStoreNode>) => void;
};

export const StateStoreFields = ({ node, onChange }: Props) => (
    <>
        <FieldWithTooltip
            label="Тип хранилища"
            tooltip="Технология управления состоянием: Redux, Zustand, Context, localStorage или sessionStorage."
        >
            <Select
                value={node.storeType}
                onChange={(storeType) => onChange(node.id, { storeType })}
                options={
                    [
                        { value: 'redux', label: 'Redux' },
                        { value: 'zustand', label: 'Zustand' },
                        { value: 'context', label: 'Context API' },
                        { value: 'local_storage', label: 'localStorage' },
                        { value: 'session_storage', label: 'sessionStorage' },
                    ] as const
                }
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="Кол-во подписчиков"
            tooltip="Сколько компонентов подписано на это хранилище. Большое число усиливает каскадный ре-рендер."
        >
            <Input
                type="number"
                value={node.subscribersCount}
                onChange={(event) =>
                    onChange(node.id, {
                        subscribersCount: Number(event.target.value),
                    })
                }
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="Частота обновления"
            tooltip="Как часто обновляется стор (условные единицы). Влияет на render pressure подписчиков."
        >
            <Input
                type="number"
                value={node.updateFrequency}
                onChange={(event) =>
                    onChange(node.id, {
                        updateFrequency: Number(event.target.value),
                    })
                }
            />
        </FieldWithTooltip>
    </>
);
