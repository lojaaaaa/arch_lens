# Code Style Guide — ArchLens

Правила код-стайла и архитектурные соглашения проекта.
Цель — читаемость, предсказуемость и масштабируемость.

> Дополняется по ходу разработки. Каждое правило появилось по причине.

---

## 1. Общие принципы

- **Читаемость важнее краткости.** Код читается чаще, чем пишется. Явные имена лучше сокращений. Понятные конструкции лучше «умных».
- **Один файл — одна ответственность.** Компонент = UI. Store = состояние + actions. Типы = только типы. Утилиты = чистые функции без побочных эффектов.
- **Строгая типизация.** `any` запрещён. `unknown` — только с последующим сужением. Все публичные API типизированы.
- **Не дублируй — переиспользуй.** Общие типы, утилиты и конфиги живут в `shared/`. Если одно и то же используется в 2+ местах — выноси.

---

## 2. Структура проекта (FSD)

```
src/
├── app/          — инициализация, провайдеры, роутер
├── pages/        — страницы (роуты), page-level логика
├── features/     — изолированные фичи и сценарии
└── shared/       — переиспользуемые ресурсы
    ├── ui/       — UI-компоненты (Shadcn, кастомные)
    ├── model/    — общие типы, конфиги
    ├── api/      — API-клиент, запросы
    ├── lib/      — утилиты
    ├── hooks/    — общие хуки
    └── config/   — env, константы
```

Внутри модуля (page / feature):

```
feature-name/
├── model/        — store, types, selectors
├── ui/           — компоненты
├── lib/          — хелперы, хуки модуля
└── index.ts      — публичный API модуля
```

---

## 3. Именование

### Файлы и папки

`kebab-case` для всех файлов и директорий:
`node-properties-sheet.tsx`, `use-canvas-handlers.ts`, `architecture-graph.dto.ts`

### Переменные и функции

`camelCase`: `buildExportableGraph`, `handleAnalysisClick`

### Типы и интерфейсы

`PascalCase`: `ArchitectureNode`, `AnalysisResult`, `EdgeKind`

### Константы

`UPPER_SNAKE_CASE` для глобальных констант: `EDGE_KIND_LABELS`, `NODE_LABELS`
`camelCase` для локальных: `const maxRetries = 3`

---

## 4. TypeScript

### Interface vs Type

- `interface` — для объектов и расширения (extends)
- `type` — для union, primitives, mapped types, утилитарных типов

### Utility types

Использовать `Partial`, `Pick`, `Omit`, `Record` вместо дублирования типов.
Явно указывать назначение patch-объектов:

```typescript
type NodePatch = Partial<Omit<ArchitectureNode, 'id' | 'kind' | 'layer'>>;
```

### Запреты

- `enum` запрещён — использовать union types: `type EdgeKind = 'calls' | 'reads' | ...`
- `any` запрещён
- `as` — только при доказуемой безопасности (type assertion), предпочитать type guards

---

## 5. React-компоненты

### Структура

- Функциональные компоненты (FC не используем, явный return type)
- Один компонент — один файл (допускаются мелкие вспомогательные в том же файле)
- Минимум логики в UI — выносить в хуки и утилиты

```typescript
type NodeCardProps = {
  node: ArchitectureNode;
  onSelect: (id: string) => void;
};

export const NodeCard = ({ node, onSelect }: NodeCardProps) => {
  // ...
};
```

### Props

- Явный type для props (не inline)
- Деструктуризация в параметрах
- Дефолтные значения через деструктуризацию, не `defaultProps`

### Хуки

- Не бойся выносить логику в кастомные хуки
- `useMemo` и `useCallback` — только когда действительно необходимо (референсная стабильность для дочерних компонентов, тяжёлые вычисления). Аргументировать при использовании.
- `useEffect` — минимизировать; предпочитать event handlers и derived state

### Экспорт

- Named exports всегда (не default)
- `index.ts` как публичный API модуля — экспортировать только то, что нужно снаружи

---

## 6. State Management (Zustand)

- Один store на логический домен (editor store, analysis store)
- Actions внутри store, не снаружи
- Selectors выносить в отдельный файл (`selectors.ts`)
- Не подписываться на весь store — использовать точечные селекторы

```typescript
const nodes = useArchitectureStore((s) => s.nodes);
```

---

## 7. Backend (NestJS)

- Один module — один домен (AnalysisModule)
- Service содержит бизнес-логику, Controller — только маршрутизация
- DTO — отдельные классы с валидацией
- Конфигурация — в отдельных файлах, не захардкожена в сервисах

---

## 8. Стилизация

- Tailwind CSS — utility-first
- `cn()` (clsx + tailwind-merge) для условных классов
- Shadcn UI компоненты как база
- Цвета слоёв: Frontend `blue-500`, Backend `green-500`, Data `orange-500`

---

## 9. Практики, усвоенные в процессе

> Секция дополняется по ходу разработки. Каждый пункт — результат реального кейса.

_Пока пусто. Будет заполняться._
