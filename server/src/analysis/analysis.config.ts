/**
 * Конфигурация анализа архитектуры.
 * Пороги документированы с источниками — см. docs/FORMULA-SOURCES.md
 */
export const ANALYSIS_CONFIG = {
  structural: {
    /** Fan-out > 3 → warning. Источник: Martin, Clean Architecture — "low fan-out" */
    highFanOutThreshold: 3,
    /** Fan-out > 6 → critical. Источник: PMD God Class (ATFD>5), практика */
    highFanOutCriticalThreshold: 6,
    /** Fan-in > 5 → warning (shared dependency, SPOF risk) */
    highFanInThreshold: 5,
    /** Depth > 5 → warning. Источник: практика call depth */
    architectureDepthThreshold: 5,
    /** Depth > 8 → high risk */
    architectureDepthRiskThreshold: 8,
  },

  pattern: {
    /** God Service: operations > 10. Источник: калибровка, PMD God Class */
    godServiceOpsThreshold: 10,
    /** God Service: externalCalls > 5. Источник: Lanza ATFD */
    godServiceExternalCallsThreshold: 5,
    /** God Component Index > 3. Источник: Fowler God Class */
    godComponentIndexThreshold: 3,
    /** Tight coupling: ≥3 рёбер между парой узлов */
    tightCouplingEdgeThreshold: 3,
    /** Missing cache: readWriteRatio ≥ 0.7 (read-heavy) */
    missingCacheReadWriteRatio: 0.7,
    /** Excessive nesting: nestedComponents > 5 */
    excessiveNestingThreshold: 5,
    /** Monolith API: endpoints > 15 */
    monolithApiEndpointsThreshold: 15,
  },

  load: {
    /** Render pressure: frontendComplexity × stateStores > 15 */
    renderPressureThreshold: 15,
    /** API overload: суммарный requestRate > 1000 rps */
    apiOverloadThreshold: 1000,
    /** DB write bottleneck: writes > 5 */
    dbWriteEdgesThreshold: 5,
    /** DB write bottleneck: readWriteRatio < 0.3 (write-heavy) */
    dbLowReadWriteRatio: 0.3,
    /** Cache miss impact: hitRate < 0.5 */
    cacheLowHitRate: 0.5,
    cacheDbReadsThreshold: 3,
    /** External dependency risk: reliability < 0.95 */
    lowReliability: 0.95,
    /** Sync chain: ≥3 синхронных вызовов */
    syncChainLengthThreshold: 3,
    /** Critical path: > 500 ms */
    criticalPathMsThreshold: 500,
  },

  spof: {
    /** SPOF: criticality ≥ 2 */
    criticalityThreshold: 2,
    /** SPOF: fanIn ≥ 3 */
    fanInThreshold: 3,
  },

  scoring: {
    penaltyInfo: 2,
    penaltyWarning: 10,
    penaltyCritical: 28,
    bonusCachePresent: 3,
    bonusGatewayPresent: 3,
    bonusNoCycles: 5,
    bonusAllConnected: 3,
    /** Score = max(0, min(100, 100 - penalty - metricsPenalty + bonus)). Grade: A≥90, B≥75, C≥60, D≥40, F<40 */
    maxScore: 100,
    /** Влияние метрик на score. Метрики снижают оценку при плохих значениях. */
    metricsWeight: 0.35,
    /** Пороги для metrics penalty: при превышении — штраф. frontendComplexity > 10, backendComplexity > 15 и т.д. */
    metricsThresholds: {
      frontendComplexity: 10,
      backendComplexity: 15,
      depth: 5,
      maxFanOut: 6,
      cycleCount: 0,
      criticalNodesCount: 2,
      renderPressure: 15,
    },
  },

  /** Derive complexity: нормализация raw score в 1–5 (NODE-PROPERTIES-DESIGN) */
  deriveComplexity: {
    service: { ops: 10, external: 5, stateful: 2 },
    apiGateway: { endpoints: 15 },
    uiPage: { components: 10, stateBonus: 1 },
    uiComponent: { nested: 5, props: 10, stateBonus: 1 },
    stateStore: { subscribers: 10 },
    database: { tables: 20 },
    maxRaw: 25,
    scale: [0, 5, 10, 15, 20, 25] as [
      number,
      number,
      number,
      number,
      number,
      number,
    ],
  },

  /** Fallback latency (мс) для узлов без явного latencyMs */
  defaultLatencyMs: {
    api_gateway: 10,
    service: 50,
    database: 50,
    cache: 3,
    external_system: 100,
    ui_page: 0,
    ui_component: 0,
    state_store: 0,
    system: 0,
  } as Record<string, number>,

  /** Confidence Score < 0.6 → предупреждение о неполных данных */
  confidenceLowThreshold: 0.6,

  /** Risk Score: normalize(x) = min(x/threshold, 1) */
  risk: {
    fanOutThreshold: 6,
    depthThreshold: 5,
    densityThreshold: 0.3,
    spofThreshold: 3,
    /** RiskScore weights: CouplingNorm, DepthNorm, SPOFNorm, BottleneckNorm, ExternalRiskNorm */
    weightCoupling: 0.25,
    weightDepth: 0.25,
    weightSpof: 0.25,
    weightBottleneck: 0.15,
    weightExternal: 0.1,
  },
} as const;
