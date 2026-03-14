import { Test } from '@nestjs/testing';
import { AnalysisModule } from '../../analysis.module.js';
import { AnalysisService } from '../../analysis.service.js';
import { buildAntiPatternGraph } from './fixtures.js';

describe('Calibration: Anti-pattern preset', () => {
  let analysisService: AnalysisService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AnalysisModule],
    }).compile();
    analysisService = module.get(AnalysisService);
  });

  it('S02 (cycles) present, score D or F', async () => {
    const graph = buildAntiPatternGraph();
    const result = await analysisService.analyze(graph);

    const ruleIds = result.issues.map((issue) => issue.ruleId).filter(Boolean);
    expect(ruleIds).toContain('S02');
    expect(['D', 'F']).toContain(result.summary.grade);
  });
});
