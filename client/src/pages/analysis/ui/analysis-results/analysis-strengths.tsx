import { CheckCircle2 } from 'lucide-react';

import {
    hasDisconnectedLayersIssue,
    hasFrontendDbIssue,
    hasGatewayIssue,
    hasOrphansIssue,
} from '@/shared/lib/issue-helpers';
import type { AnalysisResult } from '@/shared/model/types';

type AnalysisStrengthsProps = {
    result: AnalysisResult;
};

function getStrengths(result: AnalysisResult): string[] {
    const { summary, metrics, issues } = result;
    const strengths: string[] = [];

    if (summary.score < 60) {
        return strengths;
    }

    if ((metrics.cycleCount ?? 0) === 0) {
        strengths.push('Циклов: 0');
    }

    if (!hasGatewayIssue(issues)) {
        strengths.push('Gateway присутствует');
    }

    if (!hasFrontendDbIssue(issues)) {
        strengths.push('Нет frontend→DB');
    }

    if (!hasOrphansIssue(issues)) {
        strengths.push('Нет изолированных узлов');
    }

    if (!hasDisconnectedLayersIssue(issues)) {
        strengths.push('Все слои связаны');
    }

    if ((metrics.depth ?? 0) <= 5 && (metrics.depth ?? 0) > 0) {
        strengths.push(`Depth в норме (${metrics.depth})`);
    }

    if ((metrics.maxFanOut ?? 0) <= 3 && (metrics.maxFanOut ?? 0) > 0) {
        strengths.push(`Fan-out в норме (max ${metrics.maxFanOut})`);
    }

    return strengths;
}

export const AnalysisStrengths = ({ result }: AnalysisStrengthsProps) => {
    const strengths = getStrengths(result);

    if (strengths.length === 0) {
        return null;
    }

    return (
        <section className="rounded-lg border border-green-200 bg-green-50/30 p-4 dark:border-green-800 dark:bg-green-950/30">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                <CheckCircle2 className="size-4" />
                Сильные стороны
            </h3>
            <ul className="flex flex-wrap gap-2">
                {strengths.map((strength) => (
                    <li
                        key={strength}
                        className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/50 dark:text-green-300"
                    >
                        <CheckCircle2 className="size-3 opacity-70" />
                        {strength}
                    </li>
                ))}
            </ul>
        </section>
    );
};
