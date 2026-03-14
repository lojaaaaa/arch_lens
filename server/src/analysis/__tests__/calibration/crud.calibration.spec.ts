import { Test } from '@nestjs/testing';
import { AnalysisModule } from '../../analysis.module.js';
import { AnalysisService } from '../../analysis.service.js';
import { buildCrudGraph } from './fixtures.js';

describe('Calibration: CRUD preset', () => {
  let analysisService: AnalysisService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AnalysisModule],
    }).compile();
    analysisService = module.get(AnalysisService);
  });

  it('0 critical, score A or B', async () => {
    const graph = buildCrudGraph();
    const result = await analysisService.analyze(graph);

    expect(result.summary.criticalIssuesCount).toBe(0);
    expect(['A', 'B']).toContain(result.summary.grade);
  });
});
