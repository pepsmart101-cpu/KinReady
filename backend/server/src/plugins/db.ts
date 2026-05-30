import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { createClient, Client } from '@libsql/client';

declare module 'fastify' {
  interface FastifyInstance {
    db: Client;
  }
}

async function dbPlugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
  const url = process.env.DATABASE_URL || 'file:kinready.db';
  const client = createClient({
    url,
  });

  fastify.decorate('db', client);

  fastify.addHook('onClose', async (instance) => {
    await instance.db.close();
  });
}

export default fp(dbPlugin);
