import { useNavigate } from 'react-router';
import {
    BookOpen,
    Box,
    Cable,
    ChevronRight,
    Cpu,
    Database,
    Gauge,
    GitBranch,
    Keyboard,
    Layers,
    Lightbulb,
    Monitor,
    Server,
    TriangleAlert,
    Zap,
} from 'lucide-react';

import { ThemeToggle } from '@/features/theme';
import { Routes } from '@/shared/model/routes';
import { Button } from '@/shared/ui/button';

import { METRIC_META } from '../analysis/ui/analysis-results/metric-meta';

const DOC_ANCHORS = [
    { id: 'idea', label: 'Идея сервиса' },
    { id: 'nodes', label: 'Узлы и критерии' },
    { id: 'edges', label: 'Связи' },
    { id: 'metrics', label: 'Метрики' },
    { id: 'flow', label: 'Как проходит анализ' },
    { id: 'hotkeys', label: 'Горячие клавиши' },
] as const;

const METRIC_CATEGORIES: {
    id: string;
    title: string;
    icon: typeof Box;
    keys: (keyof typeof METRIC_META)[];
}[] = [
    {
        id: 'structural',
        title: 'Structural',
        icon: Layers,
        keys: ['totalNodes', 'totalEdges', 'density', 'depth', 'cycleCount'],
    },
    {
        id: 'coupling',
        title: 'Coupling',
        icon: Cable,
        keys: ['maxFanOut', 'avgFanOut'],
    },
    {
        id: 'complexity',
        title: 'Complexity',
        icon: Cpu,
        keys: ['frontendComplexity', 'backendComplexity'],
    },
    {
        id: 'performance',
        title: 'Performance',
        icon: Gauge,
        keys: ['apiEdgesCount', 'estimatedRenderPressure', 'dataEdgesCount'],
    },
    {
        id: 'reliability',
        title: 'Reliability',
        icon: TriangleAlert,
        keys: ['criticalNodesCount'],
    },
    {
        id: 'maintainability',
        title: 'Maintainability',
        icon: GitBranch,
        keys: ['stateStoreCount', 'eventDrivenEdgesCount'],
    },
    {
        id: 'edgeTypes',
        title: 'Типы связей',
        icon: Zap,
        keys: [
            'callsCount',
            'readsCount',
            'writesCount',
            'subscribesCount',
            'emitsCount',
            'dependsOnCount',
        ],
    },
];

const NODE_CARDS = [
    {
        kind: 'ui_page',
        icon: Monitor,
        label: 'Страница',
        props: 'componentsCount, stateUsage, updateFrequency',
        influence: 'complexity, Render Pressure',
    },
    {
        kind: 'ui_component',
        icon: Box,
        label: 'Компонент',
        props: 'nestedComponents, propsCount, stateType, renderFrequency',
        influence: 'God Component, Excessive Nesting, Render Pressure',
    },
    {
        kind: 'state_store',
        icon: Database,
        label: 'Хранилище',
        props: 'subscribersCount, updateFrequency, storeType',
        influence: 'complexity, load propagation',
    },
    {
        kind: 'api_gateway',
        icon: Server,
        label: 'API Gateway',
        props: 'endpointsCount, requestRate',
        influence: 'Monolith API (>15), Bottleneck, Load propagation',
    },
    {
        kind: 'service',
        icon: Cpu,
        label: 'Сервис',
        props: 'operationsCount, externalCalls, stateful',
        influence: 'God Service (>10 ops, >5 external), External Risk',
    },
    {
        kind: 'database',
        icon: Database,
        label: 'БД',
        props: 'tablesCount, readWriteRatio, dbType',
        influence: 'Missing Cache, Cache rule',
    },
    {
        kind: 'cache',
        icon: Zap,
        label: 'Кэш',
        props: 'hitRate, cacheType',
        influence: 'Cache rule (hitRate < 0.5 → warning)',
    },
    {
        kind: 'external_system',
        icon: Cable,
        label: 'Внешняя система',
        props: 'reliability, latencyMs, rateLimit',
        influence: 'External Risk, Critical Path, Bottleneck',
    },
];

const FLOW_STEPS = [
    { n: 1, title: 'Вход', desc: 'Граф узлов и рёбер с параметрами' },
    { n: 2, title: 'Graph Builder', desc: 'fan-in, fan-out, слои, adjacency' },
    { n: 3, title: 'Метрики', desc: 'Считаются 20+ чисел по категориям' },
    {
        n: 4,
        title: 'Rules Engine',
        desc: '~23 правила: Structural, Pattern, Load',
    },
    { n: 5, title: 'Score & Grade', desc: '0–100, штрафы и бонусы, A–F' },
    { n: 6, title: 'Отчёт', desc: 'Summary, issues, подсветка в редакторе' },
];

const IS_MAC =
    typeof navigator !== 'undefined' && /mac/i.test(navigator.userAgent);
const MOD = IS_MAC ? '⌘' : 'Ctrl';

const HOTKEY_GROUPS: {
    title: string;
    keys: { combo: string; description: string }[];
}[] = [
    {
        title: 'Редактирование графа',
        keys: [
            { combo: `${MOD}+Z`, description: 'Отменить (Undo)' },
            {
                combo: `${MOD}+Y / ${MOD}+Shift+Z`,
                description: 'Повторить (Redo)',
            },
            { combo: `${MOD}+D`, description: 'Дублировать выбранное' },
            { combo: `${MOD}+C`, description: 'Копировать выбранное' },
            { combo: `${MOD}+V`, description: 'Вставить из буфера' },
            {
                combo: 'Delete / Backspace',
                description: 'Удалить выбранный узел или связь',
            },
            { combo: 'Escape', description: 'Снять выделение' },
        ],
    },
    {
        title: 'Файлы и сохранение',
        keys: [
            { combo: `${MOD}+S`, description: 'Сохранить схему' },
            {
                combo: `${MOD}+Shift+S`,
                description: 'Экспортировать в JSON',
            },
            { combo: `${MOD}+O`, description: 'Импортировать из JSON' },
        ],
    },
    {
        title: 'Навигация и поиск',
        keys: [
            { combo: `${MOD}+F`, description: 'Поиск по графу' },
            { combo: 'Escape', description: 'Закрыть поиск' },
            { combo: 'Scroll / Pinch', description: 'Масштабирование' },
        ],
    },
    {
        title: 'Редактирование узла (инлайн)',
        keys: [
            {
                combo: 'Двойной клик',
                description: 'Войти в режим редактирования имени',
            },
            { combo: 'Enter', description: 'Сохранить имя' },
            { combo: 'Escape', description: 'Отменить редактирование' },
        ],
    },
    {
        title: 'Режим презентации',
        keys: [{ combo: 'Escape', description: 'Выйти из презентации' }],
    },
];

const DocsPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-4 pb-24">
            <nav className="flex items-center gap-1 text-xs text-muted-foreground">
                <button
                    type="button"
                    onClick={() => navigate(Routes.editor)}
                    className="hover:text-foreground transition-colors"
                >
                    Редактор
                </button>
                <ChevronRight className="size-3" />
                <span>Документация</span>
            </nav>

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold sm:text-2xl">
                        ArchLens — документация
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Идея сервиса, узлы, связи, метрики и механизм анализа
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    <ThemeToggle />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(Routes.editor)}
                    >
                        Назад к редактору
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border bg-muted/30 p-5">
                <h3 className="mb-5 flex items-center gap-2 text-sm font-medium">
                    <BookOpen className="size-4" />
                    Содержание
                </h3>
                <nav className="flex flex-wrap items-center gap-4 text-sm">
                    {DOC_ANCHORS.map((a) => (
                        <span
                            key={a.id}
                            className="inline-flex items-center gap-x-2"
                        >
                            <a
                                href={`#${a.id}`}
                                className="text-muted-foreground hover:text-foreground hover:underline transition-colors"
                            >
                                {a.label}
                            </a>
                        </span>
                    ))}
                </nav>
            </div>

            <div className="flex flex-col gap-8">
                <section
                    id="idea"
                    className="p-5 scroll-mt-8 rounded-xl border bg-card"
                >
                    <h2 className="mb-8 flex items-center gap-2 text-lg font-semibold">
                        <Lightbulb className="size-5 text-amber-500" />
                        1. Идея сервиса
                    </h2>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-4 rounded-lg bg-muted/30 p-6">
                            <p className="text-sm font-medium">Что делает</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                ArchLens — сервис для визуального проектирования
                                и анализа архитектуры. Рисуете схему компонентов
                                и связей → получаете список проблем: циклы,
                                перегруженные сервисы, нарушения слоёв, SPOF.
                            </p>
                        </div>
                        <div className="space-y-4 rounded-lg bg-muted/30 p-6">
                            <p className="text-sm font-medium">Зачем</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Анализ работает <strong>до кода</strong>, на
                                уровне модели. Проверка идеи до реализации,
                                подготовка к System Design, обучение на обратной
                                связи.
                            </p>
                        </div>
                    </div>
                    <div className="mt-8 rounded-lg border border-dashed p-6">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-4">
                            Вход
                        </p>
                        <p className="text-sm leading-relaxed">
                            Ориентированный граф <strong>G = (V, E)</strong>:
                            узлы — компоненты (страницы, API, сервисы, БД, кэш,
                            внешние системы); рёбра — зависимости (вызовы,
                            чтения, записи, подписки).
                        </p>
                    </div>
                </section>

                <section
                    id="nodes"
                    className="p-5 scroll-mt-8 rounded-xl border bg-card"
                >
                    <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold">
                        <Box className="size-5 text-blue-500" />
                        2. Узлы (kind) и критерии
                    </h2>

                    <div className="mb-8 grid gap-4 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 p-6">
                        <h3 className="text-sm font-medium">
                            Общие свойства (все узлы)
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-lg border bg-background p-6 text-sm leading-relaxed">
                                <code className="font-medium">criticality</code>{' '}
                                (0–3) — влияет на SPOF (≥2 + fan-in ≥3 → единая
                                точка отказа) и risk score
                            </div>
                            <div className="rounded-lg border bg-background p-6 text-sm leading-relaxed">
                                <code className="font-medium">complexity</code>{' '}
                                (1–5) — вычисляется из kind-specific полей;
                                влияет на Render Pressure, God Service
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {NODE_CARDS.map(
                            ({ kind, icon: Icon, label, props, influence }) => (
                                <div
                                    key={kind}
                                    className="flex flex-col gap-3 rounded-lg border p-5 transition-colors hover:bg-muted/30"
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon className="size-4 shrink-0 text-muted-foreground" />
                                        <span className="text-xs font-medium text-muted-foreground">
                                            {kind}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium">
                                        {label}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {props}
                                    </p>
                                    <p className="mt-auto text-xs">
                                        <span className="text-muted-foreground">
                                            Влияет:{' '}
                                        </span>
                                        {influence}
                                    </p>
                                </div>
                            ),
                        )}
                    </div>
                </section>

                <section
                    id="edges"
                    className="p-5 scroll-mt-8 rounded-xl border bg-card"
                >
                    <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold">
                        <Cable className="size-5 text-green-500" />
                        3. Связи (edges) и их влияние
                    </h2>
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="p-5 border-b bg-muted/50">
                                    <th className="p-5 text-left font-medium">
                                        Тип
                                    </th>
                                    <th className="p-5 text-left font-medium">
                                        Вес нагрузки
                                    </th>
                                    <th className="p-5 text-left font-medium">
                                        Влияние
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    [
                                        'calls',
                                        '1.0',
                                        'API load, основной трафик',
                                    ],
                                    ['reads', '1.0', 'Data load, чтения'],
                                    ['writes', '0.5', 'Обновления'],
                                    ['subscribes', '0.3', 'Event-driven'],
                                    ['emits', '0.3', 'Event-driven'],
                                    [
                                        'depends_on',
                                        '0',
                                        'Зависимость без нагрузки',
                                    ],
                                ].map(([type, weight, influence]) => (
                                    <tr
                                        key={type}
                                        className="border-b last:border-0 hover:bg-muted/20"
                                    >
                                        <td className="p-5 py-3">
                                            <code className="rounded bg-muted px-1.5 py-0.5">
                                                {type}
                                            </code>
                                        </td>
                                        <td className="p-5 py-3 font-mono text-muted-foreground">
                                            {weight}
                                        </td>
                                        <td className="p-5 py-3 text-muted-foreground">
                                            {influence}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                        Дополнительно: <strong>frequency</strong> (0–1) — доля
                        нагрузки; <strong>synchronous</strong> — влияет на
                        Critical Path и Sync Chain.
                    </p>
                </section>

                <section
                    id="metrics"
                    className="p-5 scroll-mt-8 rounded-xl border bg-card"
                >
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                        <Gauge className="size-5 text-purple-500" />
                        4. Метрики
                    </h2>
                    <p className="mb-8 text-sm text-muted-foreground">
                        Что считается, откуда берутся данные и как
                        интерпретировать значения
                    </p>
                    <div className="flex flex-col gap-4 space-y-10">
                        {METRIC_CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <div key={cat.id}>
                                    <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Icon className="size-4" />
                                        {cat.title}
                                    </h3>
                                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                        {cat.keys.map((key) => {
                                            const meta = METRIC_META[key];
                                            if (!meta) {
                                                return null;
                                            }
                                            return (
                                                <div
                                                    key={key}
                                                    className="rounded-lg border bg-muted/20 p-5"
                                                >
                                                    <p className="mb-3 font-mono text-xs font-medium">
                                                        {key}
                                                    </p>
                                                    <p className="mb-3 text-xs text-muted-foreground leading-relaxed">
                                                        <span className="font-medium text-foreground">
                                                            Формула:{' '}
                                                        </span>
                                                        <code className="rounded bg-muted px-1">
                                                            {meta.formula}
                                                        </code>
                                                    </p>
                                                    <p className="mb-3 text-xs leading-relaxed">
                                                        {meta.meaning}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                                        <span className="font-medium text-foreground">
                                                            Действие:{' '}
                                                        </span>
                                                        {meta.action}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section
                    id="flow"
                    className="flex flex-col gap-4 p-5 scroll-mt-8 rounded-xl border bg-card"
                >
                    <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold">
                        <GitBranch className="size-5 text-cyan-500" />
                        5. Как проходит анализ
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {FLOW_STEPS.map((step) => (
                            <div
                                key={step.n}
                                className="flex min-w-0 flex-col gap-2 rounded-lg border-2 bg-muted/20 p-5"
                            >
                                <span className="text-xs font-bold text-muted-foreground">
                                    Шаг {step.n}
                                </span>
                                <p className="text-sm font-medium">
                                    {step.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50/50 p-5 text-xs text-muted-foreground leading-relaxed dark:border-amber-800 dark:bg-amber-950/30">
                        ArchLens не анализирует код и runtime, не заменяет
                        профилирование и нагрузочное тестирование. Работаем со
                        статической моделью.
                    </p>
                </section>

                <section
                    id="hotkeys"
                    className="p-5 scroll-mt-8 rounded-xl border bg-card"
                >
                    <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold">
                        <Keyboard className="size-5 text-orange-500" />
                        6. Горячие клавиши
                    </h2>
                    <p className="mb-8 text-sm text-muted-foreground">
                        Все доступные сочетания клавиш в редакторе архитектуры
                    </p>
                    <div className="flex flex-col gap-6">
                        {HOTKEY_GROUPS.map((group) => (
                            <div key={group.title}>
                                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                                    {group.title}
                                </h3>
                                <div className="overflow-hidden rounded-lg border">
                                    {group.keys.map((hk, i) => (
                                        <div
                                            key={hk.combo}
                                            className={`flex items-center justify-between px-4 py-2.5 text-sm ${i > 0 ? 'border-t' : ''} hover:bg-muted/20`}
                                        >
                                            <span className="text-muted-foreground">
                                                {hk.description}
                                            </span>
                                            <kbd className="ml-4 flex-shrink-0 rounded-md border bg-muted/50 px-2 py-1 font-mono text-xs">
                                                {hk.combo}
                                            </kbd>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export const Component = DocsPage;
