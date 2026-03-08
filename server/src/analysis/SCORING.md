# Формула оценки (Score/Grade)

## Формула

```
score = clamp(0, 100, 100 - penalty + bonus)
grade = A | B | C | D | F (по порогам)
```

## Штрафы (penalty)

| Severity | Штраф |
|----------|-------|
| info     | 2     |
| warning  | 10    |
| critical | 28    |

Серьёзные ошибки (critical) влияют на оценку сильнее.  
Суммарный штраф = Σ штрафа по каждому issue.

## Бонусы (bonus)

| Условие            | Бонус |
|--------------------|-------|
| Есть cache-узлы    | +3    |
| Есть api_gateway   | +3    |
| Нет циклов (S02)   | +5    |
| Нет orphans (S01) и disconnected layers (S08) | +3 |

## Пороги Grade

| Grade | Score |
|-------|-------|
| A     | ≥ 90  |
| B     | ≥ 75  |
| C     | ≥ 60  |
| D     | ≥ 40  |
| F     | < 40  |

## Примеры

- Чистый граф с bonus: score 100, grade A
- 1 critical: penalty 28 → score 72, grade C
- 3 critical: penalty 84 → score 16, grade F
- 2 warning: penalty 20 → score 80, grade B
