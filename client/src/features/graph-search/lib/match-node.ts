import type { NodeKind } from '@/shared/model/types';

export const matchNode = (
    query: string,
    nodeId: string,
    node: { kind?: NodeKind; displayName?: string },
    nodeLabels: Partial<Record<NodeKind, string>>,
): boolean => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
        return false;
    }
    const kind = node?.kind ?? '';
    const kindLabel = nodeLabels[kind as NodeKind] ?? kind;
    const displayName = (node?.displayName ?? '').toLowerCase();

    return (
        kind.toLowerCase().includes(trimmed) ||
        kindLabel.toLowerCase().includes(trimmed) ||
        displayName.includes(trimmed) ||
        nodeId.toLowerCase().includes(trimmed)
    );
};
