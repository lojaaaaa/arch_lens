/**
 * Analysis API controller (NestJS).
 */

import { Body, Controller, Post, Res, Header } from '@nestjs/common';
import type { Response } from 'express';
import { ArchitectureGraphDto } from './dto/architecture-graph.dto';
import { AnalysisService } from './analysis.service';
import { PdfReportService } from './pdf/pdf-report.service';

@Controller('api/analysis')
export class AnalysisController {
  constructor(
    private readonly analysisService: AnalysisService,
    private readonly pdfReportService: PdfReportService,
  ) {}

  @Post()
  analyze(@Body() graph: ArchitectureGraphDto) {
    return this.analysisService.analyze(graph);
  }

  @Post('export-pdf')
  @Header('Content-Type', 'application/pdf')
  async exportPdf(@Body() graph: ArchitectureGraphDto, @Res() res: Response) {
    const result = await this.analysisService.analyze(graph);
    const pdfBuffer = await this.pdfReportService.generate(result);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="archlens-report-${result.summary.grade}-${result.summary.score}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
}
