import { Module } from '@nestjs/common';
import {
  AiRecommendationGroqProvider,
  AiRecommendationStubProvider,
} from './ai/index.js';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { PdfReportService } from './pdf/pdf-report.service';

function createAiProvider() {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  return apiKey
    ? new AiRecommendationGroqProvider(apiKey)
    : new AiRecommendationStubProvider();
}

@Module({
  controllers: [AnalysisController],
  providers: [
    AnalysisService,
    PdfReportService,
    {
      provide: 'AiRecommendationProvider',
      useFactory: createAiProvider,
    },
  ],
})
export class AnalysisModule {}
