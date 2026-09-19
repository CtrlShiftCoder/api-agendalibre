import type { GalleryItem } from '../../contracts/types.js';
import { AppError } from '../../shared/errors.js';
import { generateId, nowIso } from '../../shared/ids.js';
import { galleryRepository } from './repository.js';

export const galleryService = {
  list(businessId?: string | null, visibleOnly = false) {
    return galleryRepository.list(businessId ?? undefined, visibleOnly);
  },
  create(
    businessId: string,
    input: {
      professionalId?: string | null;
      title: string;
      caption?: string;
      imageUri?: string | null;
      placeholderColor: string;
      emoji: string;
      serviceId?: string | null;
      visible?: boolean;
    }
  ) {
    return galleryRepository.create({
      id: generateId('gal'),
      businessId,
      professionalId: input.professionalId ?? null,
      title: input.title,
      caption: input.caption,
      imageUri: input.imageUri,
      placeholderColor: input.placeholderColor,
      emoji: input.emoji,
      serviceId: input.serviceId,
      createdAt: nowIso(),
      visible: input.visible ?? true,
    });
  },
  update(id: string, patch: Partial<GalleryItem>) {
    const row = galleryRepository.update(id, patch);
    if (!row) throw AppError.notFound('Gallery item not found');
    return row;
  },
  remove(id: string) {
    if (!galleryRepository.remove(id)) throw AppError.notFound('Gallery item not found');
  },
};
