import { useCallback } from 'react';

import type { ArchitectureGraph } from '@/shared/model/types';

import { downloadJson } from './utils';

const sanitizeFilename = (name: string) => {
    const sanitized = name.replace(/[\\/:*?"<>|]/g, '').trim();
    return sanitized || 'architecture-schema';
};

export const useSchemaExport = () => {
    const exportToFile = useCallback((schema: ArchitectureGraph) => {
        const name = sanitizeFilename(schema.meta.name);

        downloadJson(schema, `${name}.json`);
    }, []);

    return { exportToFile };
};
