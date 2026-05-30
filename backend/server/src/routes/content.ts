import { FastifyInstance } from 'fastify';

export default async function contentRoutes(fastify: FastifyInstance) {
  fastify.get('/education', async (request, reply) => {
    const result = await fastify.db.execute('SELECT id, title, slug, category, tags FROM educational_content');
    return result.rows;
  });

  fastify.get('/education/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const result = await fastify.db.execute({
      sql: 'SELECT * FROM educational_content WHERE slug = ?',
      args: [slug],
    });

    if (result.rows.length === 0) {
      return reply.status(404).send({ error: 'Article not found' });
    }

    return result.rows[0];
  });

  fastify.get('/scripts', async (request, reply) => {
    const result = await fastify.db.execute('SELECT id, title, scenario FROM phone_scripts');
    return result.rows;
  });

  fastify.get('/scripts/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await fastify.db.execute({
      sql: 'SELECT * FROM phone_scripts WHERE id = ?',
      args: [id],
    });

    if (result.rows.length === 0) {
      return reply.status(404).send({ error: 'Script not found' });
    }

    return result.rows[0];
  });
}
