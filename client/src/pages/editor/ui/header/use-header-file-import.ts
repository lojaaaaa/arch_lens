import { toast } from 'sonner';

import {
    type ArchitectureGraphInput,
    useSchemaImport,
} from '@/features/architecture-graph-io';

import {
    architectureGraphToFlow,
    filterInvalidEdgesOnImport,
} from '../../lib/utils';
import { useArchitectureActions } from '../../model/selectors';

export const useHeaderFileImport = () => {
    const { setNodes, setEdges } = useArchitectureActions();

    const handleImportSuccess = (schema: ArchitectureGraphInput) => {
        const { schema: filteredSchema, invalidWarnings } =
            filterInvalidEdgesOnImport(schema);

        const { nodes: flowNodes, edges: flowEdges } =
            architectureGraphToFlow(filteredSchema);
        setNodes(flowNodes);
        setEdges(flowEdges);

        if (invalidWarnings.length > 0) {
            const unique = [...new Set(invalidWarnings)];
            toast.warning(
                `Удалено недопустимых связей (${invalidWarnings.length}): ${unique.join('; ')}`,
            );
        }
    };

    const { fileInputRef, handleFileChange, triggerFileSelect } =
        useSchemaImport({
            onSuccess: (schema) => {
                handleImportSuccess(schema);
                toast.success('Схема импортирована');
            },
            onError: (message) => toast.error(message),
            onWarnings: (warnings) =>
                toast.warning(
                    `Импорт с предупреждениями: ${warnings.join('; ')}`,
                ),
        });

    const handleImportClick = () => {
        triggerFileSelect();
    };

    return {
        fileInputRef,
        handleFileChange,
        handleImportClick,
    };
};
