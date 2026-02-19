import { Module } from '@nestjs/common';
import { AiRecommendationStubProvider } from './ai/index.js';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';

@Module({
  controllers: [AnalysisController],
  providers: [
    AnalysisService,
    {
      provide: 'AiRecommendationProvider',
      useClass: AiRecommendationStubProvider,
    },
  ],
})
export class AnalysisModule {}
