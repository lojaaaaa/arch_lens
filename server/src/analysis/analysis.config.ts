export const ANALYSIS_CONFIG = {
  structural: {
    highFanOutThreshold: 3,
    highFanOutCriticalThreshold: 5,
    highFanInThreshold: 4,
  },

  scoring: {
    penaltyInfo: 2,
    penaltyWarning: 5,
    penaltyCritical: 15,
  },
} as const;
