import { Test } from '@nestjs/testing';
import { AnalysisModule } from '../analysis.module.js';
import { AnalysisService } from '../analysis.service.js';
import { buildAntiPatternGraph } from './calibration/fixtures.js';

describe('Anti-pattern preset analysis', () => {
  let analysisService: AnalysisService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AnalysisModule],
    }).compile();
    analysisService = module.get(AnalysisService);
  });

  it('returns many critical/warning issues', async () => {
    const graph = buildAntiPatternGraph();
    const result = await analysisService.analyze(graph);

    expect(result.issues.length).toBeGreaterThanOrEqual(3);
    const criticalCount = result.issues.filter(
      (issue) => issue.severity === 'critical',
    ).length;
    expect(criticalCount).toBeGreaterThanOrEqual(1);
  });

  it('returns low score (D or F)', async () => {
    const graph = buildAntiPatternGraph();
    const result = await analysisService.analyze(graph);

    expect(['D', 'F']).toContain(result.summary.grade);
  });

  it('detects S02 cycles and S07 no gateway', async () => {
    const graph = buildAntiPatternGraph();
    const result = await analysisService.analyze(graph);

    const ruleIds = result.issues.map((issue) => issue.ruleId).filter(Boolean);
    expect(ruleIds).toContain('S02');
    expect(ruleIds).toContain('S07');
  });
});
