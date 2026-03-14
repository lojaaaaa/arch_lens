import { env } from '@/shared/config/env';
import type { ArchitectureGraph } from '@/shared/model/types';

const EXPORT_PDF_ENDPOINT = '/api/analysis/export-pdf';

export async function exportAnalysisPdf(
    graph: ArchitectureGraph,
): Promise<void> {
    const baseUrl = env.apiBaseUrl.replace(/\/$/, '');
    const url = `${baseUrl}${EXPORT_PDF_ENDPOINT}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(graph),
    });

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`PDF export failed: ${response.status} ${text}`);
    }

    const blob = await response.blob();
    const disposition = response.headers.get('content-disposition') ?? '';
    const match = disposition.match(/filename="?([^"]+)"?/);
    const fileName = match?.[1] ?? 'archlens-report.pdf';

    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(blobUrl);
}
