import { toPng, toSvg } from 'html-to-image';

import type { TypeOrNull } from '@/shared/model/types';

type ExportFormat = 'png' | 'svg';
type ExportImageOptions = Parameters<typeof toPng>[1];

export type ExportCanvasOptions = {
    transparent: boolean;
    fileName?: string;
};

const DEFAULT_FILE_BASE = 'archlens-diagram';
const EXPORT_IGNORE_CLASSES = new Set([
    'react-flow__controls',
    'react-flow__minimap',
    'react-flow__background',
    'react-flow__panel',
    'react-flow__attribution',
]);

const TRANSPARENT_COLORS = ['transparent', 'rgba(0, 0, 0, 0)'];
const FALLBACK_BACKGROUND = '#ffffff';

const isTransparentColor = (color: string): boolean =>
    TRANSPARENT_COLORS.includes(color);

const resolveBackgroundColor = (
    target: HTMLElement,
    transparent: boolean,
): string | undefined => {
    if (transparent) {
        return undefined;
    }
    const computed =
        getComputedStyle(document.body).backgroundColor ||
        getComputedStyle(target).backgroundColor;
    if (!computed || isTransparentColor(computed)) {
        return FALLBACK_BACKGROUND;
    }
    return computed;
};

const buildExportOptions = (
    target: HTMLElement,
    transparent: boolean,
): ExportImageOptions => ({
    cacheBust: true,
    backgroundColor: resolveBackgroundColor(target, transparent),
    filter: (element: HTMLElement) => {
        if (element.dataset?.exportIgnore === 'true') {
            return false;
        }
        return !Array.from(EXPORT_IGNORE_CLASSES).some((className) =>
            element.classList?.contains(className),
        );
    },
});

const getCanvasElement = () =>
    document.querySelector('.react-flow') as TypeOrNull<HTMLElement>;

const downloadDataUrl = (dataUrl: string, fileName: string): void => {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    link.click();
};

const exportCanvas = async (
    format: ExportFormat,
    options: ExportCanvasOptions,
): Promise<void> => {
    const target = getCanvasElement();
    if (!target) {
        throw new Error('Canvas not found');
    }
    const exportOptions = buildExportOptions(target, options.transparent);
    const suffix = format === 'png' ? 'png' : 'svg';
    const downloadName = options.fileName ?? `${DEFAULT_FILE_BASE}.${suffix}`;
    const dataUrl =
        format === 'png'
            ? await toPng(target, exportOptions)
            : await toSvg(target, exportOptions);
    downloadDataUrl(dataUrl, downloadName);
};

export const exportCanvasToPng = (
    options: ExportCanvasOptions,
): Promise<void> => exportCanvas('png', options);

export const exportCanvasToSvg = (
    options: ExportCanvasOptions,
): Promise<void> => exportCanvas('svg', options);
