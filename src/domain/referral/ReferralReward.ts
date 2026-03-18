export type ReferralRewardType = 'PRO_DAYS' | 'TRUST' | 'LVC';

export interface ReferralReward {
  type: ReferralRewardType;
  value: number;
}
