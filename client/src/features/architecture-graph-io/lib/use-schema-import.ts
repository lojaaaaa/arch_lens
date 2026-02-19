import type { ChangeEvent } from 'react';
import { useCallback, useRef, useState } from 'react';

import { handleError } from '@/shared/lib/utils';
import type { TypeOrNull } from '@/shared/model/types';

import { parseGraphFromJson, readFileAsJson } from './utils';
import type { UseSchemaImportOptions } from '../model/types';

export const useSchemaImport = (options: UseSchemaImportOptions) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState<TypeOrNull<string>>(null);

    const { onSuccess, onError } = options;

    const triggerFileSelect = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(
        async (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            event.target.value = '';

            if (!file) {
                return;
            }

            setIsImporting(true);
            setError(null);

            try {
                const raw = await readFileAsJson(file);
                const parseResult = parseGraphFromJson(raw);

                if (parseResult.success) {
                    onSuccess(parseResult.data);
                } else {
                    const message = parseResult.error;
                    setError(message);
                    onError?.(message);
                }
            } catch (caughtError) {
                const errorMessage = handleError(
                    caughtError,
                    'Ошибка при импорте',
                );

                setError(errorMessage);
                onError?.(errorMessage);
            } finally {
                setIsImporting(false);
            }
        },
        [onSuccess, onError],
    );

    return {
        fileInputRef,
        handleFileChange,
        triggerFileSelect,
        isImporting,
        error,
        clearError: useCallback(() => setError(null), []),
    };
};
