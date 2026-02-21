import { toPng, toSvg } from 'html-to-image';

type ExportFormat = 'png' | 'svg';
type ExportImageOptions = Parameters<typeof toPng>[1];

type ExportOptions = {
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

const isTransparentColor = (color: string) =>
    color === 'transparent' || color === 'rgba(0, 0, 0, 0)';

const resolveBackgroundColor = (target: HTMLElement, transparent: boolean) => {
    if (transparent) {
        return undefined;
    }
    const computed =
        getComputedStyle(document.body).backgroundColor ||
        getComputedStyle(target).backgroundColor;
    if (!computed || isTransparentColor(computed)) {
        return '#ffffff';
    }
    return computed;
};

const buildExportOptions = (
    target: HTMLElement,
    transparent: boolean,
): ExportImageOptions => ({
    cacheBust: true,
    backgroundColor: resolveBackgroundColor(target, transparent),
    filter: (node: HTMLElement) => {
        const element = node as HTMLElement;
        if (element.dataset?.exportIgnore === 'true') {
            return false;
        }
        return !Array.from(EXPORT_IGNORE_CLASSES).some((className) =>
            element.classList?.contains(className),
        );
    },
});

const getCanvasNode = () =>
    document.querySelector('.react-flow') as HTMLElement | null;

const downloadDataUrl = (dataUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    link.click();
};

const exportCanvas = async (
    format: ExportFormat,
    { transparent, fileName }: ExportOptions,
) => {
    const target = getCanvasNode();
    if (!target) {
        throw new Error('Canvas not found');
    }
    const options = buildExportOptions(target, transparent);
    const suffix = format === 'png' ? 'png' : 'svg';
    const downloadName = fileName ?? `${DEFAULT_FILE_BASE}.${suffix}`;
    const dataUrl =
        format === 'png'
            ? await toPng(target, options)
            : await toSvg(target, options);
    downloadDataUrl(dataUrl, downloadName);
};

export const exportCanvasToPng = (options: ExportOptions) =>
    exportCanvas('png', options);

export const exportCanvasToSvg = (options: ExportOptions) =>
    exportCanvas('svg', options);
