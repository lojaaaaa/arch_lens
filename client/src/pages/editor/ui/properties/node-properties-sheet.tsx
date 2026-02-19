import { type ReactNode, useMemo } from 'react';
import { Info } from 'lucide-react';

import type { ArchitectureNode, TypeOrNull } from '@/shared/model/types';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Separator } from '@/shared/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/shared/ui/sheet';
import { Slider } from '@/shared/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

import { NODE_LABELS } from '../../lib/config';
import {
    useArchitectureActions,
    useArchitectureSelectors,
} from '../../model/selectors';

const COMPLEXITY_LABELS = [
    'Минимальная',
    'Низкая',
    'Средняя',
    'Высокая',
    'Очень высокая',
] as const;

const CRITICALITY_LABELS = [
    'Некритичный',
    'Важный',
    'Критичный',
    'Ключевой',
] as const;

const FieldWithTooltip = ({
    label,
    tooltip,
    children,
}: {
    label: string;
    tooltip: string;
    children: ReactNode;
}) => {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium">{label}</span>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Info className="text-muted-foreground size-3.5 shrink-0 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-60">
                        {tooltip}
                    </TooltipContent>
                </Tooltip>
            </div>
            {children}
        </div>
    );
};

const ComplexitySlider = ({
    value,
    onChange,
}: {
    value: number;
    onChange: (newValue: number) => void;
}) => {
    const clamped = Math.max(1, Math.min(5, value));
    return (
        <div className="space-y-2">
            <Slider
                min={1}
                max={5}
                step={1}
                value={[clamped]}
                onValueChange={([nextValue]) => onChange(nextValue)}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
                {COMPLEXITY_LABELS.map((label) => (
                    <span
                        key={label}
                        className="w-0 text-center first:text-left last:text-right"
                    >
                        {label}
                    </span>
                ))}
            </div>
            <div className="text-xs text-center font-medium">
                {COMPLEXITY_LABELS[clamped - 1]} ({clamped})
            </div>
        </div>
    );
};

const CriticalityControl = ({
    value,
    onChange,
}: {
    value: number;
    onChange: (newValue: number) => void;
}) => {
    const clamped = Math.max(0, Math.min(3, value));
    return (
        <div className="flex rounded-md border overflow-hidden">
            {CRITICALITY_LABELS.map((label, index) => (
                <button
                    key={label}
                    type="button"
                    onClick={() => onChange(index)}
                    className={`flex-1 px-1 py-1.5 text-xs font-medium transition-colors border-r last:border-r-0 ${
                        clamped === index
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background text-muted-foreground hover:bg-muted'
                    }`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
};

const REQUEST_RATE_OPTIONS = [
    { label: 'Низкая (<10 rps)', value: 5 },
    { label: 'Средняя (10–100 rps)', value: 50 },
    { label: 'Высокая (100–1000 rps)', value: 500 },
    { label: 'Экстремальная (>1000 rps)', value: 2000 },
] as const;

const RequestRateSelect = ({
    value,
    onChange,
}: {
    value: number;
    onChange: (newValue: number) => void;
}) => {
    const closest = REQUEST_RATE_OPTIONS.reduce((prev, curr) =>
        Math.abs(curr.value - value) < Math.abs(prev.value - value)
            ? curr
            : prev,
    );
    return (
        <select
            value={closest.value}
            onChange={(event) => onChange(Number(event.target.value))}
            className="border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
            {REQUEST_RATE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
};

const ReadWriteRatioSlider = ({
    value,
    onChange,
}: {
    value: number;
    onChange: (newValue: number) => void;
}) => {
    const clamped = Math.max(0, Math.min(1, value));
    const percent = Math.round(clamped * 100);
    return (
        <div className="space-y-2">
            <Slider
                min={0}
                max={100}
                step={5}
                value={[percent]}
                onValueChange={([nextPercent]) => onChange(nextPercent / 100)}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Больше записи</span>
                <span>Больше чтения</span>
            </div>
            <div className="text-xs text-center font-medium">
                Чтение {percent}% / Запись {100 - percent}%
            </div>
        </div>
    );
};

const HitRateSlider = ({
    value,
    onChange,
}: {
    value: number;
    onChange: (newValue: number) => void;
}) => {
    const clamped = Math.max(0, Math.min(1, value));
    const percent = Math.round(clamped * 100);

    const zoneColor =
        percent < 50
            ? 'text-red-500'
            : percent < 80
              ? 'text-yellow-500'
              : 'text-green-500';

    return (
        <div className="space-y-2">
            <Slider
                min={0}
                max={100}
                step={5}
                value={[percent]}
                onValueChange={([nextPercent]) => onChange(nextPercent / 100)}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
                <span className="text-red-500">0%</span>
                <span className="text-yellow-500">50%</span>
                <span className="text-green-500">100%</span>
            </div>
            <div className={`text-xs text-center font-medium ${zoneColor}`}>
                {percent}% попаданий
            </div>
        </div>
    );
};

const RELIABILITY_OPTIONS = [
    { label: 'Низкая (<95%)', value: 0.9 },
    { label: 'Стандартная (95–99%)', value: 0.97 },
    { label: 'Высокая (99–99.9%)', value: 0.995 },
    { label: 'Максимальная (>99.9%)', value: 0.999 },
] as const;

const ReliabilitySelect = ({
    value,
    onChange,
}: {
    value: number;
    onChange: (newValue: number) => void;
}) => {
    const closest = RELIABILITY_OPTIONS.reduce((prev, curr) =>
        Math.abs(curr.value - value) < Math.abs(prev.value - value)
            ? curr
            : prev,
    );
    return (
        <select
            value={closest.value}
            onChange={(event) => onChange(Number(event.target.value))}
            className="border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
            {RELIABILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
};

type SelectOption<T extends string> = { value: T; label: string };

const Select = <T extends string>({
    value,
    onChange,
    options,
}: {
    value: T;
    onChange: (value: T) => void;
    options: readonly SelectOption<T>[];
}) => {
    return (
        <select
            value={value}
            onChange={(event) => onChange(event.target.value as T)}
            className="border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

const Toggle = ({
    value,
    onChange,
}: {
    value: boolean;
    onChange: (value: boolean) => void;
}) => {
    return (
        <div className="flex gap-2">
            <Button
                type="button"
                variant={value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange(true)}
            >
                Да
            </Button>
            <Button
                type="button"
                variant={!value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange(false)}
            >
                Нет
            </Button>
        </div>
    );
};

const getArchNodeFromFlowNodeData = (
    data: unknown,
): TypeOrNull<ArchitectureNode> => {
    const maybe = data as TypeOrNull<{ node?: ArchitectureNode }>;
    return maybe?.node ?? null;
};

export const NodePropertiesSheet = () => {
    const { nodes: flowNodes, selectedNodeId } = useArchitectureSelectors();

    const { selectNode, removeNode, updateNode } = useArchitectureActions();

    const selectedFlowNode = useMemo(() => {
        if (!selectedNodeId) {
            return null;
        }
        return (
            flowNodes.find((flowNode) => flowNode.id === selectedNodeId) ?? null
        );
    }, [flowNodes, selectedNodeId]);

    const selectedArchitectureNode = useMemo(() => {
        if (!selectedFlowNode) {
            return null;
        }
        return getArchNodeFromFlowNodeData(selectedFlowNode.data);
    }, [selectedFlowNode]);

    const isSheetOpen = Boolean(selectedNodeId && selectedArchitectureNode);

    return (
        <Sheet
            open={isSheetOpen}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    selectNode(null);
                }
            }}
        >
            <SheetContent side="right">
                <SheetHeader>
                    <SheetTitle>Параметры узла</SheetTitle>
                    <SheetDescription>
                        Тип:{' '}
                        <span className="font-medium">
                            {selectedArchitectureNode
                                ? NODE_LABELS[selectedArchitectureNode.kind]
                                : ''}
                        </span>
                    </SheetDescription>
                </SheetHeader>

                {!selectedArchitectureNode ? (
                    <div className="p-4 text-sm text-muted-foreground">
                        Выберите узел на схеме, чтобы редактировать параметры.
                    </div>
                ) : (
                    (() => {
                        const archNode = selectedArchitectureNode;

                        return (
                            <div className="flex flex-col gap-4 p-4">
                                <FieldWithTooltip
                                    label="Сложность"
                                    tooltip="Оценка вычислительной и архитектурной сложности узла. Влияет на расчёт нагрузки рендеринга и общий score."
                                >
                                    <ComplexitySlider
                                        value={
                                            selectedArchitectureNode.complexity
                                        }
                                        onChange={(complexity) =>
                                            updateNode(
                                                selectedArchitectureNode.id,
                                                {
                                                    complexity,
                                                },
                                            )
                                        }
                                    />
                                </FieldWithTooltip>

                                <FieldWithTooltip
                                    label="Критичность"
                                    tooltip="Насколько отказ узла повлияет на систему. Ключевые узлы с высокой входящей связностью отмечаются как единая точка отказа."
                                >
                                    <CriticalityControl
                                        value={
                                            selectedArchitectureNode.criticality
                                        }
                                        onChange={(criticality) =>
                                            updateNode(
                                                selectedArchitectureNode.id,
                                                {
                                                    criticality,
                                                },
                                            )
                                        }
                                    />
                                </FieldWithTooltip>

                                <Separator />

                                {archNode.kind === 'ui_page' && (
                                    <>
                                        <FieldWithTooltip
                                            label="Маршрут"
                                            tooltip="URL-путь страницы в приложении (например, /dashboard)."
                                        >
                                            <Input
                                                value={archNode.route}
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        route: event.target
                                                            .value,
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
                                                value={archNode.componentsCount}
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        componentsCount: Number(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </FieldWithTooltip>
                                        <FieldWithTooltip
                                            label="Использование состояния"
                                            tooltip="Тип управления состоянием: нет, локальное или глобальное. Влияет на анализ связности."
                                        >
                                            <Select
                                                value={archNode.stateUsage}
                                                onChange={(stateUsage) =>
                                                    updateNode(archNode.id, {
                                                        stateUsage,
                                                    })
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
                                                value={archNode.updateFrequency}
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        updateFrequency: Number(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </FieldWithTooltip>
                                    </>
                                )}

                                {archNode.kind === 'ui_component' && (
                                    <>
                                        <FieldWithTooltip
                                            label="Тип компонента"
                                            tooltip="Функциональный тип: ввод, таблица, кнопка или кастомный."
                                        >
                                            <Select
                                                value={archNode.componentType}
                                                onChange={(componentType) =>
                                                    updateNode(archNode.id, {
                                                        componentType,
                                                    })
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
                                                value={
                                                    archNode.nestedComponents
                                                }
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        nestedComponents:
                                                            Number(
                                                                event.target
                                                                    .value,
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
                                                value={archNode.propsCount}
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        propsCount: Number(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </FieldWithTooltip>
                                        <FieldWithTooltip
                                            label="Тип состояния"
                                            tooltip="Источник состояния: нет, локальное, context или глобальный стор."
                                        >
                                            <Select
                                                value={archNode.stateType}
                                                onChange={(stateType) =>
                                                    updateNode(archNode.id, {
                                                        stateType,
                                                    })
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
                                                value={archNode.renderFrequency}
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        renderFrequency: Number(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </FieldWithTooltip>
                                    </>
                                )}

                                {archNode.kind === 'state_store' && (
                                    <>
                                        <FieldWithTooltip
                                            label="Тип хранилища"
                                            tooltip="Технология управления состоянием: Redux, Zustand, Context, localStorage или sessionStorage."
                                        >
                                            <Select
                                                value={archNode.storeType}
                                                onChange={(storeType) =>
                                                    updateNode(archNode.id, {
                                                        storeType,
                                                    })
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
                                                value={
                                                    archNode.subscribersCount
                                                }
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        subscribersCount:
                                                            Number(
                                                                event.target
                                                                    .value,
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
                                                value={archNode.updateFrequency}
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        updateFrequency: Number(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </FieldWithTooltip>
                                    </>
                                )}

                                {archNode.kind === 'api_gateway' && (
                                    <>
                                        <FieldWithTooltip
                                            label="Кол-во эндпоинтов"
                                            tooltip="Количество API-маршрутов. Более 15 — признак монолитного API."
                                        >
                                            <Input
                                                type="number"
                                                value={archNode.endpointsCount}
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        endpointsCount: Number(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </FieldWithTooltip>
                                        <FieldWithTooltip
                                            label="Нагрузка (req/s)"
                                            tooltip="Ожидаемое количество запросов в секунду. Влияет на оценку масштабируемости и нагрузки API."
                                        >
                                            <RequestRateSelect
                                                value={archNode.requestRate}
                                                onChange={(requestRate) =>
                                                    updateNode(archNode.id, {
                                                        requestRate,
                                                    })
                                                }
                                            />
                                        </FieldWithTooltip>
                                        <FieldWithTooltip
                                            label="Требуется авторизация"
                                            tooltip="Нужна ли аутентификация для доступа к API."
                                        >
                                            <Toggle
                                                value={archNode.authRequired}
                                                onChange={(authRequired) =>
                                                    updateNode(archNode.id, {
                                                        authRequired,
                                                    })
                                                }
                                            />
                                        </FieldWithTooltip>
                                    </>
                                )}

                                {archNode.kind === 'service' && (
                                    <>
                                        <FieldWithTooltip
                                            label="Кол-во операций"
                                            tooltip="Количество бизнес-операций в сервисе. Более 10 — признак god-сервиса."
                                        >
                                            <Input
                                                type="number"
                                                value={archNode.operationsCount}
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        operationsCount: Number(
                                                            event.target.value,
                                                        ),
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
                                                value={archNode.externalCalls}
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        externalCalls: Number(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </FieldWithTooltip>
                                        <FieldWithTooltip
                                            label="С состоянием (stateful)"
                                            tooltip="Хранит ли сервис состояние между запросами. Stateful-сервисы сложнее масштабировать."
                                        >
                                            <Toggle
                                                value={archNode.stateful}
                                                onChange={(stateful) =>
                                                    updateNode(archNode.id, {
                                                        stateful,
                                                    })
                                                }
                                            />
                                        </FieldWithTooltip>
                                    </>
                                )}

                                {archNode.kind === 'database' && (
                                    <>
                                        <FieldWithTooltip
                                            label="Тип БД"
                                            tooltip="Реляционная (SQL) или документная (NoSQL) база данных."
                                        >
                                            <Select
                                                value={archNode.dbType}
                                                onChange={(dbType) =>
                                                    updateNode(archNode.id, {
                                                        dbType,
                                                    })
                                                }
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
                                                value={archNode.tablesCount}
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        tablesCount: Number(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </FieldWithTooltip>
                                        <FieldWithTooltip
                                            label="Соотношение чтение/запись"
                                            tooltip="Доля операций чтения. Например, 80% чтения — типично для каталогов, 20% — для логирования."
                                        >
                                            <ReadWriteRatioSlider
                                                value={archNode.readWriteRatio}
                                                onChange={(readWriteRatio) =>
                                                    updateNode(archNode.id, {
                                                        readWriteRatio,
                                                    })
                                                }
                                            />
                                        </FieldWithTooltip>
                                    </>
                                )}

                                {archNode.kind === 'cache' && (
                                    <>
                                        <FieldWithTooltip
                                            label="Тип кэша"
                                            tooltip="Технология кэширования: Redis (распределённый) или in-memory (локальный)."
                                        >
                                            <Select
                                                value={archNode.cacheType}
                                                onChange={(cacheType) =>
                                                    updateNode(archNode.id, {
                                                        cacheType,
                                                    })
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
                                                value={archNode.hitRate}
                                                onChange={(hitRate) =>
                                                    updateNode(archNode.id, {
                                                        hitRate,
                                                    })
                                                }
                                            />
                                        </FieldWithTooltip>
                                    </>
                                )}

                                {archNode.kind === 'external_system' && (
                                    <>
                                        <FieldWithTooltip
                                            label="Тип системы"
                                            tooltip="Назначение внешней системы: авторизация, платежи, аналитика, хранилище, уведомления или другое."
                                        >
                                            <Select
                                                value={archNode.systemType}
                                                onChange={(systemType) =>
                                                    updateNode(archNode.id, {
                                                        systemType,
                                                    })
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
                                                value={archNode.protocol}
                                                onChange={(protocol) =>
                                                    updateNode(archNode.id, {
                                                        protocol,
                                                    })
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
                                                value={archNode.reliability}
                                                onChange={(reliability) =>
                                                    updateNode(archNode.id, {
                                                        reliability,
                                                    })
                                                }
                                            />
                                        </FieldWithTooltip>
                                        <FieldWithTooltip
                                            label="Задержка (мс)"
                                            tooltip="Среднее время ответа внешней системы в миллисекундах. Влияет на оценку latency синхронных цепочек."
                                        >
                                            <Input
                                                type="number"
                                                value={archNode.latencyMs}
                                                onChange={(event) =>
                                                    updateNode(archNode.id, {
                                                        latencyMs: Number(
                                                            event.target.value,
                                                        ),
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
                                                value={archNode.rateLimit ?? ''}
                                                onChange={(event) => {
                                                    const inputValue =
                                                        event.target.value;
                                                    updateNode(archNode.id, {
                                                        rateLimit:
                                                            inputValue === ''
                                                                ? undefined
                                                                : Number(
                                                                      inputValue,
                                                                  ),
                                                    });
                                                }}
                                            />
                                        </FieldWithTooltip>
                                    </>
                                )}
                            </div>
                        );
                    })()
                )}

                <SheetFooter>
                    <Button
                        type="button"
                        disabled={!selectedArchitectureNode}
                        onClick={() => {
                            if (!selectedArchitectureNode) {
                                return;
                            }
                            removeNode(selectedArchitectureNode.id);
                            selectNode(null);
                        }}
                    >
                        Удалить узел
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};
