import fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import dbPlugin from './plugins/db.js';
import authPlugin from './plugins/auth.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import contentRoutes from './routes/content.js';
import documentRoutes from './routes/documents.js';
import vaultRoutes from './routes/vault.js';
import workflowRoutes from './routes/workflows.js';
import aiRoutes from './routes/ai.js';
import familyRoutes from './routes/family.js';
import { logAudit } from './middleware/audit.js';
import { z } from 'zod';

// Environment variable validation
const envSchema = z.object({
  DATABASE_URL: z.string().default('file:kinready.db'),
  JWT_SECRET: z.string().min(32, "JWT_SECRET should be at least 32 characters"),
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  JWT_EXPIRES_IN: z.string().default('24h'),
});

const env = envSchema.parse(process.env);

const server = fastify({
  logger: env.NODE_ENV === 'development',
});

// Plugins
server.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "validator.swagger.io"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://kinready-api.onrender.com"],
    },
  },
  hsts: env.NODE_ENV === 'production',
});

server.register(cors, {
  origin: env.FRONTEND_URL.split(','),
  credentials: true,
});

server.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

server.register(dbPlugin);
server.register(authPlugin);

// Global audit logging for mutations
server.addHook('onResponse', async (request, reply) => {
  if (request.method !== 'GET' && request.user) {
    const user = request.user as { id: string };
    await logAudit(server, user.id, request.method, request.url, undefined, `Status: ${reply.statusCode}`);
  }
});

// Routes
server.register(authRoutes, { prefix: '/api/v1/auth' });
server.register(userRoutes, { prefix: '/api/v1/users' });
server.register(contentRoutes, { prefix: '/api/v1/content' });
server.register(documentRoutes, { prefix: '/api/v1/documents' });
server.register(vaultRoutes, { prefix: '/api/v1/vault' });
server.register(workflowRoutes, { prefix: '/api/v1/workflows' });
server.register(aiRoutes, { prefix: '/api/v1/ai' });
server.register(familyRoutes, { prefix: '/api/v1/family' });

server.get('/health', async () => {
  return { status: 'ok' };
});

const start = async () => {
  try {
    const port = parseInt(env.PORT);
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening at http://0.0.0.0:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
