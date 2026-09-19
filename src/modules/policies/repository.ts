import type { CancellationPolicy } from '../../contracts/types.js';
import { db } from '../../infrastructure/mock-db/store.js';

export const policiesRepository = {
  getByBusiness(businessId: string) {
    return db.policies.find((p) => p.businessId === businessId);
  },
  upsert(policy: CancellationPolicy) {
    const i = db.policies.findIndex((p) => p.businessId === policy.businessId);
    if (i >= 0) db.policies[i] = policy;
    else db.policies.push(policy);
    return policy;
  },
};
