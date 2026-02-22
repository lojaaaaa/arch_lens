import { toast } from 'sonner';

import {
    type ArchitectureGraphInput,
    useSchemaImport,
} from '@/features/architecture-graph-io';

import { architectureGraphToFlow } from '../../lib/utils';
import { useArchitectureActions } from '../../model/selectors';

export const useHeaderFileImport = () => {
    const { setNodes, setEdges } = useArchitectureActions();

    const handleImportSuccess = (schema: ArchitectureGraphInput) => {
        const { nodes: flowNodes, edges: flowEdges } =
            architectureGraphToFlow(schema);
        setNodes(flowNodes);
        setEdges(flowEdges);
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
