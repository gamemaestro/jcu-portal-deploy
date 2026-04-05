import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and } from "drizzle-orm";
import { users, sessions, contentItems, orders, userUnlocks } from "@shared/schema";
import type { User, Session, ContentItem, InsertUser, Order, UserUnlock } from "@shared/schema";

const dbPath = process.env.DB_PATH || "jcu.db";
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite);

// Ensure tables exist (including new columns added since v1)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    display_name TEXT,
    birth_name TEXT,
    birthdate TEXT,
    character_name TEXT,
    current_location TEXT,
    sun_sign TEXT,
    earth_chart_data TEXT,
    jcu_chart_data TEXT,
    jcu_birth_timestamp INTEGER,
    archetype TEXT,
    content_category TEXT,
    user_state TEXT NOT NULL DEFAULT 'solid',
    game_active INTEGER NOT NULL DEFAULT 0,
    onboarding_complete INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  -- Add new columns if they don't exist (safe migrations)
  ALTER TABLE users ADD COLUMN birth_name TEXT;
  ALTER TABLE users ADD COLUMN birthdate TEXT;
  ALTER TABLE users ADD COLUMN character_name TEXT;
  ALTER TABLE users ADD COLUMN current_location TEXT;
  ALTER TABLE users ADD COLUMN sun_sign TEXT;
  ALTER TABLE users ADD COLUMN earth_chart_data TEXT;
  ALTER TABLE users ADD COLUMN jcu_chart_data TEXT;
  ALTER TABLE users ADD COLUMN jcu_birth_timestamp INTEGER;
  ALTER TABLE users ADD COLUMN content_category TEXT;

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS content_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    medium TEXT NOT NULL,
    characters TEXT NOT NULL DEFAULT '[]',
    state TEXT NOT NULL DEFAULT 'liquid',
    act TEXT NOT NULL DEFAULT 'one',
    access_level TEXT NOT NULL DEFAULT 'player',
    tags TEXT NOT NULL DEFAULT '[]',
    connected_challenges TEXT NOT NULL DEFAULT '[]',
    duration TEXT,
    description TEXT,
    release_date INTEGER,
    featured INTEGER NOT NULL DEFAULT 0,
    price REAL,
    stripe_price_id TEXT,
    stripe_product_id TEXT,
    is_for_sale INTEGER NOT NULL DEFAULT 0,
    content_url TEXT,
    created_at INTEGER NOT NULL
  );

  -- Add new content_items columns if needed
  ALTER TABLE content_items ADD COLUMN price REAL;
  ALTER TABLE content_items ADD COLUMN stripe_price_id TEXT;
  ALTER TABLE content_items ADD COLUMN stripe_product_id TEXT;
  ALTER TABLE content_items ADD COLUMN is_for_sale INTEGER NOT NULL DEFAULT 0;
  ALTER TABLE content_items ADD COLUMN content_url TEXT;

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content_item_id INTEGER NOT NULL,
    stripe_payment_intent_id TEXT,
    stripe_session_id TEXT,
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT NOT NULL DEFAULT 'pending',
    delivery_status TEXT NOT NULL DEFAULT 'pending',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_unlocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content_item_id INTEGER NOT NULL,
    order_id INTEGER,
    unlocked_at INTEGER NOT NULL
  );
`);

// Helper: safely run ALTER TABLE (ignore "duplicate column" errors)
function safeAlter(sql: string) {
  try { sqlite.exec(sql); } catch (_) { /* column already exists */ }
}

safeAlter("ALTER TABLE users ADD COLUMN birth_name TEXT");
safeAlter("ALTER TABLE users ADD COLUMN birthdate TEXT");
safeAlter("ALTER TABLE users ADD COLUMN character_name TEXT");
safeAlter("ALTER TABLE users ADD COLUMN current_location TEXT");
safeAlter("ALTER TABLE users ADD COLUMN sun_sign TEXT");
safeAlter("ALTER TABLE users ADD COLUMN earth_chart_data TEXT");
safeAlter("ALTER TABLE users ADD COLUMN jcu_chart_data TEXT");
safeAlter("ALTER TABLE users ADD COLUMN jcu_birth_timestamp INTEGER");
safeAlter("ALTER TABLE users ADD COLUMN content_category TEXT");
safeAlter("ALTER TABLE content_items ADD COLUMN price REAL");
safeAlter("ALTER TABLE content_items ADD COLUMN stripe_price_id TEXT");
safeAlter("ALTER TABLE content_items ADD COLUMN stripe_product_id TEXT");
safeAlter("ALTER TABLE content_items ADD COLUMN is_for_sale INTEGER NOT NULL DEFAULT 0");
safeAlter("ALTER TABLE content_items ADD COLUMN content_url TEXT");

// ─── Sun sign calculation ───────────────────────────────────────────────────
export function calculateSunSign(birthdate: string): string {
  const [year, month, day] = birthdate.split("-").map(Number);
  const md = month * 100 + day;
  if (md >= 321 && md <= 419) return "aries";
  if (md >= 420 && md <= 520) return "taurus";
  if (md >= 521 && md <= 620) return "gemini";
  if (md >= 621 && md <= 722) return "cancer";
  if (md >= 723 && md <= 822) return "leo";
  if (md >= 823 && md <= 922) return "virgo";
  if (md >= 923 && md <= 1022) return "libra";
  if (md >= 1023 && md <= 1121) return "scorpio";
  if (md >= 1122 && md <= 1221) return "sagittarius";
  if (md >= 1222 || md <= 119) return "capricorn";
  if (md >= 120 && md <= 218) return "aquarius";
  return "pisces";
}

const ZODIAC_CONTENT_MAP: Record<string, string> = {
  aries: "comedies",
  taurus: "histories",
  gemini: "comedies",
  cancer: "histories",
  leo: "comedies",
  virgo: "mysteries",
  libra: "comedies",
  scorpio: "mysteries",
  sagittarius: "histories",
  capricorn: "histories",
  aquarius: "mysteries",
  pisces: "mysteries",
};

export function getContentCategoryForSign(sunSign: string): string {
  return ZODIAC_CONTENT_MAP[sunSign] ?? "comedies";
}

// ─── Storage interface ──────────────────────────────────────────────────────
export interface IStorage {
  // Users
  getUserByEmail(email: string): User | undefined;
  getUserById(id: number): User | undefined;
  createUser(data: { email: string; passwordHash: string; displayName?: string }): User;
  updateUser(id: number, data: Partial<Omit<User, "id" | "createdAt">>): User | undefined;

  // Sessions
  createSession(userId: number): Session;
  getSession(id: string): Session | undefined;
  deleteSession(id: string): void;
  deleteExpiredSessions(): void;

  // Content
  getAllContent(filters?: { category?: string; medium?: string; state?: string; accessLevel?: string }): ContentItem[];
  getContentBySlug(slug: string): ContentItem | undefined;
  getContentById(id: number): ContentItem | undefined;
  getContentCount(): number;
  seedContent(): void;

  // Orders & unlocks
  createOrder(data: { userId: number; contentItemId: number; amount: number; stripePaymentIntentId?: string; stripeSessionId?: string }): Order;
  getOrderByPaymentIntent(paymentIntentId: string): Order | undefined;
  updateOrderStatus(id: number, status: string, deliveryStatus?: string): Order | undefined;
  getUserUnlocks(userId: number): UserUnlock[];
  hasUserUnlocked(userId: number, contentItemId: number): boolean;
  unlockContentForUser(userId: number, contentItemId: number, orderId?: number): UserUnlock;
}

export const storage: IStorage = {
  getUserByEmail(email) {
    return db.select().from(users).where(eq(users.email, email)).get();
  },

  getUserById(id) {
    return db.select().from(users).where(eq(users.id, id)).get();
  },

  createUser(data) {
    const now = Date.now();
    return db.insert(users).values({
      email: data.email,
      passwordHash: data.passwordHash,
      displayName: data.displayName,
      userState: "solid",
      gameActive: false,
      onboardingComplete: false,
      createdAt: now,
    }).returning().get();
  },

  updateUser(id, data) {
    return db.update(users).set(data).where(eq(users.id, id)).returning().get();
  },

  createSession(userId) {
    const id = crypto.randomUUID();
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    return db.insert(sessions).values({ id, userId, expiresAt, createdAt: now }).returning().get();
  },

  getSession(id) {
    const session = db.select().from(sessions).where(eq(sessions.id, id)).get();
    if (!session) return undefined;
    if (session.expiresAt < Date.now()) {
      storage.deleteSession(id);
      return undefined;
    }
    return session;
  },

  deleteSession(id) {
    db.delete(sessions).where(eq(sessions.id, id)).run();
  },

  deleteExpiredSessions() {
    sqlite.exec(`DELETE FROM sessions WHERE expires_at < ${Date.now()}`);
  },

  getAllContent(filters) {
    const items = db.select().from(contentItems).all();
    if (!filters) return items;
    return items.filter(item => {
      if (filters.category && item.category !== filters.category) return false;
      if (filters.medium && item.medium !== filters.medium) return false;
      if (filters.state && item.state !== filters.state) return false;
      if (filters.accessLevel && item.accessLevel !== filters.accessLevel) return false;
      return true;
    });
  },

  getContentBySlug(slug) {
    return db.select().from(contentItems).where(eq(contentItems.slug, slug)).get();
  },

  getContentById(id) {
    return db.select().from(contentItems).where(eq(contentItems.id, id)).get();
  },

  getContentCount() {
    const result = sqlite.prepare("SELECT COUNT(*) as count FROM content_items").get() as { count: number };
    return result.count;
  },

  seedContent() {
    const now = Date.now();
    const seed = [
      // Comedies
      {
        title: "The Weight of Lightness",
        slug: "weight-of-lightness",
        category: "comedies", medium: "film",
        description: "A woman discovers her capacity for joy is actually a structural mechanism. The universe finds this hilarious.",
        featured: true, isForSale: false, price: null,
        characters: "[]", tags: "[]", connectedChallenges: "[]",
        state: "liquid", act: "one", accessLevel: "all", createdAt: now,
      },
      {
        title: "Instructions for Staying",
        slug: "instructions-for-staying",
        category: "comedies", medium: "audio",
        description: "A meditation on belonging told through the language of leaving. Somehow funnier than it sounds.",
        featured: false, isForSale: false, price: null,
        characters: "[]", tags: "[]", connectedChallenges: "[]",
        state: "solid", act: "one", accessLevel: "player", createdAt: now,
      },
      // Histories
      {
        title: "The Field Before",
        slug: "field-before",
        category: "histories", medium: "book",
        description: "Origin account. The war. What the simulation was built on top of. Primary source material.",
        featured: true, isForSale: false, price: null,
        characters: "[]", tags: "[]", connectedChallenges: "[]",
        state: "solid", act: "one", accessLevel: "player", createdAt: now,
      },
      {
        title: "After Collapse: A Record",
        slug: "after-collapse",
        category: "histories", medium: "film",
        description: "The official record of the event that reorganized everything. Some entries have been redacted.",
        featured: false, isForSale: false, price: null,
        characters: "[]", tags: "[]", connectedChallenges: "[]",
        state: "liquid", act: "two", accessLevel: "player", createdAt: now,
      },
      // Mysteries
      {
        title: "Frequency Seven",
        slug: "frequency-seven",
        category: "mysteries", medium: "audio",
        description: "Coded signal. Not all recipients are meant to understand it at once. Return when you have traveled further.",
        featured: true, isForSale: false, price: null,
        characters: "[]", tags: "[]", connectedChallenges: "[]",
        state: "gas", act: "two", accessLevel: "initiate", createdAt: now,
      },
      {
        title: "The Letter Dove Didn't Send",
        slug: "letter-dove-didnt-send",
        category: "mysteries", medium: "book",
        description: "Found in the archive. Addressed to no one. Contains everything.",
        featured: false, isForSale: false, price: null,
        characters: "[]", tags: "[]", connectedChallenges: "[]",
        state: "liquid", act: "one", accessLevel: "player", createdAt: now,
      },
      // Archives — The 5 launch texts (for sale at $9.99)
      {
        title: "The Game Manual v1",
        slug: "game-manual-v1",
        category: "archives", medium: "pdf",
        description: "These are recovered texts. Ancient. Fragmentary by design. What the simulation is made of — rules, cosmology, and the map. Start here if you are lost.",
        featured: true, isForSale: true, price: 9.99,
        characters: "[]", tags: "[]", connectedChallenges: "[]",
        state: "solid", act: "na", accessLevel: "all", createdAt: now,
      },
      {
        title: "The Angelic Manifesto v1",
        slug: "angelic-manifesto-v1",
        category: "archives", medium: "pdf",
        description: "These are recovered texts. Ancient. Fragmentary by design. The declaration that preceded the collapse. Authored by someone who no longer exists.",
        featured: true, isForSale: true, price: 9.99,
        characters: "[]", tags: "[]", connectedChallenges: "[]",
        state: "solid", act: "na", accessLevel: "all", createdAt: now,
      },
      {
        title: "The Creation Myth v1",
        slug: "creation-myth-v1",
        category: "archives", medium: "pdf",
        description: "These are recovered texts. Ancient. Fragmentary by design. Before the simulation. Before the war. The story of what was made and why.",
        featured: false, isForSale: true, price: 9.99,
        characters: "[]", tags: "[]", connectedChallenges: "[]",
        state: "solid", act: "na", accessLevel: "all", createdAt: now,
      },
      {
        title: "The Land History v1",
        slug: "land-history-v1",
        category: "archives", medium: "pdf",
        description: "These are recovered texts. Ancient. Fragmentary by design. A cartography of places that no longer exist in the form they were first named.",
        featured: false, isForSale: true, price: 9.99,
        characters: "[]", tags: "[]", connectedChallenges: "[]",
        state: "solid", act: "na", accessLevel: "all", createdAt: now,
      },
      {
        title: "Dove's Letter",
        slug: "doves-letter",
        category: "archives", medium: "pdf",
        description: "These are recovered texts. Ancient. Fragmentary by design. Found in the archive. Addressed to no one. Contains everything.",
        featured: false, isForSale: true, price: 9.99,
        characters: "[]", tags: "[]", connectedChallenges: "[]",
        state: "solid", act: "na", accessLevel: "all", createdAt: now,
      },
    ];

    for (const item of seed) {
      db.insert(contentItems).values(item as any).run();
    }
  },

  createOrder(data) {
    const now = Date.now();
    return db.insert(orders).values({
      userId: data.userId,
      contentItemId: data.contentItemId,
      amount: data.amount,
      stripePaymentIntentId: data.stripePaymentIntentId,
      stripeSessionId: data.stripeSessionId,
      status: "pending",
      deliveryStatus: "pending",
      currency: "usd",
      createdAt: now,
    }).returning().get();
  },

  getOrderByPaymentIntent(paymentIntentId) {
    return db.select().from(orders).where(eq(orders.stripePaymentIntentId, paymentIntentId)).get();
  },

  updateOrderStatus(id, status, deliveryStatus) {
    const update: any = { status };
    if (deliveryStatus) update.deliveryStatus = deliveryStatus;
    return db.update(orders).set(update).where(eq(orders.id, id)).returning().get();
  },

  getUserUnlocks(userId) {
    return db.select().from(userUnlocks).where(eq(userUnlocks.userId, userId)).all();
  },

  hasUserUnlocked(userId, contentItemId) {
    const unlock = db.select().from(userUnlocks)
      .where(and(eq(userUnlocks.userId, userId), eq(userUnlocks.contentItemId, contentItemId)))
      .get();
    return !!unlock;
  },

  unlockContentForUser(userId, contentItemId, orderId) {
    const now = Date.now();
    return db.insert(userUnlocks).values({
      userId, contentItemId, orderId, unlockedAt: now,
    }).returning().get();
  },
};
