import { ReferralPolicy } from '@/domain/referral/ReferralPolicy';
import { ReferralStatus } from '@/domain/referral/ReferralStatus';

export interface ReferralRecord {
  referrerId: string;
  referredUserId: string;
  status: ReferralStatus;
}

let policy: ReferralPolicy = {
  enabled: false,
  reward: { type: 'PRO_DAYS', value: 7 },
};

const records: ReferralRecord[] = [];

export const InMemoryReferralRepo = {
  getPolicy() {
    return policy;
  },
  setPolicy(next: ReferralPolicy) {
    policy = next;
    return policy;
  },
  addRecord(record: ReferralRecord) {
    records.push(record);
    return record;
  },
  findByReferredUser(referredUserId: string) {
    return records.find((r) => r.referredUserId === referredUserId) ?? null;
  },
  allRecords() {
    return [...records];
  },
};
