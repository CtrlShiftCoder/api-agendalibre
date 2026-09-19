import type {
  Appointment,
  Business,
  CancellationPolicy,
  Client,
  GalleryItem,
  Professional,
  PublicStorefront,
  ReminderTemplate,
  Review,
  Service,
  WaitlistEntry,
} from '../../contracts/types.js';
import { generateCode, generateId, nowIso, todayOffset } from '../../shared/ids.js';
import { db, resetDb, type MockUser } from './store.js';

const DEFAULT_PUSH = {
  bookingConfirm: true,
  reminder24h: true,
  reminder2h: true,
  waitlistOpen: true,
  reviewRequest: true,
  teamInvite: true,
  marketing: false,
};

function hours(open = '09:00', close = '19:00', days = [1, 2, 3, 4, 5, 6]) {
  return { open, close, days };
}

function seedTemplates(businessId: string): ReminderTemplate[] {
  return [
    {
      id: generateId('tpl'),
      businessId,
      kind: 'confirm',
      channel: 'whatsapp',
      body: 'Hola {{name}}, tu hora de {{service}} quedó para el {{date}} a las {{time}}. Código {{code}}.',
    },
    {
      id: generateId('tpl'),
      businessId,
      kind: 'reminder_24h',
      channel: 'whatsapp',
      body: 'Recordatorio: mañana {{date}} a las {{time}} tienes {{service}} en {{place}}.',
    },
    {
      id: generateId('tpl'),
      businessId,
      kind: 'reminder_2h',
      channel: 'sms',
      body: 'En 2 horas: {{service}} a las {{time}}. Te esperamos.',
    },
    {
      id: generateId('tpl'),
      businessId,
      kind: 'noshow_followup',
      channel: 'whatsapp',
      body: 'Hola {{name}}, notamos que no llegaste a tu hora. ¿Reagendamos?',
    },
  ];
}

function policyFor(businessId: string): CancellationPolicy {
  return {
    id: generateId('pol'),
    businessId,
    cancelBeforeHours: 24,
    depositPercentDefault: 30,
    noShowFeePercent: 50,
    noShowFeeFixedClp: null,
    keepDepositOnNoShow: true,
    policyText:
      'Puedes cancelar hasta 24 horas antes sin cargo. Si no asistes (no-show), se cobra el 50% del servicio o se retiene la seña.',
    updatedAt: nowIso(),
  };
}

export function seedDatabase(): void {
  resetDb();
  const ts = nowIso();

  // ── Empresa: barbería ──
  const bizBarber: Business = {
    id: 'biz_barber_01',
    slug: 'barberia-norte',
    name: 'Barbería Norte',
    niche: 'barber',
    vertical: 'barber',
    roleKind: 'empresa',
    address: 'Av. Providencia 1234, Santiago',
    phone: '+56911110001',
    hours: hours(),
    blockedDates: [],
    theme: 'barber',
    createdAt: ts,
    updatedAt: ts,
  };

  const prosBarber: Professional[] = [
    {
      id: 'pro_barber_admin',
      businessId: bizBarber.id,
      name: 'Ignacio Camiletti',
      role: 'Dueño / Barbero',
      teamRole: 'admin',
      phone: '+56911110001',
      active: true,
      color: '#06C167',
      workStart: '09:00',
      workEnd: '19:00',
    },
    {
      id: 'pro_barber_w1',
      businessId: bizBarber.id,
      name: 'Matías Rojas',
      role: 'Barbero',
      teamRole: 'trabajador',
      phone: '+56911110002',
      active: true,
      color: '#047857',
      workStart: '10:00',
      workEnd: '18:00',
    },
    {
      id: 'pro_barber_w2',
      businessId: bizBarber.id,
      name: 'Diego Soto',
      role: 'Barbero',
      teamRole: 'trabajador',
      phone: '+56911110003',
      active: true,
      color: '#10B981',
      workStart: '09:00',
      workEnd: '20:00',
    },
  ];

  const svcBarber: Service[] = [
    {
      id: 'svc_barber_1',
      businessId: bizBarber.id,
      name: 'Corte Clásico + Barba',
      durationMin: 45,
      priceClp: 18000,
      active: true,
      depositPercent: 30,
      popular: true,
      category: 'servicio',
      iconKey: 'cut',
    },
    {
      id: 'svc_barber_2',
      businessId: bizBarber.id,
      name: 'Fade Premium',
      durationMin: 40,
      priceClp: 15000,
      active: true,
      depositPercent: null,
      category: 'servicio',
      iconKey: 'bolt',
    },
    {
      id: 'svc_barber_3',
      businessId: bizBarber.id,
      name: 'Paquete Ritual Completo',
      durationMin: 90,
      priceClp: 35000,
      active: true,
      depositPercent: 50,
      category: 'paquete',
      iconKey: 'all',
    },
    {
      id: 'svc_barber_4',
      businessId: bizBarber.id,
      name: 'Promo Barba Express',
      durationMin: 20,
      priceClp: 8000,
      active: true,
      depositPercent: null,
      category: 'promo',
      iconKey: 'cut',
    },
  ];

  const clientsBarber: Client[] = [
    {
      id: 'cli_barber_1',
      businessId: bizBarber.id,
      name: 'Carlos Muñoz',
      phone: '+56987654321',
      email: 'carlos@example.com',
      noShowCount: 0,
      completedCount: 5,
      lastVisitAt: todayOffset(-7),
      riskFlag: 'ok',
      tags: ['frecuente'],
    },
    {
      id: 'cli_barber_2',
      businessId: bizBarber.id,
      name: 'Pedro Vargas',
      phone: '+56987654322',
      noShowCount: 2,
      completedCount: 1,
      lastVisitAt: todayOffset(-14),
      riskFlag: 'watch',
    },
    {
      id: 'cli_barber_3',
      businessId: bizBarber.id,
      name: 'Andrés López',
      phone: '+56987654323',
      noShowCount: 0,
      completedCount: 2,
      riskFlag: 'ok',
    },
  ];

  const aptsBarber: Appointment[] = [
    {
      id: 'apt_barber_1',
      businessId: bizBarber.id,
      serviceId: svcBarber[0]!.id,
      professionalId: prosBarber[1]!.id,
      clientId: clientsBarber[0]!.id,
      date: todayOffset(0),
      startTime: '10:00',
      status: 'confirmada',
      code: generateCode(),
      createdAt: ts,
    },
    {
      id: 'apt_barber_2',
      businessId: bizBarber.id,
      serviceId: svcBarber[1]!.id,
      professionalId: prosBarber[2]!.id,
      clientId: clientsBarber[1]!.id,
      date: todayOffset(0),
      startTime: '11:00',
      status: 'pendiente',
      code: generateCode(),
      createdAt: ts,
    },
    {
      id: 'apt_barber_3',
      businessId: bizBarber.id,
      serviceId: svcBarber[0]!.id,
      professionalId: prosBarber[1]!.id,
      clientId: clientsBarber[2]!.id,
      date: todayOffset(1),
      startTime: '15:30',
      status: 'confirmada',
      code: generateCode(),
      createdAt: ts,
    },
    {
      id: 'apt_barber_4',
      businessId: bizBarber.id,
      serviceId: svcBarber[2]!.id,
      professionalId: prosBarber[0]!.id,
      clientId: clientsBarber[0]!.id,
      date: todayOffset(-2),
      startTime: '16:00',
      status: 'completada',
      code: generateCode(),
      createdAt: ts,
    },
  ];

  const storeBarber: PublicStorefront = {
    slug: bizBarber.slug,
    businessId: bizBarber.id,
    displayName: bizBarber.name,
    bio: 'Cortes clásicos y fades premium en Providencia. Reserva fácil.',
    niche: 'barber',
    address: bizBarber.address,
    coverEmoji: '💈',
    coverColor: '#06C167',
    showPrices: true,
    showTeam: true,
    bookingPath: `/v/${bizBarber.slug}`,
  };

  const reviewsBarber: Review[] = [
    {
      id: 'rev_barber_1',
      businessId: bizBarber.id,
      appointmentId: aptsBarber[3]!.id,
      clientId: clientsBarber[0]!.id,
      clientName: clientsBarber[0]!.name,
      professionalId: prosBarber[0]!.id,
      serviceId: svcBarber[2]!.id,
      rating: 5,
      comment: 'Excelente ritual completo, muy profesionales.',
      createdAt: todayOffset(-1) + 'T18:00:00.000Z',
      visible: true,
    },
    {
      id: 'rev_barber_2',
      businessId: bizBarber.id,
      appointmentId: 'apt_hist_1',
      clientId: clientsBarber[2]!.id,
      clientName: clientsBarber[2]!.name,
      professionalId: prosBarber[1]!.id,
      serviceId: svcBarber[0]!.id,
      rating: 4,
      comment: 'Buen corte, puntual.',
      createdAt: todayOffset(-10) + 'T12:00:00.000Z',
      reply: '¡Gracias Andrés!',
      replyAt: todayOffset(-9) + 'T09:00:00.000Z',
      visible: true,
    },
  ];

  const galleryBarber: GalleryItem[] = [
    {
      id: 'gal_barber_1',
      businessId: bizBarber.id,
      professionalId: prosBarber[1]!.id,
      title: 'Fade + diseño',
      caption: 'Trabajo reciente',
      imageUri: 'https://picsum.photos/seed/agendalibre-fade/400/400',
      placeholderColor: '#06C167',
      emoji: '✂️',
      createdAt: ts,
      visible: true,
    },
    {
      id: 'gal_barber_2',
      businessId: bizBarber.id,
      professionalId: null,
      title: 'Barba premium',
      caption: 'Toalla caliente + perfilado',
      imageUri: 'https://picsum.photos/seed/agendalibre-barba/400/400',
      placeholderColor: '#047857',
      emoji: '🧔',
      createdAt: ts,
      visible: true,
    },
  ];

  const waitBarber: WaitlistEntry[] = [
    {
      id: 'wl_barber_1',
      businessId: bizBarber.id,
      clientId: clientsBarber[1]!.id,
      clientName: clientsBarber[1]!.name,
      clientPhone: clientsBarber[1]!.phone,
      serviceId: svcBarber[0]!.id,
      professionalId: prosBarber[1]!.id,
      preferredDate: todayOffset(2),
      preferredPeriod: 'afternoon',
      status: 'waiting',
      createdAt: ts,
    },
  ];

  // ── Persona natural: podología ──
  const bizPodo: Business = {
    id: 'biz_podo_01',
    slug: 'podologia-andina',
    name: 'Podología Andina',
    niche: 'health',
    vertical: 'health',
    roleKind: 'persona_natural',
    address: 'Las Condes 500, Santiago',
    phone: '+56922220001',
    hours: hours('08:30', '18:00', [1, 2, 3, 4, 5]),
    blockedDates: [],
    theme: 'health',
    createdAt: ts,
    updatedAt: ts,
  };

  const prosPodo: Professional[] = [
    {
      id: 'pro_podo_1',
      businessId: bizPodo.id,
      name: 'Dra. Camila Fuentes',
      role: 'Podóloga',
      teamRole: 'admin',
      phone: '+56922220001',
      active: true,
      color: '#0D9488',
    },
  ];

  const svcPodo: Service[] = [
    {
      id: 'svc_podo_1',
      businessId: bizPodo.id,
      name: 'Consulta Podológica',
      durationMin: 40,
      priceClp: 35000,
      active: true,
      depositPercent: 20,
      popular: true,
      category: 'servicio',
      iconKey: 'spa',
    },
    {
      id: 'svc_podo_2',
      businessId: bizPodo.id,
      name: 'Quiropodia',
      durationMin: 50,
      priceClp: 42000,
      active: true,
      depositPercent: null,
      category: 'servicio',
      iconKey: 'bolt',
    },
    {
      id: 'svc_podo_3',
      businessId: bizPodo.id,
      name: 'Paquete Evaluación + Control',
      durationMin: 70,
      priceClp: 60000,
      active: true,
      depositPercent: 30,
      category: 'paquete',
      iconKey: 'all',
    },
  ];

  const clientsPodo: Client[] = [
    {
      id: 'cli_podo_1',
      businessId: bizPodo.id,
      name: 'María González',
      phone: '+56955550001',
      email: 'maria@example.com',
      noShowCount: 0,
      completedCount: 3,
      lastVisitAt: todayOffset(-5),
      riskFlag: 'ok',
    },
    {
      id: 'cli_podo_2',
      businessId: bizPodo.id,
      name: 'Juan Pérez',
      phone: '+56955550002',
      noShowCount: 1,
      completedCount: 4,
      riskFlag: 'ok',
    },
  ];

  const aptsPodo: Appointment[] = [
    {
      id: 'apt_podo_1',
      businessId: bizPodo.id,
      serviceId: svcPodo[0]!.id,
      professionalId: prosPodo[0]!.id,
      clientId: clientsPodo[0]!.id,
      date: todayOffset(0),
      startTime: '09:00',
      status: 'confirmada',
      code: generateCode(),
      createdAt: ts,
    },
    {
      id: 'apt_podo_2',
      businessId: bizPodo.id,
      serviceId: svcPodo[1]!.id,
      professionalId: prosPodo[0]!.id,
      clientId: clientsPodo[1]!.id,
      date: todayOffset(3),
      startTime: '11:30',
      status: 'confirmada',
      code: generateCode(),
      createdAt: ts,
    },
  ];

  const storePodo: PublicStorefront = {
    slug: bizPodo.slug,
    businessId: bizPodo.id,
    displayName: bizPodo.name,
    bio: 'Atención podológica profesional. Agenda tu evaluación.',
    niche: 'health',
    address: bizPodo.address,
    coverEmoji: '🩺',
    coverColor: '#0D9488',
    showPrices: true,
    showTeam: false,
    bookingPath: `/v/${bizPodo.slug}`,
  };

  const reviewsPodo: Review[] = [
    {
      id: 'rev_podo_1',
      businessId: bizPodo.id,
      appointmentId: 'apt_podo_hist',
      clientId: clientsPodo[0]!.id,
      clientName: clientsPodo[0]!.name,
      professionalId: prosPodo[0]!.id,
      serviceId: svcPodo[0]!.id,
      rating: 5,
      comment: 'Muy clara la evaluación, excelente trato.',
      createdAt: todayOffset(-6) + 'T15:00:00.000Z',
      visible: true,
    },
  ];

  const galleryPodo: GalleryItem[] = [
    {
      id: 'gal_podo_1',
      businessId: bizPodo.id,
      professionalId: prosPodo[0]!.id,
      title: 'Evaluación podológica',
      caption: 'Antes / después control',
      imageUri: 'https://picsum.photos/seed/agendalibre-consulta/400/400',
      placeholderColor: '#0D9488',
      emoji: '🦶',
      createdAt: ts,
      visible: true,
    },
  ];

  // ── Cliente app user (no business) ──
  const users: MockUser[] = [
    {
      id: 'usr_empresa_1',
      email: 'empresa@agendalibre.cl',
      password: 'demo1234',
      name: 'Ignacio Camiletti',
      role: 'empresa',
      businessId: bizBarber.id,
      professionalId: prosBarber[0]!.id,
      clientId: null,
    },
    {
      id: 'usr_podo_1',
      email: 'podologia@agendalibre.cl',
      password: 'demo1234',
      name: 'Camila Fuentes',
      role: 'persona_natural',
      businessId: bizPodo.id,
      professionalId: prosPodo[0]!.id,
      clientId: null,
    },
    {
      id: 'usr_cliente_1',
      email: 'cliente@agendalibre.cl',
      password: 'demo1234',
      name: 'Carlos Muñoz',
      role: 'cliente',
      businessId: null,
      professionalId: null,
      clientId: clientsBarber[0]!.id,
    },
    {
      id: 'usr_trabajador_1',
      email: 'trabajador@agendalibre.cl',
      password: 'demo1234',
      name: 'Matías Rojas',
      role: 'empresa',
      businessId: bizBarber.id,
      professionalId: prosBarber[1]!.id,
      clientId: null,
    },
  ];

  db.users.push(...users);
  db.businesses.push(bizBarber, bizPodo);
  db.professionals.push(...prosBarber, ...prosPodo);
  db.services.push(...svcBarber, ...svcPodo);
  db.clients.push(...clientsBarber, ...clientsPodo);
  db.appointments.push(...aptsBarber, ...aptsPodo);
  db.policies.push(policyFor(bizBarber.id), policyFor(bizPodo.id));
  db.storefronts.push(storeBarber, storePodo);
  db.reviews.push(...reviewsBarber, ...reviewsPodo);
  db.gallery.push(...galleryBarber, ...galleryPodo);
  db.waitlist.push(...waitBarber);
  db.reminderTemplates.push(
    ...seedTemplates(bizBarber.id),
    ...seedTemplates(bizPodo.id)
  );
  for (const u of users) {
    db.pushPreferences[u.id] = { ...DEFAULT_PUSH };
  }
  db.notifications.push({
    id: generateId('ntf'),
    businessId: bizBarber.id,
    userId: users[0]!.id,
    title: 'Nueva reserva',
    body: 'Carlos Muñoz reservó Corte Clásico + Barba para hoy 10:00.',
    kind: 'booking_confirm',
    relatedAppointmentId: aptsBarber[0]!.id,
    read: false,
    createdAt: ts,
  });
  db.teamInvites.push({
    id: generateId('inv'),
    businessId: bizBarber.id,
    code: 'NORTE-TEAM',
    businessName: bizBarber.name,
    createdByProfessionalId: prosBarber[0]!.id,
    role: 'trabajador',
    status: 'pending',
    expiresAt: todayOffset(14) + 'T23:59:59.000Z',
    createdAt: ts,
  });
}
