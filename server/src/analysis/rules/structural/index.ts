import type { AnalysisRule } from '../../interfaces/index.js';
import { OrphanNodesRule } from './orphan-nodes.rule.js';
import { CyclicDependenciesRule } from './cyclic-dependencies.rule.js';
import { HighFanOutRule } from './high-fan-out.rule.js';
import { HighFanInRule } from './high-fan-in.rule.js';
import { MissingDataLayerRule } from './missing-data-layer.rule.js';
import { FrontendDbDirectRule } from './frontend-db-direct.rule.js';
import { NoApiGatewayRule } from './no-api-gateway.rule.js';
import { DisconnectedLayersRule } from './disconnected-layers.rule.js';
import { SinglePointOfFailureRule } from './single-point-of-failure.rule.js';
import { RedundantEdgesRule } from './redundant-edges.rule.js';
import { S11ExcessiveDepthRule } from './s11-excessive-depth.rule.js';

export const structuralRules: AnalysisRule[] = [
  new OrphanNodesRule(),
  new CyclicDependenciesRule(),
  new HighFanOutRule(),
  new HighFanInRule(),
  new MissingDataLayerRule(),
  new FrontendDbDirectRule(),
  new NoApiGatewayRule(),
  new DisconnectedLayersRule(),
  new SinglePointOfFailureRule(),
  new RedundantEdgesRule(),
  new S11ExcessiveDepthRule(),
];
