import type { CancellationPolicy } from '../../contracts/types.js';
import {
  CacheKeys,
  DEFAULT_TTL_MS,
  cacheGet,
  cacheInvalidate,
  cacheSet,
} from '../../infrastructure/cache/ttl-cache.js';
import { AppError } from '../../shared/errors.js';
import { generateId, nowIso } from '../../shared/ids.js';
import { policiesRepository } from './repository.js';

export const policiesService = {
  get(businessId: string): CancellationPolicy {
    const key = CacheKeys.policies(businessId);
    const cached = cacheGet<CancellationPolicy>(key);
    if (cached) return cached;
    const p = policiesRepository.getByBusiness(businessId);
    if (!p) throw AppError.notFound('Policy not found');
    cacheSet(key, p, DEFAULT_TTL_MS);
    return p;
  },
  update(businessId: string, patch: Partial<CancellationPolicy>): CancellationPolicy {
    const current = policiesRepository.getByBusiness(businessId);
    const next: CancellationPolicy = {
      id: current?.id ?? generateId('pol'),
      businessId,
      cancelBeforeHours: patch.cancelBeforeHours ?? current?.cancelBeforeHours ?? 24,
      depositPercentDefault:
        patch.depositPercentDefault !== undefined
          ? patch.depositPercentDefault
          : current?.depositPercentDefault ?? 30,
      noShowFeePercent:
        patch.noShowFeePercent !== undefined
          ? patch.noShowFeePercent
          : current?.noShowFeePercent ?? 50,
      noShowFeeFixedClp:
        patch.noShowFeeFixedClp !== undefined
          ? patch.noShowFeeFixedClp
          : current?.noShowFeeFixedClp ?? null,
      keepDepositOnNoShow:
        patch.keepDepositOnNoShow ?? current?.keepDepositOnNoShow ?? true,
      policyText: patch.policyText ?? current?.policyText ?? '',
      updatedAt: nowIso(),
    };
    const saved = policiesRepository.upsert(next);
    cacheInvalidate(CacheKeys.policies(businessId));
    cacheInvalidate('public:v:');
    return saved;
  },
};
