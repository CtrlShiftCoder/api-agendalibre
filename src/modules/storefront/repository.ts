import type { PublicStorefront } from '../../contracts/types.js';
import { db } from '../../infrastructure/mock-db/store.js';

export const storefrontRepository = {
  getByBusiness(businessId: string) {
    return db.storefronts.find((s) => s.businessId === businessId);
  },
  getBySlug(slug: string) {
    return db.storefronts.find((s) => s.slug === slug);
  },
  update(businessId: string, patch: Partial<PublicStorefront>) {
    const i = db.storefronts.findIndex((s) => s.businessId === businessId);
    if (i < 0) return undefined;
    db.storefronts[i] = { ...db.storefronts[i]!, ...patch };
    return db.storefronts[i];
  },
  publicView(slug: string) {
    const storefront = db.storefronts.find((s) => s.slug === slug);
    if (!storefront) return undefined;
    const businessId = storefront.businessId;
    const services = db.services.filter(
      (s) => s.businessId === businessId && s.active
    );
    const professionals = storefront.showTeam
      ? db.professionals.filter((p) => p.businessId === businessId && p.active)
      : [];
    const reviews = db.reviews.filter(
      (r) => r.businessId === businessId && r.visible
    );
    const gallery = db.gallery.filter(
      (g) => g.businessId === businessId && g.visible
    );
    const policy = db.policies.find((p) => p.businessId === businessId);
    return {
      storefront,
      services: storefront.showPrices
        ? services
        : services.map((s) => ({ ...s, priceClp: 0 })),
      professionals,
      reviews,
      gallery,
      policySummary: policy
        ? {
            cancelBeforeHours: policy.cancelBeforeHours,
            depositPercentDefault: policy.depositPercentDefault,
            policyText: policy.policyText,
          }
        : null,
    };
  },
};
