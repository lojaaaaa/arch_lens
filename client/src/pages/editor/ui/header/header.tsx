import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import type { ArchitectureGraphInput } from '@/features/architecture-graph-io';
import {
    useSchemaExport,
    useSchemaImport,
} from '@/features/architecture-graph-io';
import { Routes } from '@/shared/model/routes';
import { Button } from '@/shared/ui/button';
import {
    Menubar,
    MenubarContent,
    MenubarGroup,
    MenubarItem,
    MenubarMenu,
    MenubarShortcut,
    MenubarTrigger,
} from '@/shared/ui/menubar';
import { SidebarTrigger } from '@/shared/ui/sidebar';
import { ThemeToggle } from '@/shared/ui/theme-toggle';

import { useAnalysisStore } from '../../../analysis/model/store';
import { useEditorPersistence } from '../../lib/use-editor-persistence';
import { architectureGraphToFlow, buildExportableGraph } from '../../lib/utils';
import {
    useArchitectureActions,
    useArchitectureSelectors,
} from '../../model/selectors';

export const Header = () => {
    const navigate = useNavigate();

    const { nodes, edges } = useArchitectureSelectors();

    const { setNodes, setEdges } = useArchitectureActions();

    const handleImportSuccess = useCallback(
        (schema: ArchitectureGraphInput) => {
            const { nodes: flowNodes, edges: flowEdges } =
                architectureGraphToFlow(schema);
            setNodes(flowNodes);
            setEdges(flowEdges);
        },
        [setNodes, setEdges],
    );

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

    const { exportToFile } = useSchemaExport();

    const setGraphToAnalyze = useAnalysisStore(
        (state) => state.setGraphToAnalyze,
    );
    const analysisStatus = useAnalysisStore((state) => state.analysisStatus);
    const isAnalyzing = analysisStatus === 'loading';

    const { save, restore, reset, isDirty, hasStoredFlow } =
        useEditorPersistence();

    const handleAnalysisClick = useCallback(() => {
        if (nodes.length === 0 && edges.length === 0) {
            return;
        }
        save();
        const graph = buildExportableGraph(nodes, edges);
        setGraphToAnalyze(graph);
        navigate(Routes.analysis);
    }, [nodes, edges, navigate, save, setGraphToAnalyze]);

    const handleExport = useCallback(() => {
        if (nodes.length === 0 && edges.length === 0) {
            return;
        }
        const graph = buildExportableGraph(nodes, edges);
        exportToFile(graph);
        toast.success('Файл экспортирован');
    }, [nodes, edges, exportToFile]);

    const handleImportClick = useCallback(() => {
        triggerFileSelect();
    }, [triggerFileSelect]);

    const handleSave = useCallback(() => {
        save();
        toast.success('Схема сохранена');
    }, [save]);

    const handleRestore = useCallback(() => {
        restore();
    }, [restore]);

    useEffect(() => {
        const onKeyDown = (keyboardEvent: KeyboardEvent) => {
            if (!keyboardEvent.metaKey && !keyboardEvent.ctrlKey) {
                return;
            }
            if (keyboardEvent.key === 'o') {
                keyboardEvent.preventDefault();
                handleImportClick();
            } else if (keyboardEvent.key === 's') {
                keyboardEvent.preventDefault();
                if (keyboardEvent.shiftKey) {
                    handleExport();
                } else {
                    handleSave();
                }
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [handleImportClick, handleExport, handleSave]);

    return (
        <header className="flex h-12 items-center gap-2 px-2">
            <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                data-testid="import-file-input"
                onChange={handleFileChange}
            />
            <SidebarTrigger />
            <Menubar>
                <MenubarMenu>
                    <MenubarTrigger>Файл</MenubarTrigger>
                    <MenubarContent>
                        <MenubarGroup>
                            <MenubarItem onClick={handleSave}>
                                Сохранить <MenubarShortcut>⌘S</MenubarShortcut>
                            </MenubarItem>
                            <MenubarItem
                                onClick={handleRestore}
                                disabled={!hasStoredFlow}
                            >
                                Восстановить
                            </MenubarItem>
                            <MenubarItem
                                onClick={reset}
                                disabled={!hasStoredFlow}
                            >
                                Сбросить сохранение
                            </MenubarItem>
                        </MenubarGroup>
                        <MenubarGroup>
                            <MenubarItem onClick={handleImportClick}>
                                Импорт из JSON{' '}
                                <MenubarShortcut>⌘O</MenubarShortcut>
                            </MenubarItem>
                            <MenubarItem
                                onClick={handleExport}
                                disabled={
                                    nodes.length === 0 && edges.length === 0
                                }
                            >
                                Экспорт в JSON{' '}
                                <MenubarShortcut>⇧⌘S</MenubarShortcut>
                            </MenubarItem>
                        </MenubarGroup>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
            <div className="font-medium">
                Редактор{isDirty ? ' • Не сохранено' : ''}
            </div>
            <div className="ml-auto flex items-center gap-1">
                <ThemeToggle />
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleAnalysisClick}
                    disabled={
                        isAnalyzing ||
                        (nodes.length === 0 && edges.length === 0)
                    }
                >
                    {isAnalyzing && (
                        <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    )}
                    Анализ
                </Button>
            </div>
        </header>
    );
};
