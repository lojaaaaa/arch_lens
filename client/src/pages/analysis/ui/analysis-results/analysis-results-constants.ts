import type { Grade, IssueCategory, IssueSeverity } from '@/shared/model/types';

export type MetricLevel = 'good' | 'moderate' | 'bad' | 'neutral';

export const GRADE_STYLES: Record<Grade, string> = {
    A: 'text-green-600 border-green-200 bg-green-50/50 dark:text-green-400 dark:border-green-700 dark:bg-green-950/40',
    B: 'text-green-600 border-green-200 bg-green-50/50 dark:text-green-400 dark:border-green-700 dark:bg-green-950/40',
    C: 'text-amber-600 border-amber-200 bg-amber-50/50 dark:text-amber-400 dark:border-amber-700 dark:bg-amber-950/40',
    D: 'text-red-500 border-red-200 bg-red-50/50 dark:text-red-400 dark:border-red-700 dark:bg-red-950/40',
    F: 'text-red-600 border-red-300 bg-red-50/50 dark:text-red-400 dark:border-red-800 dark:bg-red-950/40',
};

export const SCORE_COLOR = (score: number) => {
    if (score >= 75) {
        return 'text-green-600 dark:text-green-400';
    }
    if (score >= 40) {
        return 'text-amber-600 dark:text-amber-400';
    }
    return 'text-red-600 dark:text-red-400';
};

export const SEVERITY_ORDER: Record<IssueSeverity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
};

export const SEVERITY_STYLES: Record<IssueSeverity, string> = {
    info: [
        'border-l-blue-400',
        'bg-blue-50/30',
        'dark:border-l-blue-500',
        'dark:bg-blue-950/30',
    ].join(' '),
    warning: [
        'border-l-amber-400',
        'bg-amber-50/30',
        'dark:border-l-amber-500',
        'dark:bg-amber-950/30',
    ].join(' '),
    critical: [
        'border-l-red-400',
        'bg-red-50/30',
        'dark:border-l-red-500',
        'dark:bg-red-950/30',
    ].join(' '),
};

export const SEVERITY_BADGE: Record<IssueSeverity, string> = {
    info: [
        'bg-blue-100',
        'text-blue-700',
        'dark:bg-blue-900/50',
        'dark:text-blue-300',
    ].join(' '),
    warning: [
        'bg-amber-100',
        'text-amber-700',
        'dark:bg-amber-900/50',
        'dark:text-amber-300',
    ].join(' '),
    critical: [
        'bg-red-100',
        'text-red-700',
        'dark:bg-red-900/50',
        'dark:text-red-300',
    ].join(' '),
};

export const SEVERITY_LABELS: Record<IssueSeverity, string> = {
    info: 'Инфо',
    warning: 'Внимание',
    critical: 'Критично',
};

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
    performance: 'Производительность',
    scalability: 'Масштабируемость',
    maintainability: 'Поддерживаемость',
    architecture: 'Архитектура',
    reliability: 'Надёжность',
    security: 'Безопасность',
};

export const ALL_SEVERITIES: IssueSeverity[] = ['critical', 'warning', 'info'];
export const ALL_CATEGORIES: IssueCategory[] = [
    'architecture',
    'performance',
    'scalability',
    'maintainability',
    'reliability',
    'security',
];

export const LEVEL_STYLES: Record<MetricLevel, string> = {
    good: [
        'text-green-600',
        'bg-green-50/50',
        'dark:text-green-400',
        'dark:bg-green-950/40',
    ].join(' '),
    moderate: [
        'text-amber-600',
        'bg-amber-50/50',
        'dark:text-amber-400',
        'dark:bg-amber-950/40',
    ].join(' '),
    bad: [
        'text-red-600',
        'bg-red-50/50',
        'dark:text-red-400',
        'dark:bg-red-950/40',
    ].join(' '),
    neutral: ['text-foreground', 'bg-muted/30', 'dark:bg-muted/50'].join(' '),
};

export const LEVEL_DOT: Record<MetricLevel, string> = {
    good: 'bg-green-500 dark:bg-green-400',
    moderate: 'bg-amber-500 dark:bg-amber-400',
    bad: 'bg-red-500 dark:bg-red-400',
    neutral: 'bg-muted-foreground dark:bg-foreground/80',
};

export const loadLevel = (
    value: number,
    moderate = 50,
    bad = 100,
): MetricLevel => {
    if (value < moderate) {
        return 'good';
    }
    if (value < bad) {
        return 'moderate';
    }
    return 'bad';
};

export const complexityLevel = (value: number): MetricLevel => {
    if (value < 3) {
        return 'good';
    }
    if (value < 6) {
        return 'moderate';
    }
    return 'bad';
};
