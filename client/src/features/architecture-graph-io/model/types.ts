import type z from 'zod';

import type { architectureGraphSchema } from './schema';

export type ArchitectureGraphInput = z.infer<typeof architectureGraphSchema>;

export type SafeParseArchitectureGraphResult =
    | { success: true; data: ArchitectureGraphInput }
    | { success: false; error: z.ZodError };

export type ParseResult =
    | { success: true; data: ArchitectureGraphInput; warnings?: string[] }
    | { success: false; error: string };

export type UseSchemaImportOptions = {
    onSuccess: (schema: ArchitectureGraphInput) => void;
    onError?: (message: string) => void;
    onWarnings?: (warnings: string[]) => void;
};
