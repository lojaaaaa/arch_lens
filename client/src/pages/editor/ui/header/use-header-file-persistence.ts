import { toast } from 'sonner';

import { useEditorPersistence } from '../../lib/use-editor-persistence';

export const useHeaderFilePersistence = () => {
    const { save, restore, reset, hasStoredFlow } = useEditorPersistence();

    const handleSave = () => {
        save();
        toast.success('Схема сохранена');
    };

    const handleRestore = () => {
        restore();
    };

    return {
        handleSave,
        handleRestore,
        resetStoredFlow: reset,
        hasStoredFlow,
    };
};
