/**
 * Analysis API controller (NestJS).
 */

import { Body, Controller, Post } from '@nestjs/common';
import { ArchitectureGraphDto } from './dto/architecture-graph.dto';
import { AnalysisService } from './analysis.service';

@Controller('api/analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post()
  analyze(@Body() graph: ArchitectureGraphDto) {
    return this.analysisService.analyze(graph);
  }
}
