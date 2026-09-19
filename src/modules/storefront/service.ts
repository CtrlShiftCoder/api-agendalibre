import type { PublicStorefront, PublicStorefrontView } from '../../contracts/types.js';
import {
  CacheKeys,
  DEFAULT_TTL_MS,
  cacheGet,
  cacheInvalidate,
  cacheSet,
} from '../../infrastructure/cache/ttl-cache.js';
import { AppError } from '../../shared/errors.js';
import { storefrontRepository } from './repository.js';

export const storefrontService = {
  get(businessId: string): PublicStorefront {
    const key = CacheKeys.storefront(businessId);
    const cached = cacheGet<PublicStorefront>(key);
    if (cached) return cached;
    const s = storefrontRepository.getByBusiness(businessId);
    if (!s) throw AppError.notFound('Storefront not found');
    cacheSet(key, s, DEFAULT_TTL_MS);
    return s;
  },
  update(businessId: string, patch: Partial<PublicStorefront>): PublicStorefront {
    if (patch.slug) {
      const clash = storefrontRepository.getBySlug(patch.slug);
      if (clash && clash.businessId !== businessId) {
        throw AppError.conflict('Slug already taken');
      }
      patch.bookingPath = `/v/${patch.slug}`;
    }
    const s = storefrontRepository.update(businessId, patch);
    if (!s) throw AppError.notFound('Storefront not found');
    cacheInvalidate(CacheKeys.storefront(businessId));
    cacheInvalidate(CacheKeys.publicVitrina(s.slug));
    cacheInvalidate('public:v:');
    return s;
  },
  publicBySlug(slug: string): PublicStorefrontView {
    const key = CacheKeys.publicVitrina(slug);
    const cached = cacheGet<PublicStorefrontView>(key);
    if (cached) return cached;
    const view = storefrontRepository.publicView(slug);
    if (!view) throw AppError.notFound('Vitrina not found');
    cacheSet(key, view, DEFAULT_TTL_MS);
    return view;
  },
};
