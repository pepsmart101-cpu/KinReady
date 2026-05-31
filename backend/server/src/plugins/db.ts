import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { createClient, Client } from '@libsql/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

declare module 'fastify' {
  interface FastifyInstance {
    db: Client;
  }
}

async function runMigrations(db: Client) {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const migrationsPath = join(__dirname, '../../../migrations');
  
  try {
    const schemaSql = readFileSync(join(migrationsPath, '001_initial_schema.sql'), 'utf-8');
    // Split by semicolons and execute each statement
    const statements = schemaSql.split(';').filter(s => s.trim().length > 0);
    for (const stmt of statements) {
      await db.execute(stmt.trim() + ';');
    }
    console.log('Database schema applied successfully.');
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      console.log('No migration files found, skipping.');
    } else {
      console.error('Migration error:', err.message);
    }
  }
}

async function dbPlugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
  const url = process.env.DATABASE_URL || 'file:kinready.db';
  const client = createClient({
    url,
  });

  fastify.decorate('db', client);

  // Auto-run migrations on startup
  await runMigrations(client);

  fastify.addHook('onClose', async (instance) => {
    await instance.db.close();
  });
}

export default fp(dbPlugin);
