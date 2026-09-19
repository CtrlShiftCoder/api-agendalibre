import type { Service } from '../../contracts/types.js';
import {
  CacheKeys,
  DEFAULT_TTL_MS,
  cacheGet,
  cacheInvalidate,
  cacheSet,
} from '../../infrastructure/cache/ttl-cache.js';
import { AppError } from '../../shared/errors.js';
import { generateId } from '../../shared/ids.js';
import { servicesRepository } from './repository.js';

export const servicesService = {
  list(businessId?: string | null) {
    const key = CacheKeys.services(businessId ?? 'all');
    const cached = cacheGet<Service[]>(key);
    if (cached) return cached;
    const rows = servicesRepository.list(businessId ?? undefined);
    cacheSet(key, rows, DEFAULT_TTL_MS);
    return rows;
  },
  get(id: string) {
    const row = servicesRepository.get(id);
    if (!row) throw AppError.notFound('Service not found');
    return row;
  },
  create(
    businessId: string,
    input: Omit<Service, 'id' | 'businessId' | 'active'> & { active?: boolean }
  ) {
    const row = servicesRepository.create({
      id: generateId('svc'),
      businessId,
      active: input.active ?? true,
      name: input.name,
      durationMin: input.durationMin,
      priceClp: input.priceClp,
      depositPercent: input.depositPercent,
      popular: input.popular,
      category: input.category,
      iconKey: input.iconKey,
    });
    cacheInvalidate(CacheKeys.services(businessId));
    cacheInvalidate(CacheKeys.services('all'));
    cacheInvalidate('public:v:');
    return row;
  },
  update(id: string, patch: Partial<Service>) {
    const row = servicesRepository.update(id, patch);
    if (!row) throw AppError.notFound('Service not found');
    if (row.businessId) cacheInvalidate(CacheKeys.services(row.businessId));
    cacheInvalidate(CacheKeys.services('all'));
    cacheInvalidate('public:v:');
    return row;
  },
  remove(id: string) {
    const existing = servicesRepository.get(id);
    if (!servicesRepository.remove(id)) throw AppError.notFound('Service not found');
    if (existing?.businessId) cacheInvalidate(CacheKeys.services(existing.businessId));
    cacheInvalidate(CacheKeys.services('all'));
    cacheInvalidate('public:v:');
  },
};
