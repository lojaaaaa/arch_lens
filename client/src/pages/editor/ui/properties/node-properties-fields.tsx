import type { ArchitectureNode } from '@/shared/model/types';
import { Separator } from '@/shared/ui/separator';

import {
    ComplexitySlider,
    CriticalityControl,
    FieldWithTooltip,
    HitRateSlider,
    Input,
    ReadWriteRatioSlider,
    ReliabilitySelect,
    RequestRateSelect,
    Select,
    Toggle,
} from './node-properties-controls';
import { NODE_LABELS } from '../../lib/config';

type NodePropertiesFieldsProps = {
    node: ArchitectureNode;
    onChange: (nodeId: string, next: Partial<ArchitectureNode>) => void;
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
                tooltip="Оценка вычислительной и архитектурной сложности узла. Влияет на расчёт нагрузки рендеринга и общий score."
            >
                <ComplexitySlider
                    value={node.complexity}
                    onChange={(complexity) => onChange(node.id, { complexity })}
                />
            </FieldWithTooltip>

            <FieldWithTooltip
                label="Критичность"
                tooltip="Насколько отказ узла повлияет на систему. Ключевые узлы с высокой входящей связностью отмечаются как единая точка отказа."
            >
                <CriticalityControl
                    value={node.criticality}
                    onChange={(criticality) =>
                        onChange(node.id, { criticality })
                    }
                />
            </FieldWithTooltip>

            <Separator />

            {node.kind === 'ui_page' && (
                <>
                    <FieldWithTooltip
                        label="Маршрут"
                        tooltip="URL-путь страницы в приложении (например, /dashboard)."
                    >
                        <Input
                            value={node.route}
                            onChange={(event) =>
                                onChange(node.id, {
                                    route: event.target.value,
                                })
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
                            onChange={(stateUsage) =>
                                onChange(node.id, { stateUsage })
                            }
                            options={
                                [
                                    {
                                        value: 'none',
                                        label: 'Нет',
                                    },
                                    {
                                        value: 'local',
                                        label: 'Локальное',
                                    },
                                    {
                                        value: 'global',
                                        label: 'Глобальное',
                                    },
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
            )}

            {node.kind === 'ui_component' && (
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
                                    {
                                        value: 'input',
                                        label: 'Поле ввода',
                                    },
                                    {
                                        value: 'table',
                                        label: 'Таблица',
                                    },
                                    {
                                        value: 'button',
                                        label: 'Кнопка',
                                    },
                                    {
                                        value: 'custom',
                                        label: 'Кастомный',
                                    },
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
                                    nestedComponents: Number(
                                        event.target.value,
                                    ),
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
                            onChange={(stateType) =>
                                onChange(node.id, { stateType })
                            }
                            options={
                                [
                                    {
                                        value: 'none',
                                        label: 'Нет',
                                    },
                                    {
                                        value: 'local',
                                        label: 'Локальное',
                                    },
                                    {
                                        value: 'context',
                                        label: 'Context',
                                    },
                                    {
                                        value: 'global',
                                        label: 'Глобальное',
                                    },
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
            )}

            {node.kind === 'state_store' && (
                <>
                    <FieldWithTooltip
                        label="Тип хранилища"
                        tooltip="Технология управления состоянием: Redux, Zustand, Context, localStorage или sessionStorage."
                    >
                        <Select
                            value={node.storeType}
                            onChange={(storeType) =>
                                onChange(node.id, { storeType })
                            }
                            options={
                                [
                                    {
                                        value: 'redux',
                                        label: 'Redux',
                                    },
                                    {
                                        value: 'zustand',
                                        label: 'Zustand',
                                    },
                                    {
                                        value: 'context',
                                        label: 'Context API',
                                    },
                                    {
                                        value: 'local_storage',
                                        label: 'localStorage',
                                    },
                                    {
                                        value: 'session_storage',
                                        label: 'sessionStorage',
                                    },
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
                                    subscribersCount: Number(
                                        event.target.value,
                                    ),
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
            )}

            {node.kind === 'api_gateway' && (
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
                            onChange={(requestRate) =>
                                onChange(node.id, { requestRate })
                            }
                        />
                    </FieldWithTooltip>
                    <FieldWithTooltip
                        label="Требуется авторизация"
                        tooltip="Нужна ли аутентификация для доступа к API."
                    >
                        <Toggle
                            value={node.authRequired}
                            onChange={(authRequired) =>
                                onChange(node.id, { authRequired })
                            }
                        />
                    </FieldWithTooltip>
                </>
            )}

            {node.kind === 'service' && (
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
                            onChange={(stateful) =>
                                onChange(node.id, { stateful })
                            }
                        />
                    </FieldWithTooltip>
                </>
            )}

            {node.kind === 'database' && (
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
                                    {
                                        value: 'SQL',
                                        label: 'SQL (реляционная)',
                                    },
                                    {
                                        value: 'NoSQL',
                                        label: 'NoSQL (документная)',
                                    },
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
            )}

            {node.kind === 'cache' && (
                <>
                    <FieldWithTooltip
                        label="Тип кэша"
                        tooltip="Технология кэширования: Redis (распределённый) или in-memory (локальный)."
                    >
                        <Select
                            value={node.cacheType}
                            onChange={(cacheType) =>
                                onChange(node.id, { cacheType })
                            }
                            options={
                                [
                                    {
                                        value: 'redis',
                                        label: 'Redis',
                                    },
                                    {
                                        value: 'memory',
                                        label: 'In-memory',
                                    },
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
                            onChange={(hitRate) =>
                                onChange(node.id, { hitRate })
                            }
                        />
                    </FieldWithTooltip>
                </>
            )}

            {node.kind === 'external_system' && (
                <>
                    <FieldWithTooltip
                        label="Тип системы"
                        tooltip="Назначение внешней системы: авторизация, платежи, аналитика, хранилище, уведомления или другое."
                    >
                        <Select
                            value={node.systemType}
                            onChange={(systemType) =>
                                onChange(node.id, { systemType })
                            }
                            options={
                                [
                                    {
                                        value: 'auth',
                                        label: 'Авторизация',
                                    },
                                    {
                                        value: 'payment',
                                        label: 'Платежи',
                                    },
                                    {
                                        value: 'analytics',
                                        label: 'Аналитика',
                                    },
                                    {
                                        value: 'storage',
                                        label: 'Хранилище',
                                    },
                                    {
                                        value: 'notification',
                                        label: 'Уведомления',
                                    },
                                    {
                                        value: 'other',
                                        label: 'Другое',
                                    },
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
                            onChange={(protocol) =>
                                onChange(node.id, { protocol })
                            }
                            options={
                                [
                                    {
                                        value: 'REST',
                                        label: 'REST',
                                    },
                                    {
                                        value: 'GraphQL',
                                        label: 'GraphQL',
                                    },
                                    {
                                        value: 'SOAP',
                                        label: 'SOAP',
                                    },
                                    {
                                        value: 'gRPC',
                                        label: 'gRPC',
                                    },
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
                            onChange={(reliability) =>
                                onChange(node.id, { reliability })
                            }
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
                                        inputValue === ''
                                            ? undefined
                                            : Number(inputValue),
                                });
                            }}
                        />
                    </FieldWithTooltip>
                </>
            )}
        </div>
    );
};
