export type MetricMeta = {
    formula: string;
    meaning: string;
    action: string;
};

export const METRIC_META: Record<string, MetricMeta> = {
    totalNodes: {
        formula: '|V|',
        meaning:
            'Количество узлов в графе архитектуры. Базовый размер системы.',
        action: 'Оцените: 5–20 — микросервис/CRUD; 20–50 — средняя; >50 — монолит или сложная система. Декомпозируйте при >40 узлов.',
    },
    totalEdges: {
        formula: '|E|',
        meaning:
            'Количество связей (calls, reads, writes, subscribes, emits, depends_on). Степень связанности.',
        action: 'Соотнесите с totalNodes: плотность = |E| / (|V|×(|V|-1)). Слишком много связей → рассмотрите API Gateway, event bus.',
    },
    density: {
        formula: '|E| / (|V| × (|V| − 1))',
        meaning:
            'Плотность directed-графа. <0.1 — слабая связанность; 0.1–0.3 — норма; >0.5 — «spaghetti», высокая связанность.',
        action: 'При density > 0.5: разбейте на подсистемы, введите слои (frontend → gateway → services). При <0.1 — проверьте изолированные узлы.',
    },
    depth: {
        formula: 'max(path length) от entry points',
        meaning:
            'Глубина цепочки вызовов от точек входа. >5 — риск латентности; >8 — высокий риск накопления задержек.',
        action: 'При depth > 5: кэшируйте часто используемые результаты, введите асинхронность. При depth > 8 — пересмотрите архитектуру.',
    },
    cycleCount: {
        formula: 'Tarjan SCC, count(size > 1)',
        meaning:
            'Количество циклических зависимостей. Циклы затрудняют развёртывание и понимание порядка инициализации.',
        action: 'Устраните циклы: введите событийный слой (event bus), инвертируйте зависимости через интерфейсы. Цель — 0 циклов.',
    },
    maxFanOut: {
        formula: 'max |{u | (v→u) ∈ E}|',
        meaning:
            'Максимальное число исходящих связей у узла. Martin: low fan-out ≤ 3; >6 — критично.',
        action: 'При fan-out > 3: выделите общие зависимости в фасад или сервис. При >6 — рефакторинг обязателен.',
    },
    avgFanOut: {
        formula: 'Σ fanOut / |V|',
        meaning:
            'Средний fan-out. Используется в расчёте God Index (fanOut/avgFanOut).',
        action: 'Сравните maxFanOut с avgFanOut. Если maxFanOut / avgFanOut > 3 — узел перегружен связями (God Object risk).',
    },
    frontendComplexity: {
        formula: 'Σ complexity(ui_page, ui_component, state_store)',
        meaning:
            'Суммарная сложность frontend-узлов (1–5). Адаптация cyclomatic на компоненты.',
        action: 'При >10: декомпозируйте страницы, выносите сложную логику в hooks/services. Снизьте complexity на тяжёлых узлах.',
    },
    backendComplexity: {
        formula:
            'Σ complexity(api_gateway, service, database, cache, external_system)',
        meaning: 'Суммарная сложность backend и data-слоёв.',
        action: 'При >15: разбейте God Services, введите очереди, используйте кэш. Операции >10 на сервис — кандидат на split.',
    },
    estimatedApiLoad: {
        formula: '|edges: kind ∈ {calls, reads}|',
        meaning:
            'Число обращений к API (calls + reads). Оценка нагрузки на gateway и сервисы.',
        action: 'При высокой нагрузке: кэшируйте read-heavy endpoints, введите rate limiting, масштабируйте горизонтально.',
    },
    estimatedRenderPressure: {
        formula: 'frontendComplexity × (stateStoreCount || 1)',
        meaning:
            'Эвристика нагрузки рендеринга. Высокое значение — много подписок и перерисовок.',
        action: 'При >15: селективно подписывайтесь на store, используйте memo, виртуализируйте списки. Уменьшите stateStoreCount.',
    },
    estimatedDataLoad: {
        formula: '|edges: kind ∈ {reads, writes}|',
        meaning: 'Объём обращений к БД и кэшу.',
        action: 'При reads ≫ writes: добавьте кэш. При writes > reads: проверьте batch-операции, очереди. Read/write ratio влияет на выбор стратегии.',
    },
    criticalNodesCount: {
        formula: '|{v | criticality(v) ≥ 2}|',
        meaning:
            'Узлы с критичностью ≥ 2. При fan-in ≥ 3 — риск SPOF (single point of failure).',
        action: 'Для каждого критичного узла: репликация, health checks, circuit breaker. Избегайте >2 SPOF без резервирования.',
    },
    stateStoreCount: {
        formula: '|{v | kind(v) = state_store}|',
        meaning:
            'Количество глобальных store. Влияет на Render Pressure и maintainability.',
        action: '1–2 store — норма. Больше — рассмотрите domain-based stores, colocate state с компонентами.',
    },
    eventDrivenEdgesCount: {
        formula: '|edges: kind ∈ {subscribes, emits}|',
        meaning: 'Число событийных связей. Степень событийной архитектуры.',
        action: 'Высокое значение — слабая связанность, асинхронность. Низкое при большом графе — возможно, избыточный sync coupling.',
    },
    callsCount: {
        formula: '|edges: kind = calls|',
        meaning: 'Вызовы API и сервисов. Основная нагрузка.',
        action: 'Соотнесите с API load. Высокое значение — рассмотрите кэширование.',
    },
    readsCount: {
        formula: '|edges: kind = reads|',
        meaning: 'Чтения из БД и кэша.',
        action: 'Read-heavy — кандидат на кэш. Проверьте readWriteRatio.',
    },
    writesCount: {
        formula: '|edges: kind = writes|',
        meaning: 'Запись в БД и кэш.',
        action: 'Write-heavy — bottleneck на БД. Batch-операции, очереди.',
    },
    subscribesCount: {
        formula: '|edges: kind = subscribes|',
        meaning: 'Подписки на события.',
        action: 'Событийная архитектура. Проверьте слабую связанность.',
    },
    emitsCount: {
        formula: '|edges: kind = emits|',
        meaning: 'Публикация событий.',
        action: 'Событийная архитектура. Асинхронность.',
    },
    dependsOnCount: {
        formula: '|edges: kind = depends_on|',
        meaning: 'Структурные зависимости (например, page→system).',
        action: 'Не несут нагрузки. Информационно.',
    },
};
