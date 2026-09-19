import type { GalleryItem } from '../../contracts/types.js';
import { db } from '../../infrastructure/mock-db/store.js';

export const galleryRepository = {
  list(businessId?: string, visibleOnly = false) {
    let rows = [...db.gallery];
    if (businessId) rows = rows.filter((g) => g.businessId === businessId);
    if (visibleOnly) rows = rows.filter((g) => g.visible);
    return rows;
  },
  get(id: string) {
    return db.gallery.find((g) => g.id === id);
  },
  create(row: GalleryItem) {
    db.gallery.push(row);
    return row;
  },
  update(id: string, patch: Partial<GalleryItem>) {
    const i = db.gallery.findIndex((g) => g.id === id);
    if (i < 0) return undefined;
    db.gallery[i] = { ...db.gallery[i]!, ...patch, id };
    return db.gallery[i];
  },
  remove(id: string) {
    const before = db.gallery.length;
    db.gallery = db.gallery.filter((g) => g.id !== id);
    return db.gallery.length < before;
  },
};
