import type { UIComponentNode } from '@/shared/model/types';

import { FieldWithTooltip, Input, Select } from '../node-properties-controls';

type Props = {
    node: UIComponentNode;
    onChange: (nodeId: string, next: Partial<UIComponentNode>) => void;
};

export const UiComponentFields = ({ node, onChange }: Props) => (
    <>
        <FieldWithTooltip
            label="Тип компонента"
            tooltip="Функциональный тип: ввод, таблица, кнопка или кастомный."
        >
            <Select
                value={node.componentType}
                onChange={(componentType) =>
                    onChange(node.id, { componentType })
                }
                options={
                    [
                        { value: 'input', label: 'Поле ввода' },
                        { value: 'table', label: 'Таблица' },
                        { value: 'button', label: 'Кнопка' },
                        { value: 'custom', label: 'Кастомный' },
                    ] as const
                }
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="Вложенные компоненты"
            tooltip="Количество дочерних компонентов. Большое число может указывать на чрезмерную вложенность."
        >
            <Input
                type="number"
                value={node.nestedComponents}
                onChange={(event) =>
                    onChange(node.id, {
                        nestedComponents: Number(event.target.value),
                    })
                }
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="Количество props"
            tooltip="Количество входных свойств. Много props может говорить о необходимости декомпозиции."
        >
            <Input
                type="number"
                value={node.propsCount}
                onChange={(event) =>
                    onChange(node.id, {
                        propsCount: Number(event.target.value),
                    })
                }
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="Тип состояния"
            tooltip="Источник состояния: нет, локальное, context или глобальный стор."
        >
            <Select
                value={node.stateType}
                onChange={(stateType) => onChange(node.id, { stateType })}
                options={
                    [
                        { value: 'none', label: 'Нет' },
                        { value: 'local', label: 'Локальное' },
                        { value: 'context', label: 'Context' },
                        { value: 'global', label: 'Глобальное' },
                    ] as const
                }
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="Частота ре-рендера"
            tooltip="Как часто компонент перерисовывается (условные единицы). Влияет на render pressure."
        >
            <Input
                type="number"
                value={node.renderFrequency}
                onChange={(event) =>
                    onChange(node.id, {
                        renderFrequency: Number(event.target.value),
                    })
                }
            />
        </FieldWithTooltip>
    </>
);
