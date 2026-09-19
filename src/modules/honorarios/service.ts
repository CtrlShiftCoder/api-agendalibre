import type { HonorariosQuote } from '../../contracts/types.js';
import { HONORARIOS_RETENTION_2026 } from './repository.js';

export const honorariosService = {
  quote(brutoClp: number): HonorariosQuote {
    const bruto = Math.max(0, Math.round(brutoClp));
    const retentionRate = HONORARIOS_RETENTION_2026;
    const retentionClp = Math.round(bruto * retentionRate);
    return {
      brutoClp: bruto,
      retentionRate,
      retentionClp,
      liquidoClp: bruto - retentionClp,
      year: 2026,
    };
  },
};
