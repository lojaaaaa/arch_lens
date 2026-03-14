import type { ArchitectureIssue } from '@/shared/model/types';

export function hasGatewayIssue(issues: ArchitectureIssue[]): boolean {
    return issues.some(
        (issue) =>
            issue.ruleId === 'S07' ||
            issue.title.includes('Отсутствует API Gateway'),
    );
}

export function hasFrontendDbIssue(issues: ArchitectureIssue[]): boolean {
    return issues.some(
        (issue) =>
            issue.ruleId === 'S06' ||
            (issue.title.toLowerCase().includes('фронтенд') &&
                issue.title.toLowerCase().includes('бд')),
    );
}

export function hasOrphansIssue(issues: ArchitectureIssue[]): boolean {
    return issues.some(
        (issue) =>
            issue.ruleId === 'S01' ||
            issue.title.includes('изолированные узлы'),
    );
}

export function hasDisconnectedLayersIssue(
    issues: ArchitectureIssue[],
): boolean {
    return issues.some(
        (issue) =>
            issue.ruleId === 'S08' || issue.title.includes('Отключённый слой'),
    );
}
