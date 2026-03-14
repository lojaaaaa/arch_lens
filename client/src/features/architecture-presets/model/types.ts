import type { ArchitectureNode, GraphEdge } from '@/shared/model/types';

export type ArchitecturePresetId =
    | 'crud'
    | 'microservices'
    | 'event-driven'
    | 'layered'
    | 'message-queue'
    | 'anti-pattern';

export type ArchitecturePreset = {
    id: ArchitecturePresetId;
    label: string;
    description: string;
    build: () => { nodes: ArchitectureNode[]; edges: GraphEdge[] };
};
