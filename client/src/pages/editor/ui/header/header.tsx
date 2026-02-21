import { useCallback, useEffect, useState } from 'react';
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
    MenubarCheckboxItem,
    MenubarContent,
    MenubarGroup,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarTrigger,
} from '@/shared/ui/menubar';
import { SidebarTrigger } from '@/shared/ui/sidebar';
import { ThemeToggle } from '@/shared/ui/theme-toggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

import { useAnalysisStore } from '../../../analysis/model/store';
import { exportCanvasToPng, exportCanvasToSvg } from '../../lib/export-image';
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
    const [transparentExport, setTransparentExport] = useState(false);

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

    const handleExportPng = useCallback(async () => {
        if (nodes.length === 0 && edges.length === 0) {
            return;
        }
        try {
            await exportCanvasToPng({ transparent: transparentExport });
            toast.success('PNG экспортирован');
        } catch {
            toast.error('Не удалось экспортировать PNG');
        }
    }, [nodes.length, edges.length, transparentExport]);

    const handleExportSvg = useCallback(async () => {
        if (nodes.length === 0 && edges.length === 0) {
            return;
        }
        try {
            await exportCanvasToSvg({ transparent: transparentExport });
            toast.success('SVG экспортирован');
        } catch {
            toast.error('Не удалось экспортировать SVG');
        }
    }, [nodes.length, edges.length, transparentExport]);

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
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <MenubarItem onClick={handleSave}>
                                        Сохранить{' '}
                                        <MenubarShortcut>⌘S</MenubarShortcut>
                                    </MenubarItem>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="right"
                                    className="max-w-60"
                                >
                                    Сохраняет схему локально. Например, перед
                                    анализом.
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <MenubarItem
                                        onClick={handleRestore}
                                        disabled={!hasStoredFlow}
                                    >
                                        Восстановить
                                    </MenubarItem>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="right"
                                    className="max-w-60"
                                >
                                    Восстанавливает последнюю сохраненную схему.
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <MenubarItem
                                        onClick={reset}
                                        disabled={!hasStoredFlow}
                                    >
                                        Сбросить сохранение
                                    </MenubarItem>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="right"
                                    className="max-w-60"
                                >
                                    Удаляет сохраненную копию. Например, чтобы
                                    начать с нуля.
                                </TooltipContent>
                            </Tooltip>
                        </MenubarGroup>
                        <MenubarGroup>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <MenubarItem onClick={handleImportClick}>
                                        Импорт из JSON{' '}
                                        <MenubarShortcut>⌘O</MenubarShortcut>
                                    </MenubarItem>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="right"
                                    className="max-w-60"
                                >
                                    Загружает схему из файла .json.
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <MenubarItem
                                        onClick={handleExport}
                                        disabled={
                                            nodes.length === 0 &&
                                            edges.length === 0
                                        }
                                    >
                                        Экспорт в JSON{' '}
                                        <MenubarShortcut>⇧⌘S</MenubarShortcut>
                                    </MenubarItem>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="right"
                                    className="max-w-60"
                                >
                                    Сохраняет схему в .json для обмена.
                                </TooltipContent>
                            </Tooltip>
                        </MenubarGroup>
                        <MenubarSeparator />
                        <MenubarGroup>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <MenubarCheckboxItem
                                        checked={transparentExport}
                                        onCheckedChange={(value) =>
                                            setTransparentExport(Boolean(value))
                                        }
                                    >
                                        Прозрачный фон
                                    </MenubarCheckboxItem>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="right"
                                    className="max-w-60"
                                >
                                    Если включено — экспорт без фона.
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <MenubarItem
                                        onClick={handleExportPng}
                                        disabled={
                                            nodes.length === 0 &&
                                            edges.length === 0
                                        }
                                    >
                                        Экспорт PNG
                                    </MenubarItem>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="right"
                                    className="max-w-60"
                                >
                                    Сохраняет текущее изображение в .png.
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <MenubarItem
                                        onClick={handleExportSvg}
                                        disabled={
                                            nodes.length === 0 &&
                                            edges.length === 0
                                        }
                                    >
                                        Экспорт SVG
                                    </MenubarItem>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="right"
                                    className="max-w-60"
                                >
                                    Сохраняет векторное изображение в .svg.
                                </TooltipContent>
                            </Tooltip>
                        </MenubarGroup>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
            <div className="font-medium">
                Редактор{isDirty ? ' • Не сохранено' : ''}
            </div>
            <div className="ml-auto flex items-center gap-1">
                <ThemeToggle />
                <Tooltip>
                    <TooltipTrigger asChild>
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
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-60">
                        Запускает анализ схемы. Например, проверка проблем.
                    </TooltipContent>
                </Tooltip>
            </div>
        </header>
    );
};
