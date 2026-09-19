import type { AuthUser } from '../../contracts/types.js';
import { db, type MockUser } from '../../infrastructure/mock-db/store.js';

export const authRepository = {
  findByEmail(email: string): MockUser | undefined {
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  findById(id: string): MockUser | undefined {
    return db.users.find((u) => u.id === id);
  },
  create(user: MockUser): AuthUser {
    db.users.push(user);
    const { password: _p, ...rest } = user;
    return rest;
  },
  toAuthUser(u: MockUser): AuthUser {
    const { password: _p, ...rest } = u;
    return rest;
  },
};
