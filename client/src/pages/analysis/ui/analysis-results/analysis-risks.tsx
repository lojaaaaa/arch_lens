import { ShieldAlert } from 'lucide-react';

import type { ArchitectureIssue } from '@/shared/model/types';

const RISK_GROUPS: {
    key: string;
    label: string;
    match: (issue: ArchitectureIssue) => boolean;
    checkPrompt: string;
}[] = [
    {
        key: 'spof',
        label: 'SPOF (Single Point of Failure)',
        match: (issue) => issue.ruleId === 'S09' || issue.ruleId === 'S04',
        checkPrompt:
            'Проверьте: есть ли репликация, health checks, circuit breaker?',
    },
    {
        key: 'bottleneck',
        label: 'Узкие места (Bottleneck)',
        match: (issue) =>
            issue.ruleId === 'L08' ||
            issue.ruleId === 'L03' ||
            (issue.ruleId === 'SYS' && issue.title?.includes('throughput')),
        checkPrompt:
            'Проверьте: capacity vs load, распределение нагрузки, масштабирование.',
    },
    {
        key: 'external',
        label: 'Внешние зависимости',
        match: (issue) =>
            issue.ruleId === 'L05' ||
            (issue.ruleId === 'SYS' && issue.title?.includes('доступн')),
        checkPrompt: 'Проверьте: SLA внешних систем, fallback, таймауты.',
    },
    {
        key: 'depth-latency',
        label: 'Глубина / Latency',
        match: (issue) =>
            issue.ruleId === 'S11' ||
            issue.ruleId === 'L07' ||
            issue.ruleId === 'L06' ||
            (issue.ruleId === 'SYS' && issue.title?.includes('SLO')),
        checkPrompt:
            'Проверьте: длину цепочки вызовов, кэширование, асинхронные этапы.',
    },
];

function getIssuesForRiskGroup(
    issues: ArchitectureIssue[],
    match: (issue: ArchitectureIssue) => boolean,
): ArchitectureIssue[] {
    return issues.filter(match);
}

type AnalysisRisksProps = {
    issues: ArchitectureIssue[];
};

/**
 * Секция «Риски» (V2-D4).
 * Агрегация: SPOF, bottleneck, external, depth/latency.
 * Краткое описание + «что проверить».
 */
export const AnalysisRisks = ({ issues }: AnalysisRisksProps) => {
    const groupsWithIssues = RISK_GROUPS.map((group) => ({
        ...group,
        items: getIssuesForRiskGroup(issues, group.match),
    })).filter((groupWithItems) => groupWithItems.items.length > 0);

    if (groupsWithIssues.length === 0) {
        return null;
    }

    return (
        <section className="rounded-lg border bg-card p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                <ShieldAlert className="size-4" />
                Риски
            </h2>
            <ul className="space-y-4">
                {groupsWithIssues.map((group) => (
                    <li key={group.key} className="space-y-1.5">
                        <div className="flex items-baseline gap-2">
                            <span className="font-medium text-sm">
                                {group.label}
                            </span>
                            <span className="text-muted-foreground text-xs">
                                {group.items.length}{' '}
                                {group.items.length === 1
                                    ? 'замечание'
                                    : group.items.length < 5
                                      ? 'замечания'
                                      : 'замечаний'}
                            </span>
                        </div>
                        <p className="text-muted-foreground text-xs">
                            {group.checkPrompt}
                        </p>
                        <ul className="ml-2 list-disc space-y-0.5 text-xs">
                            {group.items.slice(0, 3).map((issue) => (
                                <li key={issue.id}>{issue.title}</li>
                            ))}
                            {group.items.length > 3 && (
                                <li className="text-muted-foreground">
                                    +{group.items.length - 3} ещё
                                </li>
                            )}
                        </ul>
                    </li>
                ))}
            </ul>
        </section>
    );
};
