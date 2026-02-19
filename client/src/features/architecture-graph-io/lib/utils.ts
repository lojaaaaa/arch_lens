import type z from 'zod';

import {
    architectureGraphSchema,
    architectureNodeSchema,
} from '../model/schema';
import type {
    ArchitectureGraphInput,
    ParseResult,
    SafeParseArchitectureGraphResult,
} from '../model/types';

const DEFAULT_FILENAME = 'architecture-schema.json';
const SUPPORTED_VERSION = 1;

const DEFAULT_IMPORTED_SCHEMA_META = {
    name: 'Импортированная схема',
    version: SUPPORTED_VERSION,
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

const detectDefaultedFields = (rawNodes: unknown[]): string[] => {
    const warnings: string[] = [];

    for (const [index, rawNode] of rawNodes.entries()) {
        if (typeof rawNode !== 'object' || rawNode === null) {
            continue;
        }
        const node = rawNode as Record<string, unknown>;

        const result = architectureNodeSchema.safeParse(node);
        if (!result.success) {
            continue;
        }

        const parsed = result.data as Record<string, unknown>;
        const defaultedKeys: string[] = [];

        for (const key of Object.keys(parsed)) {
            if (key === 'id' || key === 'kind' || key === 'position') {
                continue;
            }
            if (!(key in node)) {
                defaultedKeys.push(key);
            }
        }

        if (defaultedKeys.length > 0) {
            const kindLabel = node.kind ?? '?';
            warnings.push(
                `Узел #${index + 1} (${kindLabel}): заполнены значениями по умолчанию — ${defaultedKeys.join(', ')}`,
            );
        }
    }

    return warnings;
};

export const parseGraphFromJson = (raw: unknown): ParseResult => {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
        return {
            success: false,
            error: 'Файл должен содержать JSON-объект с полями meta, nodes и edges',
        };
    }

    const rawObj = raw as Record<string, unknown>;
    const warnings: string[] = [];

    const versionFromMeta =
        rawObj.meta &&
        typeof rawObj.meta === 'object' &&
        'version' in (rawObj.meta as Record<string, unknown>)
            ? (rawObj.meta as Record<string, unknown>).version
            : null;
    const versionAtRoot =
        'version' in rawObj
            ? (rawObj as Record<string, unknown>).version
            : null;
    const version =
        typeof versionFromMeta === 'number'
            ? versionFromMeta
            : typeof versionAtRoot === 'number'
              ? versionAtRoot
              : null;

    if (version !== null && version !== SUPPORTED_VERSION) {
        warnings.push(
            `Версия формата (${version}) отличается от поддерживаемой (${SUPPORTED_VERSION}). Возможны проблемы совместимости.`,
        );
    }

    if (Array.isArray(rawObj.nodes)) {
        warnings.push(...detectDefaultedFields(rawObj.nodes));
    }

    const parsed = safeParseArchitectureGraph(raw);

    if (!parsed.success) {
        const messages = formatZodErrors(parsed.error);
        return { success: false, error: `Ошибки валидации:\n${messages}` };
    }

    const { nodes, edges } = parsed.data;
    const validEdges = filterEdgesWithExistingNodes(nodes, edges);

    if (validEdges.length < edges.length) {
        const removedCount = edges.length - validEdges.length;
        warnings.push(
            `Удалено ${removedCount} связей, ссылающихся на несуществующие узлы`,
        );
    }

    const allowedKeys = new Set(['meta', 'nodes', 'edges']);
    const unknownKeys = Object.keys(rawObj).filter(
        (key) => !allowedKeys.has(key),
    );
    if (unknownKeys.length > 0) {
        warnings.push(
            `Неизвестные поля в корне (проигнорированы): ${unknownKeys.join(', ')}`,
        );
    }

    const graph: ArchitectureGraphInput = {
        meta: parsed.data.meta ?? DEFAULT_IMPORTED_SCHEMA_META,
        nodes,
        edges: validEdges,
    };

    return {
        success: true,
        data: graph,
        warnings: warnings.length > 0 ? warnings : undefined,
    };
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

type ZodIssue = {
    path: readonly PropertyKey[];
    message: string;
    code?: string;
    expected?: string;
    received?: string;
};

export const formatZodErrors = (error: z.ZodError): string =>
    error.issues
        .map((issue: ZodIssue) => {
            const path =
                issue.path.length > 0 ? issue.path.join('.') : '(корень)';
            let detail = issue.message;
            if (issue.code === 'invalid_enum_value' && issue.received) {
                detail = `получено "${issue.received}", ожидается один из допустимых значений`;
            } else if (
                issue.code === 'invalid_type' &&
                issue.expected &&
                issue.received
            ) {
                detail = `ожидается ${issue.expected}, получено ${issue.received}`;
            } else if (issue.code === 'invalid_literal' && issue.received) {
                detail = `неверное значение "${issue.received}"`;
            }
            return `• ${path}: ${detail}`;
        })
        .join('\n');
