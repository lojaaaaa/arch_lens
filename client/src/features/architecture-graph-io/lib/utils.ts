import type z from 'zod';

import { architectureGraphSchema } from '../model/schema';
import type {
    ArchitectureGraphInput,
    ParseResult,
    SafeParseArchitectureGraphResult,
} from '../model/types';

const DEFAULT_FILENAME = 'architecture-schema.json';

const DEFAULT_IMPORTED_SCHEMA_META = {
    name: 'Импортированная схема',
    version: 1,
    createdAt: new Date().toISOString(),
} as const;

export const downloadJson = (
    data: object,
    filename = DEFAULT_FILENAME,
): void => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;

    link.click();
    URL.revokeObjectURL(url);
};

const filterEdgesWithExistingNodes = <
    T extends { source: string; target: string },
>(
    nodes: { id: string }[],
    edges: T[],
): T[] => {
    const nodeIds = new Set(nodes.map((node) => node.id));
    return edges.filter(
        (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
    );
};

export const parseGraphFromJson = (raw: unknown): ParseResult => {
    const parsed = safeParseArchitectureGraph(raw);

    if (!parsed.success) {
        const messages = formatZodErrors(parsed.error);
        return { success: false, error: `Невалидный JSON: ${messages}` };
    }

    const { nodes, edges } = parsed.data;
    const validEdges = filterEdgesWithExistingNodes(nodes, edges);

    const graph: ArchitectureGraphInput = {
        meta: parsed.data.meta ?? DEFAULT_IMPORTED_SCHEMA_META,
        nodes,
        edges: validEdges,
    };

    return { success: true, data: graph };
};

export const readFileAsJson = (file: File): Promise<unknown> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const text = reader.result as string;
                resolve(JSON.parse(text));
            } catch {
                reject(new Error('Файл не является валидным JSON'));
            }
        };
        reader.onerror = () => reject(new Error('Ошибка чтения файла'));
        reader.readAsText(file, 'UTF-8');
    });

export const safeParseArchitectureGraph = (
    raw: unknown,
): SafeParseArchitectureGraphResult => {
    const result = architectureGraphSchema.safeParse(raw);

    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, error: result.error };
};

export const formatZodErrors = (error: z.ZodError): string =>
    error.issues
        .map(
            (issue: { path: readonly PropertyKey[]; message: string }) =>
                `${issue.path.join('.')}: ${issue.message}`,
        )
        .join('; ');
