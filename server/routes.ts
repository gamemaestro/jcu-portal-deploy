import type { Express } from "express";
import { Server } from "http";
import bcryptjs from "bcryptjs";
import { storage, calculateSunSign, getContentCategoryForSign } from "./storage";
import { z } from "zod";
import Stripe from "stripe";

// Init Stripe (uses env var, safe to initialize even if key is placeholder)
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-01-27.acacia" as any })
  : null;

// Seed data on startup
if (storage.getContentCount() === 0) {
  storage.seedContent();
  console.log("[JCU] Seeded content items");
}

// Helper to get session from cookie or header
function getSessionId(req: any): string | undefined {
  if (req.cookies?.jcu_session) return req.cookies.jcu_session;
  const cookieHeader = req.headers.cookie || "";
  const cookieMatch = cookieHeader.match(/jcu_session=([^;]+)/);
  if (cookieMatch) return decodeURIComponent(cookieMatch[1]);
  return req.headers["x-session-id"] as string | undefined;
}

// Auth middleware
function requireAuth(req: any, res: any): { userId: number } | null {
  const sessionId = getSessionId(req);
  if (!sessionId) { res.status(401).json({ error: "Not authenticated" }); return null; }
  const session = storage.getSession(sessionId);
  if (!session) { res.status(401).json({ error: "Session expired" }); return null; }
  return { userId: session.userId };
}

export function registerRoutes(httpServer: Server, app: Express) {

  // ─── Auth ─────────────────────────────────────────────────────────────────

  app.post("/api/auth/register", async (req, res) => {
    try {
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
        displayName: z.string().optional(),
      });
      const { email, password, displayName } = schema.parse(req.body);

      const existing = storage.getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ error: "An account with this email already exists." });
      }

      const passwordHash = await bcryptjs.hash(password, 12);
      const user = storage.createUser({ email, passwordHash, displayName });
      const session = storage.createSession(user.id);

      const isProduction = process.env.NODE_ENV === "production";
      res.cookie("jcu_session", session.id, {
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      const { passwordHash: _, ...safeUser } = user;
      return res.json({ user: safeUser, sessionId: session.id });
    } catch (err: any) {
      if (err.name === "ZodError") return res.status(400).json({ error: err.errors[0]?.message || "Invalid input" });
      console.error("[register]", err);
      return res.status(500).json({ error: "Registration failed." });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(1),
      });
      const { email, password } = schema.parse(req.body);

      const user = storage.getUserByEmail(email);
      if (!user || !user.passwordHash) return res.status(401).json({ error: "Invalid email or password." });

      const valid = await bcryptjs.compare(password, user.passwordHash);
      if (!valid) return res.status(401).json({ error: "Invalid email or password." });

      const session = storage.createSession(user.id);

      const isProduction = process.env.NODE_ENV === "production";
      res.cookie("jcu_session", session.id, {
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      const { passwordHash: _, ...safeUser } = user;
      return res.json({ user: safeUser, sessionId: session.id });
    } catch (err: any) {
      if (err.name === "ZodError") return res.status(400).json({ error: err.errors[0]?.message || "Invalid input" });
      console.error("[login]", err);
      return res.status(500).json({ error: "Login failed." });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    const sessionId = getSessionId(req);
    if (sessionId) storage.deleteSession(sessionId);
    res.clearCookie("jcu_session", { path: "/" });
    return res.json({ ok: true });
  });

  app.get("/api/auth/me", (req, res) => {
    const sessionId = getSessionId(req);
    if (!sessionId) return res.status(401).json({ error: "No session" });
    const session = storage.getSession(sessionId);
    if (!session) return res.status(401).json({ error: "Session expired or invalid" });
    const user = storage.getUserById(session.userId);
    if (!user) return res.status(401).json({ error: "User not found" });
    const { passwordHash: _, ...safeUser } = user;
    return res.json({ user: safeUser });
  });

  // ─── Onboarding ───────────────────────────────────────────────────────────
  // Complete onboarding — saves all birth data, computes sun sign + category

  app.post("/api/onboarding/complete", async (req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;

    try {
      const schema = z.object({
        birthName: z.string().min(1),
        birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        characterName: z.string().min(1),
        currentLocation: z.string().min(1),
      });
      const { birthName, birthdate, characterName, currentLocation } = schema.parse(req.body);

      const sunSign = calculateSunSign(birthdate);
      const contentCategory = getContentCategoryForSign(sunSign);
      const jcuBirthTimestamp = Date.now();

      // Store both chart placeholders — full calculation can be layered in later
      const earthChartData = JSON.stringify({ sunSign, birthdate, calculatedAt: jcuBirthTimestamp });
      const jcuChartData = JSON.stringify({ location: currentLocation, birthTimestamp: jcuBirthTimestamp });

      const updatedUser = storage.updateUser(auth.userId, {
        birthName,
        birthdate,
        characterName,
        displayName: characterName, // use character name as display name going forward
        currentLocation,
        sunSign,
        contentCategory,
        jcuBirthTimestamp,
        earthChartData,
        jcuChartData,
        onboardingComplete: true,
      });

      if (!updatedUser) return res.status(404).json({ error: "User not found" });
      const { passwordHash: _, ...safeUser } = updatedUser;
      return res.json({ user: safeUser, contentCategory, sunSign });
    } catch (err: any) {
      if (err.name === "ZodError") return res.status(400).json({ error: err.errors[0]?.message || "Invalid input" });
      console.error("[onboarding]", err);
      return res.status(500).json({ error: "Onboarding failed." });
    }
  });

  // ─── Content ──────────────────────────────────────────────────────────────

  app.get("/api/content", (req, res) => {
    const { category, medium, state, accessLevel } = req.query as Record<string, string>;
    const items = storage.getAllContent({ category, medium, state, accessLevel });
    return res.json(items);
  });

  app.get("/api/content/:slug", (req, res) => {
    const item = storage.getContentBySlug(req.params.slug);
    if (!item) return res.status(404).json({ error: "Not found" });
    return res.json(item);
  });

  // Returns which content items the current user has unlocked
  app.get("/api/unlocks", (req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const unlocks = storage.getUserUnlocks(auth.userId);
    return res.json(unlocks.map(u => u.contentItemId));
  });

  // ─── Stripe Payments ──────────────────────────────────────────────────────

  // Create a payment intent for a content item
  app.post("/api/stripe/create-payment-intent", async (req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;

    if (!stripe) {
      return res.status(503).json({ error: "Payment processing not configured." });
    }

    try {
      const schema = z.object({ contentItemId: z.number().int() });
      const { contentItemId } = schema.parse(req.body);

      const item = storage.getContentById(contentItemId);
      if (!item) return res.status(404).json({ error: "Item not found" });
      if (!item.isForSale || item.price == null) return res.status(400).json({ error: "Item is not for sale" });

      // Check if already unlocked
      if (storage.hasUserUnlocked(auth.userId, contentItemId)) {
        return res.status(409).json({ error: "You already own this item." });
      }

      const amountCents = Math.round(item.price * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: "usd",
        metadata: {
          userId: String(auth.userId),
          contentItemId: String(contentItemId),
          itemTitle: item.title,
        },
      });

      // Create a pending order
      storage.createOrder({
        userId: auth.userId,
        contentItemId,
        amount: item.price,
        stripePaymentIntentId: paymentIntent.id,
      });

      return res.json({
        clientSecret: paymentIntent.client_secret,
        amount: item.price,
        itemTitle: item.title,
      });
    } catch (err: any) {
      console.error("[stripe/create-payment-intent]", err);
      return res.status(500).json({ error: "Failed to create payment intent." });
    }
  });

  // Stripe webhook — handles payment_intent.succeeded
  app.post("/api/stripe/webhook", async (req, res) => {
    if (!stripe) return res.status(503).json({ error: "Stripe not configured" });

    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
      if (webhookSecret && sig) {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } else {
        // Dev mode: parse body directly
        event = req.body as Stripe.Event;
      }
    } catch (err: any) {
      console.error("[stripe webhook] signature verification failed:", err.message);
      return res.status(400).json({ error: "Webhook signature invalid" });
    }

    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const order = storage.getOrderByPaymentIntent(pi.id);

      if (order) {
        storage.updateOrderStatus(order.id, "paid", "delivered");
        storage.unlockContentForUser(order.userId, order.contentItemId, order.id);
        console.log(`[JCU] Unlocked content ${order.contentItemId} for user ${order.userId}`);
      }
    }

    return res.json({ received: true });
  });
}
