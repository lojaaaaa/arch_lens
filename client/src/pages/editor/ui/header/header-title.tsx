import { useEditorPersistence } from '../../lib/use-editor-persistence';

export const HeaderTitle = () => {
    const { isDirty } = useEditorPersistence();

    if (!isDirty) {
        return null;
    }

    return <div className="text-muted-foreground text-sm">Не сохранено</div>;
};
