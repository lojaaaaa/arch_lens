import { XCircle } from 'lucide-react';

import {
    hasDisconnectedLayersIssue,
    hasFrontendDbIssue,
    hasGatewayIssue,
    hasOrphansIssue,
} from '@/shared/lib/issue-helpers';
import type { AnalysisResult } from '@/shared/model/types';

type AnalysisWeaknessesProps = {
    result: AnalysisResult;
};

function getWeaknesses(result: AnalysisResult): string[] {
    const { metrics, issues } = result;
    const weaknesses: string[] = [];

    if ((metrics.cycleCount ?? 0) > 0) {
        weaknesses.push(`Циклы в графе (${metrics.cycleCount})`);
    }

    if (hasGatewayIssue(issues)) {
        weaknesses.push('Отсутствует Gateway');
    }

    if (hasFrontendDbIssue(issues)) {
        weaknesses.push('Прямые связи frontend→DB');
    }

    if (hasOrphansIssue(issues)) {
        weaknesses.push('Изолированные узлы');
    }

    if (hasDisconnectedLayersIssue(issues)) {
        weaknesses.push('Отключённые слои');
    }

    if ((metrics.depth ?? 0) > 5) {
        weaknesses.push(`Высокая глубина (${metrics.depth})`);
    }

    if ((metrics.maxFanOut ?? 0) > 6) {
        weaknesses.push(`Высокий fan-out (max ${metrics.maxFanOut})`);
    }

    const sysSlo = issues.find(
        (issue) => issue.ruleId === 'SYS' && issue.title?.includes('SLO'),
    );
    if (sysSlo) {
        weaknesses.push('Critical Path превышает SLO');
    }

    const sysThroughput = issues.find(
        (issue) =>
            issue.ruleId === 'SYS' && issue.title?.includes('throughput'),
    );
    if (sysThroughput) {
        weaknesses.push('Нагрузка превышает целевой throughput');
    }

    const sysAvailability = issues.find(
        (issue) => issue.ruleId === 'SYS' && issue.title?.includes('доступн'),
    );
    if (sysAvailability) {
        weaknesses.push('Доступность ниже целевой');
    }

    const sysDeploy = issues.find(
        (issue) =>
            issue.ruleId === 'SYS' && issue.title?.includes('развёртыван'),
    );
    if (sysDeploy) {
        weaknesses.push('Несоответствие модели развёртывания');
    }

    return weaknesses;
}

export const AnalysisWeaknesses = ({ result }: AnalysisWeaknessesProps) => {
    const weaknesses = getWeaknesses(result);

    if (weaknesses.length === 0) {
        return null;
    }

    return (
        <section className="rounded-lg border border-red-200 bg-red-50/30 p-4 dark:border-red-900/50 dark:bg-red-950/30">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-400">
                <XCircle className="size-4" />
                Слабые стороны
            </h3>
            <ul className="flex flex-wrap gap-2">
                {weaknesses.map((weakness) => (
                    <li
                        key={weakness}
                        className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800 dark:bg-red-900/50 dark:text-red-300"
                    >
                        <XCircle className="size-3 opacity-70" />
                        {weakness}
                    </li>
                ))}
            </ul>
        </section>
    );
};
