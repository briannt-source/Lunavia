import { ReferralReward } from './ReferralReward';

export interface ReferralPolicy {
  enabled: boolean;
  reward: ReferralReward;
  conditions?: {
    minUsageDays?: number;
    requiresVerification?: boolean;
  };
}
