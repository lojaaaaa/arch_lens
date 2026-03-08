# ArchLens — Progress Log

> Лог выполнения задач из `tasks.json`. Каждый агент записывает summary после завершения задачи.

---

## Формат записи

```
### TASK-XXX — Название задачи
**Дата:** YYYY-MM-DD
**Статус:** done
**Summary:** Краткое описание выполненной работы и ключевых решений.
**Файлы:** список затронутых файлов
```

---

### TASK-002 — Structural правила: S04, S05, S06
**Дата:** 2026-02-19
**Статус:** done
**Summary:** S04 HighFanIn (warning при >= 4 входящих связей), S05 MissingDataLayer (service без reads/writes к DB/cache), S06 FrontendDbDirect (critical при прямом frontend→database). Пороги из ANALYSIS_CONFIG.
**Файлы:** server/src/analysis/rules/structural/{high-fan-in,missing-data-layer,frontend-db-direct}.rule.ts, structural/index.ts

---

### TASK-003 — Structural правила: S07, S08, S09, S10
**Дата:** 2026-02-19
**Статус:** done
**Summary:** S07 NoApiGateway (warning если есть сервисы без gateway), S08 DisconnectedLayers (слой без кросс-связей), S09 SinglePointOfFailure (critical при criticality>=2 и fan-in>=3), S10 RedundantEdges (info при дублях source-target).
**Файлы:** server/src/analysis/rules/structural/{no-api-gateway,disconnected-layers,single-point-of-failure,redundant-edges}.rule.ts, structural/index.ts

---

### TASK-004 — Pattern правила: P01, P02, P03, P04
**Дата:** 2026-02-19
**Статус:** done
**Summary:** P01 GodService (critical при ops>10 && ext>5), P02 TightCoupling (warning при >=3 рёбер), P03 MissingCache (warning при readWriteRatio>=0.7 без cache), P04 DirectUiState (перенесён из structural/ в pattern/). Пороги вынесены в ANALYSIS_CONFIG.pattern.
**Файлы:** server/src/analysis/rules/pattern/*.rule.ts, pattern/index.ts

---

### TASK-005 — Pattern правила: P05, P06, P07, P08
**Дата:** 2026-02-19
**Статус:** done
**Summary:** P05 StatefulChain (warning при цепочке stateful сервисов), P06 ExcessiveNesting (warning при nestedComponents>5), P07 NoErrorBoundary (info при вызове API без error handling), P08 MonolithApi (warning при endpointsCount>15).
**Файлы:** server/src/analysis/rules/pattern/*.rule.ts

---

### TASK-006 — Load правила: L01, L02, L03
**Дата:** 2026-02-19
**Статус:** done
**Summary:** L01 RenderPressure (warning при frontendComplexity × stateStores > 15), L02 ApiOverload (warning при totalRequestRate > 1000), L03 DbWriteBottleneck (critical при readWriteRatio < 0.3 и > 5 writes). Пороги в ANALYSIS_CONFIG.load.
**Файлы:** server/src/analysis/rules/load/{render-pressure,api-overload,db-write-bottleneck}.rule.ts, load/index.ts

---

### TASK-007 — Load правила: L04, L05, L06
**Дата:** 2026-02-19
**Статус:** done
**Summary:** L04 CacheMissImpact (warning при hitRate<0.5 и DB с >3 reads), L05 ExternalDependencyRisk (warning при reliability<0.95 и critical dependent), L06 SyncChainLatency (warning при >=3 синхронных вызовов с estimated latency).
**Файлы:** server/src/analysis/rules/load/{cache-miss-impact,external-dependency-risk,sync-chain-latency}.rule.ts

---

### TASK-008 — Scoring: grade A-F + bonus-система
**Дата:** 2026-02-19
**Статус:** done
**Summary:** Score formula: 100 - penalty + bonus (clamped 0..100). Penalty: info=2, warning=5, critical=15. Bonus: cache_present=+3, gateway_present=+3, no_cycles=+5, all_connected=+3. Grade: A(90+), B(75-89), C(60-74), D(40-59), F(0-39). Backend DTO и frontend тип обновлены — добавлен summary.grade.
**Файлы:** server/src/analysis/engine/score.calculator.ts, analysis.config.ts, interfaces/analysis-result.interface.ts, analysis.service.ts, client/src/shared/model/types.ts

---

### TASK-009 — Human-readable: complexity ползунок + criticality сегменты
**Дата:** 2026-02-19
**Статус:** done
**Summary:** complexity заменён на Radix Slider (1–5 с русскими метками: Минимальная..Очень высокая). criticality заменён на сегментированный контрол (0–3: Некритичный..Ключевой). Оба с tooltip через FieldWithTooltip + lucide Info icon. Создан shared/ui/slider.tsx (Shadcn-style на Radix).
**Файлы:** client/src/shared/ui/slider.tsx, client/src/pages/editor/ui/properties/node-properties-sheet.tsx

---

### TASK-010 — Human-readable: requestRate, readWriteRatio, hitRate, reliability
**Дата:** 2026-02-19
**Статус:** done
**Summary:** requestRate → dropdown 4 уровня (5/50/500/2000 rps). readWriteRatio → ползунок 0–100% с метками «Больше записи/чтения». hitRate → процентный ползунок с цветовыми зонами (красный<50%, жёлтый 50-80%, зелёный>80%). reliability → dropdown SLA (0.9/0.97/0.995/0.999). Все с FieldWithTooltip.
**Файлы:** client/src/pages/editor/ui/properties/node-properties-sheet.tsx

---

### TASK-011 — Русификация лейблов + tooltips
**Дата:** 2026-02-19
**Статус:** done
**Summary:** Все лейблы полей во всех 8 секциях нод переведены на русский. Все select-опции русифицированы (Локальное, Глобальное, Поле ввода, Таблица, etc.). Каждое поле обёрнуто в FieldWithTooltip с контекстным пояснением. Убран неиспользуемый компонент Field. NODE_LABELS в config.ts русифицированы.
**Файлы:** client/src/pages/editor/ui/properties/node-properties-sheet.tsx, client/src/pages/editor/lib/config.ts

---

### TASK-012 — Визуальное различие слоёв: цвета + иконки нод
**Дата:** 2026-02-19
**Статус:** done
**Summary:** Создан кастомный React Flow node-тип «architecture» (ArchitectureNodeComponent). Цвета по слоям: frontend=синий, backend=зелёный, data=оранжевый (bg + border + text). Иконки-эмодзи для каждого kind (📄🧩📦🌐⚙️🗄️⚡☁️). toFlowNode переключён на type:'architecture'. NODE_KINDS русифицированы.
**Файлы:** client/src/pages/editor/ui/canvas/architecture-node.tsx, architecture-canvas.tsx, lib/config.ts, lib/utils.ts

---

### TASK-013 — Визуальные стили для типов связей
**Дата:** 2026-02-19
**Статус:** done
**Summary:** Добавлен EDGE_STYLES в config.ts с уникальными цветами и паттернами: calls=#6366f1 сплошная, reads=#22c55e пунктир, writes=#ef4444 сплошная, subscribes=#f59e0b пунктир+animated, depends_on=#8b5cf6 штрих, emits=#06b6d4 animated. toFlowEdge обновлён — стили и цвет маркеров применяются. EDGE_KIND_LABELS русифицированы.
**Файлы:** client/src/pages/editor/lib/config.ts, client/src/pages/editor/lib/utils.ts

---

### TASK-049 — Drag-and-drop нод из сайдбара на canvas
**Дата:** 2026-02-19
**Статус:** done
**Summary:** Добавлен drag-and-drop из сайдбара на canvas через HTML5 DnD. Drop учитывает зум/панораму и ставит ноду под курсором; при добавлении нода автоматически выделяется.
**Файлы:** client/src/pages/editor/ui/sidebar/sidebar.tsx, client/src/pages/editor/ui/canvas/architecture-canvas.tsx

---

### TASK-050 — Счётчик элементов и связей в редакторе
**Дата:** 2026-02-19
**Статус:** done
**Summary:** Добавлен компактный счётчик нод и связей внизу слева на canvas через React Flow Panel (иконки + числа).
**Файлы:** client/src/pages/editor/ui/canvas/architecture-canvas.tsx

---

### TASK-048 — Multi-select + external_system color
**Дата:** 2026-02-19
**Статус:** done
**Summary:** Включен drag-select и multi-select (Ctrl/Cmd+клик) на canvas. `external_system` приведен к Data layer, чтобы отображаться оранжевым.
**Файлы:** client/src/pages/editor/ui/canvas/architecture-canvas.tsx, client/src/pages/editor/lib/utils.ts, client/src/shared/model/types.ts, client/src/features/architecture-graph-io/model/schema.ts

---

### TASK-047 — Экспорт PNG/SVG
**Дата:** 2026-02-19
**Статус:** done
**Summary:** В меню «Файл» добавлены экспорт PNG/SVG и чекбокс «Прозрачный фон». Экспорт использует текущий canvas.
**Файлы:** client/src/pages/editor/ui/header/header.tsx, client/src/pages/editor/lib/export-image.ts

---

### TASK-056 — Дополнительные подсказки в редакторе
**Дата:** 2026-02-19
**Статус:** done
**Summary:** Добавлены подсказки средней длины для действий в Header и кнопок типов нод в Sidebar; существующие подсказки в свойствах сохранены.
**Файлы:** client/src/pages/editor/ui/header/header.tsx, client/src/pages/editor/ui/sidebar/sidebar.tsx

---

### TASK-057 — Кастомные названия нод
**Дата:** 2026-02-19
**Статус:** done
**Summary:** Добавлены кастомные имена нод с inline‑редактированием по двойному клику и полем в свойствах. Тип отображается в виде badge рядом с именем.
**Файлы:** client/src/shared/model/types.ts, client/src/features/architecture-graph-io/model/schema.ts, client/src/pages/editor/lib/utils.ts, client/src/pages/editor/ui/canvas/architecture-node.tsx, client/src/pages/editor/ui/properties/node-properties-sheet.tsx

---

### TASK-058 — Корневой элемент «System»
**Дата:** 2026-02-19
**Статус:** done
**Summary:** Добавлен тип узла system, обеспечена уникальность, автоматическое создание и авто‑связи ui_page → system (depends_on) при добавлении и импорте/восстановлении.
**Файлы:** client/src/shared/model/types.ts, client/src/shared/model/config.ts, client/src/features/architecture-graph-io/model/schema.ts, client/src/pages/editor/lib/config.ts, client/src/pages/editor/lib/utils.ts, client/src/pages/editor/model/types.ts, client/src/pages/editor/model/store.ts, client/src/pages/editor/model/selectors.ts, client/src/pages/editor/ui/canvas/architecture-canvas.tsx, client/src/pages/editor/editor-page.tsx, client/src/pages/editor/lib/use-editor-persistence.ts

---

### TASK-059 — Шаблоны архитектур (presets)
**Дата:** 2026-02-19
**Статус:** done
**Summary:** Добавлены 3 шаблона (CRUD, микросервисы, событийная) и панель их применения в сайдбаре. Загрузка шаблона заменяет canvas нодами и связями.
**Файлы:** client/src/pages/editor/lib/presets.ts, client/src/pages/editor/ui/sidebar/sidebar.tsx

---

### TASK-061 — rulesVersion в AnalysisResult
**Дата:** 2026-02-19
**Статус:** done
**Summary:** Добавлена версия правил анализа в API-ответ и отображение на странице анализа.
**Файлы:** server/src/analysis/rules/index.ts, server/src/analysis/interfaces/analysis-result.interface.ts, server/src/analysis/analysis.service.ts, client/src/shared/model/types.ts, client/src/shared/api/analysis/analysis-result.schema.ts, client/src/pages/analysis/ui/analysis-results.tsx

---

### TASK-051 — Приоритизация issues на странице анализа
**Дата:** 2026-02-19
**Статус:** done
**Summary:** Сортировка issues по severity (critical → warning → info) уже была реализована. Добавлены: порядковые номера (1, 2, 3…) для явного приоритета, badge с severity и категорией, подсказка «Сначала исправьте критические (N)» при наличии critical, tooltip «Исправьте в первую очередь» для первого critical.
**Файлы:** client/src/pages/analysis/ui/analysis-results/analysis-issues.tsx

---

### TASK-052 — Дополнительные метрики + объяснения расчётов
**Дата:** 2026-02-19
**Статус:** done
**Summary:** Добавлены 3 новые метрики: stateStoreCount, maxFanOut, eventDrivenEdgesCount. Для каждой из 11 метрик — tooltip с формулой/описанием расчёта. METRIC_TOOLTIPS с пояснениями на русском.
**Файлы:** server/src/analysis/engine/metrics.calculator.ts, server/src/analysis/interfaces/analysis-result.interface.ts, client/src/shared/model/types.ts, client/src/shared/api/analysis/analysis-result.schema.ts, client/src/pages/analysis/ui/analysis-results/analysis-metrics.tsx

---

### TASK-062 — Поиск по графу
**Дата:** 2026-02-19
**Статус:** done
**Summary:** Поле поиска в header. Поиск по displayName, kind, NODE_LABELS[kind], id. Результаты подсвечиваются (ring + pulse), fitView на найденные ноды. Debounce 150ms. highlightPreventAutoClear — подсветка от поиска не сбрасывается через 10 сек.
**Файлы:** client/src/pages/editor/ui/header/graph-search.tsx, header.tsx, client/src/pages/analysis/model/store.ts, types.ts, client/src/pages/editor/ui/canvas/use-canvas-highlight.ts

---

### TASK-060 — Unit-тесты для правил анализа
**Дата:** 2026-02-19
**Статус:** done
**Summary:** 11 тестов на S01 (orphans), S02 (cycles), S06 (frontend-db-direct), RuleEngine. Fixture-хелперы createNode/createEdge/createGraph. Негативный кейс: исправление графа → issue исчезает. npm run test:rules.
**Файлы:** server/src/analysis/rules/__tests__/rules.spec.ts, server/package.json

---

### TASK-063 — Zoom-to-fit / Center
**Дата:** 2026-02-19
**Статус:** done
**Summary:** Кнопка «Вписать в экран» (top-right) с иконкой Maximize2. fitView с padding 0.2, duration 400ms. Tooltip «Центрировать и масштабировать схему». Fit view убран из default Controls.
**Файлы:** client/src/pages/editor/ui/canvas/canvas-fit-view-button.tsx, canvas-controls.tsx, architecture-canvas.tsx

---

### TASK-053 — Пересмотр score/grade
**Дата:** 2026-02-19
**Статус:** done
**Summary:** Новые штрафы: info=2, warning=10, critical=28. ruleId в issues (S01, S02, S08) для надёжной проверки бонусов. SCORING.md с описанием формул. Unit-тесты score calculator.
**Файлы:** server/src/analysis/engine/score.calculator.ts, analysis.config.ts, interfaces/analysis-issue.interface.ts, rules/structural/{orphan,cyclic,disconnected}.ts, SCORING.md, engine/__tests__/score.calculator.spec.ts

---

