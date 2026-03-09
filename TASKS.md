# Задачи ArchLens — список для выполнения

> Упорядочен по приоритету. Начинаем с первых пунктов.

---

## 🔴 Фаза 1: Критические (баги + безопасность)

### TASK-01. Баг: удаление системной ноды через Delete ✅
**Проблема:** При удалении элементов через Delete/Backspace системная нода тоже удаляется.

**Причина:** React Flow отправляет changes с `type: 'remove'` в `applyNodeChanges`; проверка на системную ноду есть только в `removeNode`, но не в `applyNodeChanges`.

**Решение:** В `applyNodeChanges` отфильтровывать remove-изменения для ноды с `kind === 'system'` перед вызовом `applyNodeChanges` из React Flow.

**Файлы:** `client/src/pages/editor/model/store.ts`

---

### TASK-02. Цвет системной ноды — фиолетовый ✅
**Проблема:** Системная нода использует тот же цвет (frontend/blue), что и остальные frontend-ноды. Нужно выделить её.

**Решение:** Добавить отдельный цвет для `kind === 'system'` (например, `purple`/`violet`) в `LAYER_COLORS` или задать отдельный объект `SYSTEM_NODE_COLORS` и применять его в `ArchitectureNode` при `kind === 'system'`.

**Файлы:**  
`client/src/pages/editor/lib/config.ts` — цвета  
`client/src/pages/editor/ui/canvas/architecture-node.tsx` — выбор цветов по kind

---

### TASK-03. API key в .env.example ✅
**Проблема:** В `server/.env.example` указан реальный Groq API ключ.

**Решение:** Заменить на placeholder: `GROQ_API_KEY=your_groq_api_key_here`.

**Файлы:** `server/.env.example`

---

### TASK-04. Лимит истории Undo ✅
**Проблема:** `history.past` растёт без ограничения, возможен OOM при больших графах.

**Решение:** Ограничить размер `history.past` и `history.future` (например, 50 шагов).

**Файлы:** `client/src/pages/editor/model/store.ts`

---

## 🟠 Фаза 2: Важные (архитектура + надёжность)

### TASK-05. Cross-page coupling ✅
**Проблема:** Editor импортирует `useAnalysisStore` из analysis; analysis импортирует `loadFlowFromStorage` из editor.

**Решение:**  
- Вынести `useAnalysisStore` в `features/analysis`  
- Вынести `loadFlowFromStorage` в `shared` или `features/architecture-graph-io`

---

### TASK-06. Error Boundary ✅
**Проблема:** Нет `ErrorBoundary`, падения React ломают всё приложение.

**Решение:** Обернуть приложение в `ErrorBoundary` (например, на уровне router/App).

**Файлы:** `client/src/app/main.tsx`, `client/src/app/router/router.tsx`

---

### TASK-07. API: timeout и AbortController ✅
**Проблема:** `fetch` без таймаута и отмены — долгие запросы и race conditions.

**Решение:** Добавить `AbortController`, timeout, пробрасывать `signal` в `fetch`.

**Файлы:** `client/src/shared/api/client.ts`

---

### TASK-08. React Query — использовать или удалить ✅
**Проблема:** React Query подключён, но не используется.

**Решение:** Либо перевести `runAnalysis` на `useMutation`, либо удалить зависимость.

---

### TASK-09. Highlight — вынести из analysis store ✅
**Проблема:** Подсветка нод в `useAnalysisStore`, но используется в editor.

**Решение:** Создать `features/graph-highlight` или вынести в общий слой.

---

### TASK-10. localStorage — QuotaExceededError ✅
**Проблема:** Нет обработки переполнения localStorage.

**Решение:** try/catch вокруг `localStorage.setItem`, обработка `QuotaExceededError`.

**Файлы:** `client/src/pages/editor/lib/utils.ts`, `client/src/pages/analysis/model/store.ts`

---

## 🟡 Фаза 3: Lighthouse (производительность)

### TASK-11. Lazy load properties-панелей ✅
**Проблема:** `node-properties-sheet`, `edge-properties-sheet`, `node-properties-fields` (98 KiB) в критическом пути загрузки.

**Решение:** Lazy import для properties-панелей, монтирование только при открытии Sheet.

**Файлы:**  
`client/src/pages/editor/ui/editor-layout.tsx` (или где рендерятся NodePropertiesSheet, EdgePropertiesSheet)

---

### TASK-12. Minify JavaScript ✅
**Проблема:** Lighthouse: экономия ~2,160 KiB при minify.

**Решение:** Проверить `vite build`, что minify включён для production.

**Файлы:** `client/vite.config.ts`

---

### TASK-13. Удалить/отложить unused JS ✅
**Проблема:** Lighthouse: экономия ~2,805 KiB при сокращении неиспользуемого JS.

**Решение:** Удалить React Query, если не используется; разбить bundle (code splitting); lazy-загрузка тяжёлых модулей.

---

### TASK-14. Bfcache ✅
**Проблема:** Страница мешает back/forward cache.

**Решение:** Свести к минимуму `beforeunload`; при необходимости использовать `pagehide` с флагом `persisted`.

---

### TASK-15. Оптимизация node-properties-fields (99 KiB) ✅
**Проблема:** Самый тяжёлый UI-модуль.

**Решение:** Разбить на чанки, lazy-подгрузка редких полей, проверка импортов.

---

### TASK-16. Sonner в критическом пути (57 KiB) ✅
**Проблема:** Тосты подтягивают 57 KiB.

**Решение:** Lazy-загрузка Sonner или замена на более лёгкую библиотеку.

---

## 🟢 Фаза 4: Оптимизации и улучшения

### TASK-17. Селекторы — точечная подписка ✅
**Проблема:** `useArchitectureSelectors()` возвращает весь объект, лишние re-renders.

**Решение:** Использовать атомарные селекторы: `useArchitectureStore(s => s.nodes)` и т.п.

---

### TASK-18. handleError — проброс statusCode ✅
**Проблема:** `ApiError` содержит `statusCode` и `response`, но в UI показывается только message.

**Решение:** Расширить `handleError` или UI, чтобы передавать и показывать эти поля при необходимости.

---

### TASK-19. Unit-тесты на клиенте
**Проблема:** Нет unit-тестов для клиентской логики.

**Решение:** Vitest + тесты для `architecture-graph-builders`, `extract-node-ids`, `match-node`, селекторов.

---

### TASK-20. Типизация flowInstance ✅
**Проблема:** `flowInstance: unknown`, много `as`-приведений.

**Решение:** Завести типы `ReactFlowInstance<ArchitectureFlowNode>` в store.

---

## Порядок выполнения

| # | Задача | Приоритет | Оценка |
|---|--------|-----------|--------|
| 1 | TASK-01 Баг: системная нода удаляется | 🔴 | 15 мин |
| 2 | TASK-02 Цвет системной ноды | 🔴 | 15 мин |
| 3 | TASK-03 API key в .env | 🔴 | 2 мин |
| 4 | TASK-04 Лимит Undo | 🔴 | 30 мин |
| 5 | TASK-05 Cross-page coupling | 🟠 | 1–2 ч |
| 6 | TASK-06 Error Boundary | 🟠 | 30 мин |
| 7 | TASK-11 Lazy properties | 🟡 | 45 мин |
| 8 | TASK-12–13 Build / tree-shaking | 🟡 | 1 ч |

Начинать можно с **TASK-01** и **TASK-02** — быстрые правки с заметным эффектом.
