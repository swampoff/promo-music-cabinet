import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import routes from "./routes.tsx";
import authRoutes from "./auth-routes.tsx";
import concertsRoutes from "./concerts-routes.tsx";
import notificationsRoutes from "./notifications-routes.tsx";
import ticketingRoutes from "./ticketing-routes.tsx";
import storageRoutes from "./storage-routes.tsx";
import migrationRoutes from "./migration-routes.tsx";
import marketingCampaignsRoutes from "./marketing-campaigns-routes.tsx";
import subscriptionsRoutes from "./subscriptions-routes.tsx";
import promotionRoutes from "./promotion-routes-sql.tsx"; // Обновлённая версия с SQL
import bannerRoutes from "./banner-routes.tsx"; // Баннерная реклама
import notificationsMessengerRoutes from "./notifications-messenger-routes.tsx"; // Уведомления и мессенджер
import emailRoutes from "./email-routes.tsx"; // Email система
import ticketsSystemRoutes from "./tickets-system-routes.tsx"; // Система тикетов
import paymentsRoutes from "./payments-routes.tsx"; // Система платежей
import { initializeStorage } from "./storage-setup.tsx";
import { initializeDatabase } from "./db-init.tsx"; // SQL инициализация

const app = new Hono();

// Initialize Database and Storage on server start
console.log('🚀 Starting Promo.Music Server...');

// 1. Initialize SQL tables
initializeDatabase().then(result => {
  if (result) {
    console.log('✅ Database tables initialized successfully');
  }
}).catch(error => {
  console.error('❌ Database initialization error:', error);
});

// 2. Initialize Storage
initializeStorage().then(result => {
  if (result.success) {
    console.log('✅ Storage initialized successfully');
    if (result.bucketsCreated.length > 0) {
      console.log('📦 Buckets created:', result.bucketsCreated.join(', '));
    } else {
      console.log('📦 All buckets already exist');
    }
  } else {
    // Only show errors if there are actual errors (not just "already exists")
    if (result.errors.length > 0) {
      console.error('❌ Storage initialization failed:', result.errors);
    } else {
      console.log('✅ Storage initialized (all buckets already exist)');
    }
  }
}).catch(error => {
  console.error('❌ Storage initialization error:', error);
});

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-User-Id"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-84730125/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount all API routes
app.route("/make-server-84730125/api", routes);

// Mount auth routes
app.route("/make-server-84730125/auth", authRoutes);

// Mount concerts routes
app.route("/make-server-84730125/concerts", concertsRoutes);

// Mount notifications routes
app.route("/make-server-84730125/notifications", notificationsRoutes);

// Mount ticketing routes
app.route("/make-server-84730125/ticketing", ticketingRoutes);

// Mount storage routes
app.route("/make-server-84730125/storage", storageRoutes);

// Mount migration routes
app.route("/make-server-84730125/migration", migrationRoutes);

// Mount marketing campaigns routes
app.route("/make-server-84730125/marketing-campaigns", marketingCampaignsRoutes);

// Mount subscriptions routes
app.route("/make-server-84730125/subscriptions", subscriptionsRoutes);

// Mount promotion routes
app.route("/make-server-84730125/promotion", promotionRoutes);

// Mount banner routes
app.route("/make-server-84730125/banner", bannerRoutes);

// Mount notifications & messenger routes
app.route("/make-server-84730125/notifications-messenger", notificationsMessengerRoutes);

// Mount email routes
app.route("/make-server-84730125/email", emailRoutes);

// Mount tickets system routes
app.route("/make-server-84730125/tickets-system", ticketsSystemRoutes);

// Mount payments routes
app.route("/make-server-84730125/payments", paymentsRoutes);

// 404 handler
app.notFound((c) => {
  const path = c.req.path;
  const method = c.req.method;
  console.warn(`⚠️ Route not found: ${method} ${path}`);
  return c.json({ 
    success: false, 
    error: "Route not found",
    path,
    method,
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ 
    success: false, 
    error: err.message || "Internal server error" 
  }, 500);
});

Deno.serve(app.fetch);