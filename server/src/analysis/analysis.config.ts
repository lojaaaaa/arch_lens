export const ANALYSIS_CONFIG = {
  structural: {
    highFanOutThreshold: 3,
    highFanOutCriticalThreshold: 5,
    highFanInThreshold: 4,
  },

  pattern: {
    godServiceOpsThreshold: 10,
    godServiceExternalCallsThreshold: 5,
    tightCouplingEdgeThreshold: 3,
    missingCacheReadWriteRatio: 0.7,
    excessiveNestingThreshold: 5,
    monolithApiEndpointsThreshold: 15,
  },

  load: {
    renderPressureThreshold: 15,
    apiOverloadThreshold: 1000,
    dbWriteEdgesThreshold: 5,
    dbLowReadWriteRatio: 0.3,
    cacheLowHitRate: 0.5,
    cacheDbReadsThreshold: 3,
    lowReliability: 0.95,
    syncChainLengthThreshold: 3,
  },

  scoring: {
    penaltyInfo: 2,
    penaltyWarning: 5,
    penaltyCritical: 15,
    bonusCachePresent: 3,
    bonusGatewayPresent: 3,
    bonusNoCycles: 5,
    bonusAllConnected: 3,
  },
} as const;
