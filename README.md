# ArchLens

Система формирования рекомендаций на основе анализа графической нотации архитектуры. Позволяет проектировать системный дизайн в визуальном редакторе и получать детальный отчёт с замечаниями, метриками и оценкой.

## Описание

ArchLens — редактор архитектурных схем с тремя слоями (Frontend, Backend, Data) и возможностью анализа. Пользователь создаёт граф из узлов и связей, настраивает параметры, запускает анализ и получает:

- Оценку (grade A–F) и score (0–100)
- Список замечаний с severity (info, warning, critical)
- Метрики: сложность, нагрузка, критичные узлы
- Навигацию к проблемным нодам в редакторе

## Стек

| Часть   | Технологии                                                    |
|---------|----------------------------------------------------------------|
| Frontend| React 19, TypeScript, Vite, React Flow (@xyflow/react), Zustand, Tailwind CSS, Shadcn UI |
| Backend | NestJS, TypeScript                                             |
| Валидация | Zod, class-validator                                          |

## Быстрый старт

### Требования

- Node.js 18+
- npm

### Установка и запуск

```bash
# Установка зависимостей
cd client && npm install
cd ../server && npm install

# Запуск backend (порт 3000)
cd server && npm run start:dev

# Запуск frontend (порт 5173)
cd client && npm run dev
```

Откройте http://localhost:5173

### Переменные окружения

**client/.env**
```
VITE_API_URL=http://localhost:3000
```

**server** — опционально:
- `PORT` — порт сервера (по умолчанию 3000)
- `CORS_ORIGIN` — разрешённые origins через запятую

## Структура проекта

```
diplom/
├── client/                 # React SPA
│   ├── src/
│   │   ├── app/            # Роутинг, провайдеры
│   │   ├── features/       # architecture-graph-io (импорт/экспорт)
│   │   ├── pages/          # editor, analysis
│   │   └── shared/         # api, model, ui, lib
│   └── package.json
├── server/                 # NestJS API
│   ├── src/
│   │   └── analysis/       # анализ схем, правила, DTO
│   └── package.json
├── e2e/                    # E2E-тесты (Playwright)
│   ├── fixtures/           # JSON-фикстуры для импорта
│   └── e2e-flow.spec.ts    # Сценарий полного цикла
├── tasks.json              # Задачи разработки
├── report.txt              # Отчёт о разработке
└── code_style.md           # Стиль кода и принципы
```

## API

### POST /api/analysis

Анализ архитектурного графа. Тело запроса — JSON в формате `ArchitectureGraph` (meta, nodes, edges).

Ответ: `AnalysisResult` (summary, metrics, issues).

## E2E-тесты

```bash
# Убедитесь, что backend запущен (порт 3000)
cd server && npm run start:dev

# В другом терминале — E2E
npm run test:e2e
```

Playwright запускает frontend на 5173 (или использует существующий dev-сервер).

## Сборка

```bash
# Frontend
cd client && npm run build

# Backend
cd server && npm run build
```

## Лицензия

UNLICENSED (дипломный проект)
