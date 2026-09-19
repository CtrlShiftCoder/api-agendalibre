import type {
  AppNotification,
  Appointment,
  AuthUser,
  Business,
  CancellationPolicy,
  Client,
  GalleryItem,
  Professional,
  PublicStorefront,
  PushPreference,
  ReminderJob,
  ReminderTemplate,
  Review,
  Service,
  TeamInvite,
  WaitlistEntry,
} from '../../contracts/types.js';

export interface MockUser extends AuthUser {
  email: string;
  password: string;
}

export interface MockDb {
  users: MockUser[];
  businesses: Business[];
  services: Service[];
  professionals: Professional[];
  clients: Client[];
  appointments: Appointment[];
  policies: CancellationPolicy[];
  waitlist: WaitlistEntry[];
  storefronts: PublicStorefront[];
  reminderTemplates: ReminderTemplate[];
  reminderJobs: ReminderJob[];
  teamInvites: TeamInvite[];
  notifications: AppNotification[];
  pushPreferences: Record<string, PushPreference>;
  reviews: Review[];
  gallery: GalleryItem[];
}

export const db: MockDb = {
  users: [],
  businesses: [],
  services: [],
  professionals: [],
  clients: [],
  appointments: [],
  policies: [],
  waitlist: [],
  storefronts: [],
  reminderTemplates: [],
  reminderJobs: [],
  teamInvites: [],
  notifications: [],
  pushPreferences: {},
  reviews: [],
  gallery: [],
};

export function resetDb(): void {
  db.users = [];
  db.businesses = [];
  db.services = [];
  db.professionals = [];
  db.clients = [];
  db.appointments = [];
  db.policies = [];
  db.waitlist = [];
  db.storefronts = [];
  db.reminderTemplates = [];
  db.reminderJobs = [];
  db.teamInvites = [];
  db.notifications = [];
  db.pushPreferences = {};
  db.reviews = [];
  db.gallery = [];
}
