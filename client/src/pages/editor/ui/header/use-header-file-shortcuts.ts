import { useEffect } from 'react';

import { isEditableTarget } from '@/shared/lib/utils';

type HeaderFileShortcutsParams = {
    onImport: () => void;
    onSave: () => void;
    onExportJson: () => void;
};

export const useHeaderFileShortcuts = ({
    onImport,
    onSave,
    onExportJson,
}: HeaderFileShortcutsParams) => {
    useEffect(() => {
        const onKeyDown = (keyboardEvent: KeyboardEvent) => {
            if (isEditableTarget(keyboardEvent.target)) {
                return;
            }

            const metaOrCtrl = keyboardEvent.metaKey || keyboardEvent.ctrlKey;
            if (!metaOrCtrl) {
                return;
            }

            if (keyboardEvent.code === 'KeyO') {
                keyboardEvent.preventDefault();
                onImport();
                return;
            }

            if (keyboardEvent.code === 'KeyS') {
                keyboardEvent.preventDefault();
                if (keyboardEvent.shiftKey) {
                    onExportJson();
                } else {
                    onSave();
                }
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onImport, onExportJson, onSave]);
};
