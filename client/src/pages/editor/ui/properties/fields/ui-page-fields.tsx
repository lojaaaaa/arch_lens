import type { UIPageNode } from '@/shared/model/types';

import { FieldWithTooltip, Input, Select } from '../node-properties-controls';

type Props = {
    node: UIPageNode;
    onChange: (nodeId: string, next: Partial<UIPageNode>) => void;
};

export const UiPageFields = ({ node, onChange }: Props) => (
    <>
        <FieldWithTooltip
            label="Маршрут"
            tooltip="URL-путь страницы в приложении (например, /dashboard)."
        >
            <Input
                value={node.route}
                onChange={(event) =>
                    onChange(node.id, { route: event.target.value })
                }
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="Кол-во компонентов"
            tooltip="Сколько дочерних UI-компонентов отображает страница. Влияет на оценку render pressure."
        >
            <Input
                type="number"
                value={node.componentsCount}
                onChange={(event) =>
                    onChange(node.id, {
                        componentsCount: Number(event.target.value),
                    })
                }
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="Использование состояния"
            tooltip="Тип управления состоянием: нет, локальное или глобальное. Влияет на анализ связности."
        >
            <Select
                value={node.stateUsage}
                onChange={(stateUsage) => onChange(node.id, { stateUsage })}
                options={
                    [
                        { value: 'none', label: 'Нет' },
                        { value: 'local', label: 'Локальное' },
                        { value: 'global', label: 'Глобальное' },
                    ] as const
                }
            />
        </FieldWithTooltip>
        <FieldWithTooltip
            label="Частота обновления"
            tooltip="Как часто данные на странице обновляются (условные единицы). Влияет на render pressure."
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
