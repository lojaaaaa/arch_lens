import { useEditorPersistence } from '../../lib/use-editor-persistence';

export const HeaderTitle = () => {
    const { isDirty } = useEditorPersistence();

    return (
        <div className="font-medium">
            Редактор{isDirty ? ' • Не сохранено' : ''}
        </div>
    );
};
