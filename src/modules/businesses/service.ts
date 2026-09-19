import type { Business } from '../../contracts/types.js';
import { AppError } from '../../shared/errors.js';
import { generateId, nowIso } from '../../shared/ids.js';
import { businessesRepository } from './repository.js';

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'negocio'
  );
}

export const businessesService = {
  list(forBusinessId?: string | null): Business[] {
    const all = businessesRepository.list();
    if (forBusinessId) return all.filter((b) => b.id === forBusinessId);
    return all;
  },
  get(id: string): Business {
    const b = businessesRepository.get(id);
    if (!b) throw AppError.notFound('Business not found');
    return b;
  },
  create(input: {
    name: string;
    niche: Business['niche'];
    roleKind: Business['roleKind'];
    address: string;
    phone?: string;
    hours?: Business['hours'];
    blockedDates?: string[];
    theme?: Business['theme'];
    slug?: string;
  }): Business {
    const id = generateId('biz');
    const slug = input.slug ?? `${slugify(input.name)}-${id.slice(-4)}`;
    if (businessesRepository.getBySlug(slug)) {
      throw AppError.conflict('Slug already exists');
    }
    const ts = nowIso();
    return businessesRepository.create({
      id,
      slug,
      name: input.name,
      niche: input.niche,
      vertical: input.niche,
      roleKind: input.roleKind,
      address: input.address,
      phone: input.phone,
      hours: input.hours ?? { open: '09:00', close: '19:00', days: [1, 2, 3, 4, 5, 6] },
      blockedDates: input.blockedDates ?? [],
      theme: input.theme ?? (input.niche === 'other' ? 'neutral' : input.niche),
      createdAt: ts,
      updatedAt: ts,
    });
  },
  update(id: string, patch: Partial<Business>): Business {
    const updated = businessesRepository.update(id, patch);
    if (!updated) throw AppError.notFound('Business not found');
    return updated;
  },
};
