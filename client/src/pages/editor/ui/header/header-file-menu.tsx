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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

import { useHeaderFileExport } from './use-header-file-export';
import { useHeaderFileImport } from './use-header-file-import';
import { useHeaderFilePersistence } from './use-header-file-persistence';
import { useHeaderFileShortcuts } from './use-header-file-shortcuts';

export const HeaderFileMenu = () => {
    const { fileInputRef, handleFileChange, handleImportClick } =
        useHeaderFileImport();

    const {
        handleExportJson,
        handleExportPng,
        handleExportSvg,
        hasGraph,
        transparentExport,
        setTransparentExport,
    } = useHeaderFileExport();

    const { handleSave, handleRestore, resetStoredFlow, hasStoredFlow } =
        useHeaderFilePersistence();

    useHeaderFileShortcuts({
        onImport: handleImportClick,
        onSave: handleSave,
        onExportJson: handleExportJson,
    });

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                data-testid="import-file-input"
                onChange={handleFileChange}
            />
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
                                        onClick={resetStoredFlow}
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
                                        onClick={handleExportJson}
                                        disabled={!hasGraph}
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
                                        disabled={!hasGraph}
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
                                        disabled={!hasGraph}
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
        </>
    );
};
