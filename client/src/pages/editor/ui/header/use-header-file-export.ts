import { useState } from 'react';
import { toast } from 'sonner';

import { useSchemaExport } from '@/features/architecture-graph-io';

import { exportCanvasToPng, exportCanvasToSvg } from '../../lib/export-image';
import { buildExportableGraph } from '../../lib/utils';
import { useArchitectureSelectors } from '../../model/selectors';

export const useHeaderFileExport = () => {
    const { nodes, edges } = useArchitectureSelectors();
    const { exportToFile } = useSchemaExport();

    const [transparentExport, setTransparentExport] = useState(false);
    const hasGraph = nodes.length > 0 || edges.length > 0;

    const handleExportJson = () => {
        if (!hasGraph) {
            return;
        }
        const graph = buildExportableGraph(nodes, edges);
        exportToFile(graph);
        toast.success('Файл экспортирован');
    };

    const handleExportPng = async () => {
        if (!hasGraph) {
            return;
        }
        try {
            await exportCanvasToPng({ transparent: transparentExport });
            toast.success('PNG экспортирован');
        } catch {
            toast.error('Не удалось экспортировать PNG');
        }
    };

    const handleExportSvg = async () => {
        if (!hasGraph) {
            return;
        }
        try {
            await exportCanvasToSvg({ transparent: transparentExport });
            toast.success('SVG экспортирован');
        } catch {
            toast.error('Не удалось экспортировать SVG');
        }
    };

    return {
        handleExportJson,
        handleExportPng,
        handleExportSvg,
        hasGraph,
        transparentExport,
        setTransparentExport,
    };
};
